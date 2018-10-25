const moiraBotId = process.env.MOIRA_REPORT_BOT_ID;

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

    console.log("started")
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (request, response) => {
    web.conversations.list({ types: "public_channel,private_channel" })
    .then(results => {
        response.json(results.channels.filter(channel => channel.is_member).map(channel => channel.name));
    })
});

app.get('/:channelName', (request, response) => {
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

    for (let i=0; i<24; i++) {
        stats.moira.byHour[i] = {}
    }

    web.conversations.list({ types: "public_channel,private_channel" })
    .then(results => {
        const conversationId = results.channels.filter(ch => ch.is_member && ch.name === request.params.channelName)[0].id;
    
        web.conversations.history({ channel: conversationId, limit: 1000, oldest: moment().subtract(30, 'days').unix() })
        .then(res => {
            console.log(`Got ${res.messages.length} messages`);
            const titleRegexp = /\*(\w+)\* \[.+] <(.+)\|(.+)>/;
            res.messages.forEach(msg => {
            if (msg.bot_id === moiraBotId) {
                stats.moira.total++;

                const titleMatch = titleRegexp.exec(msg.text);
                const level = titleMatch ? titleMatch[1].toLowerCase() : 'unknown';
                const link = titleMatch ? titleMatch[2] : '';
                const name = titleMatch ? titleMatch[3] : 'unknown';

                const ts = moment(Math.floor(1000 * msg.ts));
                stats.moira.byHour[ts.hours()][level] = stats.moira.byHour[ts.hours()][level] || 0;
                stats.moira.byHour[ts.hours()][level] += 1;

                if (!msg.reactions && !msg.replies) {
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
                if (msg.replies) {
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
        .catch(console.error)
    })
    .catch(console.error)
});

