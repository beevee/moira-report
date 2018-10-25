import {Typography, Grid, Paper, withStyles} from "@material-ui/core";
import HourlyGraph from "./graphs/Hourly";
import ReactionsGraph from "./graphs/Reactions";
import PropTypes from "prop-types";
import React from "react";

const styles = theme => ({
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
    },
    paper: {
        padding: theme.spacing.unit * 2,
    },
});

class Report extends React.Component {
    constructor() {
        super();
        this.state = {
            stats: {}
        }
    }

    componentDidMount() {
        const { channelName } = this.props;
        if (this.state.stats[channelName] !== undefined) return;

        fetch(`//localhost:9090/${channelName}`)
            .then(response => response.json())
            .then(responseJson => {this.setState({stats:{
                ...this.state.stats,
                [channelName]: responseJson
            }})
            })
    }

    componentDidUpdate = this.componentDidMount;

    render() {
        const { classes, channelName } = this.props;
        const stats = this.state.stats[channelName];
        const total = stats && stats.moira.total + stats.others.total;

        return (
            <main className={classes.content}>
                <div className={classes.toolbar}/>
                {stats &&
                    <Grid container spacing={24}>
                        <Grid item xs={12}>
                            <Typography variant="subheading">
                                Мы анализируем историю канала за 30 дней, но не больше 1000 сообщений.
                                В этот отчет попало {total} сообщений, из них {stats.moira.total} — от Мойры.
                            </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper className={classes.paper}>
                                <Typography paragraph>
                                    Этот график показывает, сколько сообщений пришлось на каждый час. Время местное (там, где запущен moira-report).
                                    В идеальном чате нет сообщений ночью. От каждого такого сообщения просыпается дежурный.
                                </Typography>
                                <HourlyGraph data={stats.moira.byHour}/>
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper className={classes.paper}>
                                <Typography paragraph>
                                    Здесь учитывается реакция на сообщение. Это может быть ответ в тред, смайлик или отсутствие реакции (nothing).
                                    Если в команде есть договоренности относительно правил реагирования на алерты, этот график поможет найти отклонения.
                                </Typography>
                                <ReactionsGraph data={stats.moira.byReaction}/>
                            </Paper>
                        </Grid>
                    </Grid>
                }
            </main>
        );
    }
}

Report.propTypes = {
    channelName: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Report);
