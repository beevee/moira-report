const {WebClient} = require('@slack/client');
const moment = require('moment');
const cors = require('cors')
const express = require('express');
const morgan = require('morgan');
const winston = require('winston');

const app = express();
const port = 9090;

const moiraBotId = process.env.MOIRA_REPORT_BOT_ID;
const slackToken = process.env.MOIRA_REPORT_SLACK_TOKEN;

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.json(), winston.format.uncolorize()),
    transports: [
        new winston.transports.Console()
    ]
});

if (!moiraBotId)
    throw "Moira Bot identifier required";

logger.info("MOIRA_REPORT_BOT_ID provided");

if (!slackToken)
    throw "Slack Bot OAuth-token required";

logger.info("MOIRA_REPORT_SLACK_TOKEN provided");

async function start() {
    const slackClient = new WebClient(slackToken);

    const authRes = await slackClient.auth.test();
    if (!authRes.ok)
        throw authRes;

    logger.debug(`Self, team:${authRes.team_id}(${authRes.team}), `
        + `user:${authRes.user_id}(${authRes.user}), `
        + `bot:${authRes.bot_id}, `
        + `scopes:[${authRes.scopes}]`);

    const botRes = await slackClient.bots.info({bot: moiraBotId})
    if (!botRes.ok)
        throw botRes;

    logger.debug(`MoiraBot, id:${botRes.bot.id}, user:${botRes.bot.user_id}, `
        + `app:${botRes.bot.app_id}, deleted:${botRes.bot.deleted}, `
        + `scopes:[${botRes.scopes}]`);

    moiraBotUserId = botRes.bot.user_id;

    app.use(cors());
    app.options('*', cors());

    app.use(morgan('combined', {stream: {write: (message) => logger.http(message)}}));

    app.listen(port, () => {
        logger.info(`Now listening on: http://+:${port}`);
    });

    const fiveMinutes = 5 * 60 * 1000;

    let conversationsUpdatedAt = undefined;
    let conversations = [];
    app.get('/api', (request, response, next) => {

        const now = new Date();
        if (conversationsUpdatedAt && now.getTime() - conversationsUpdatedAt.getTime() < fiveMinutes) {
            logger.info("Cache hit!");

            response.json(conversations);
            return;
        }

        logger.info("Cache miss!");

        slackClient.conversations
            .list({types: "public_channel,private_channel"})
            .then(results => {

                conversationsUpdatedAt = now;
                conversations = results.channels
                    .filter(channel => channel.is_member)
                    .map(channel => channel.name);

                logger.info(`Got ${conversations.length} channels`);

                response.json(conversations);
                return;
            })
            .catch(next);
    });


    const channelStats = {};
    app.get('/api/:channelName', (request, response, next) => {

        const now = new Date();
        const channelName = request.params.channelName;

        if (channelStats.hasOwnProperty(channelName)) {
            const statsUpdatedAt = channelStats[channelName].statsUpdatedAt;

            if (statsUpdatedAt && now.getTime() - statsUpdatedAt.getTime() < fiveMinutes) {
                logger.info("Cache hit!");

                response.json(channelStats[channelName].stats);
                return;
            }
        }

        logger.info("Cache miss!");

        const stats = {
            moira: {
                total: 0,
                byHour: {},
                byReaction: {},
                byTrigger: {},
            },
            others: {
                total: 0
            }
        };

        slackClient.conversations
            .list({types: "public_channel,private_channel"})
            .then(results => {

                const conversations = results.channels
                    .filter(ch => ch.is_member && ch.name === channelName);

                if (conversations.length === 0) {
                    logger.error(`Channel '${channelName}' not found`);
                    response.status(404).send('Channel not found');
                }

                logger.info(`Channel '${channelName}' found`);
                const conversationId = conversations[0].id;

                slackClient.conversations.history({
                    channel: conversationId,
                    limit: 1000,
                    oldest: moment().subtract(7, 'days').unix(),
                    latest: moment().unix(),
                })
                    .then(res => {
                        logger.info(`Got ${res.messages.length} messages`);

                        const titleRegexp = /\*(\w+)\* <(.+)\|(.+)>( \[.+])?/;

                        res.messages.forEach(msg => {
                            if (msg.bot_id === moiraBotId) {
                                stats.moira.total++;

                                const titleMatch = titleRegexp.exec(msg.text);
                                const link = titleMatch ? titleMatch[2] : '';
                                const name = titleMatch ? titleMatch[3] : 'unknown';

                                const ts = moment(Math.floor(1000 * msg.ts));
                                const dayKey = ts.format('DD.MM');
                                stats.moira.byHour[dayKey] = stats.moira.byHour[dayKey] || {};
                                stats.moira.byTrigger[name] = stats.moira.byTrigger[name] || {
                                    'count': 0,
                                    'link': link,
                                    'reactions': {}
                                };

                                for (let i = 0; i < 24; i++) {
                                    stats.moira.byHour[dayKey][i] = stats.moira.byHour[dayKey][i] || 0;
                                }
                                stats.moira.byHour[dayKey][ts.hours()] += 1;

                                const hasReplies = msg.replies && msg.replies.some(reply => reply.user !== moiraBotUserId);

                                if (!msg.reactions && !hasReplies) {
                                    stats.moira.byReaction['nothing'] = stats.moira.byReaction['nothing'] || 0;
                                    stats.moira.byReaction['nothing'] += 1;
                                    stats.moira.byTrigger[name]['reactions']['nothing'] = stats.moira.byTrigger[name]['reactions']['nothing'] || 0;
                                    stats.moira.byTrigger[name]['reactions']['nothing'] += 1;
                                }
                                if (msg.reactions) {
                                    msg.reactions.forEach(reaction => {
                                        const reactionName = ':' + reaction.name + ':';
                                        stats.moira.byReaction[reactionName] = stats.moira.byReaction[reactionName] || 0;
                                        stats.moira.byReaction[reactionName] += 1;
                                        stats.moira.byTrigger[name]['reactions'][reactionName] = stats.moira.byTrigger[name]['reactions'][reactionName] || 0;
                                        stats.moira.byTrigger[name]['reactions'][reactionName] += 1;
                                    })
                                }
                                if (hasReplies) {
                                    stats.moira.byReaction['thread'] = stats.moira.byReaction['thread'] || 0;
                                    stats.moira.byReaction['thread'] += 1;
                                    stats.moira.byTrigger[name]['reactions']['thread'] = stats.moira.byTrigger[name]['reactions']['thread'] || 0;
                                    stats.moira.byTrigger[name]['reactions']['thread'] += 1;
                                }

                                stats.moira.byTrigger[name]['count'] += 1;
                            } else {
                                stats.others.total++
                            }
                        });

                        channelStats[channelName] = {statsUpdatedAt: now, stats};
                        response.json(stats);
                    })
                    .catch(next)
            })
            .catch(next)
    });

    app.use(function (err, req, res, next) {
        logger.error(err.message, err.stack);
        res.status(500).json({error: err.message});
    });
};

start();

