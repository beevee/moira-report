const moiraBotId = process.env.MOIRA_REPORT_BOT_ID;
let moiraBotUserId = "";

const { WebClient } = require('@slack/client');
const web = new WebClient(process.env.MOIRA_REPORT_SLACK_TOKEN);

const moment = require('moment');

const express = require('express');
const app = express();
const port = 9090;

app.listen(port, (err) => {
    if (err) {
        console.error(err)
    }

    console.log("started, getting moiraBotUserId from api");

    web.bots.info({bot: moiraBotId})
        .then(res => {
            if (res.ok) {
                moiraBotUserId = res.bot.user_id;
                console.log(`moiraBotUserId is ${moiraBotUserId}`);
            } else {
                console.log("bot by given moiraBotId not found'");
            }
        });
});

app.get('/api', (request, response, next) => {
    web.conversations.list({ types: "public_channel,private_channel" })
    .then(results => {
        response.json(results.channels.filter(channel => channel.is_member).map(channel => channel.name));
    })
    .catch(next)
});

app.get('/api/:channelName', (request, response, next) => {
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

    web.conversations.list({ types: "public_channel,private_channel" })
    .then(results => {
        const conversationId = results.channels.filter(ch => ch.is_member && ch.name === request.params.channelName)[0].id;

        web.conversations.history({
            channel: conversationId,
            limit: 1000,
            oldest: moment().subtract(7, 'days').unix(),
            latest: moment().unix(),
        })
        .then(res => {
            console.log(`Got ${res.messages.length} messages`);
            const titleRegexp = /\*(\w+)\* (\[.+])? <(.+)\|(.+)>/;
            res.messages.forEach(msg => {
            if (msg.bot_id === moiraBotId) {
                stats.moira.total++;

                const titleMatch = titleRegexp.exec(msg.text);
                // const level = titleMatch ? titleMatch[1].toLowerCase() : 'unknown';
                const link = titleMatch ? titleMatch[3] : '';
                const name = titleMatch ? titleMatch[4] : 'unknown';

                const ts = moment(Math.floor(1000 * msg.ts));
                const dayKey = ts.format('DD.MM');
                stats.moira.byHour[dayKey] = stats.moira.byHour[dayKey] || {};
                for (let i=0; i<24; i++) {
                    stats.moira.byHour[dayKey][i] = stats.moira.byHour[dayKey][i] || 0;
                }
                stats.moira.byHour[dayKey][ts.hours()] += 1;

                const hasReplies = msg.replies && msg.replies.some(reply => reply.user !== moiraBotUserId);

                if (!msg.reactions && !hasReplies) {
                    stats.moira.byReaction['nothing'] = stats.moira.byReaction['nothing'] || 0;
                    stats.moira.byReaction['nothing'] += 1;
                }
                if (msg.reactions) {
                    msg.reactions.forEach(reaction => {
                        const reactionName = ':'+reaction.name+':';
                        stats.moira.byReaction[reactionName] = stats.moira.byReaction[reactionName] || 0;
                        stats.moira.byReaction[reactionName] += 1;
                    })
                }
                if (hasReplies) {
                    stats.moira.byReaction['thread'] = stats.moira.byReaction['thread'] || 0;
                    stats.moira.byReaction['thread'] += 1;
                }

                stats.moira.byTrigger[name] = stats.moira.byTrigger[name] || {'count': 0, 'link': link};
                stats.moira.byTrigger[name].count += 1;
            } else {
                stats.others.total++
            }
            });
            response.json(stats)
        })
        .catch(next)
    })
    .catch(next)
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});
