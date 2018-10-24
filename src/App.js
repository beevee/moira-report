import React from "react"
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, CssBaseline } from "@material-ui/core";
import Report from "./Report";
import Menu from "./Menu";

const drawerWidth = 200;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
        },
    },
});

class App extends React.Component {
    render() {
        const { classes } = this.props;
        const { channelName } = this.props.match.params;
        return (
            <div className={classes.root}>
                <CssBaseline/>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" color="inherit" noWrap>
                            {channelName ? "Статистика по каналу #" + channelName : "Статистика по каналам"}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Menu channelName={channelName}/>

                <Report channelName={channelName}/>
            </div>
        )
    }
}

App.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(App);

