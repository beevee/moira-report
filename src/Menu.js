import {Divider, Drawer, List, ListItem, ListItemText, withStyles} from "@material-ui/core";
import React from "react";
import PropTypes from "prop-types";
import {withRouter} from "react-router";

const drawerWidth = 200;

const styles = theme => ({
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
});

class Menu extends React.Component {
    constructor() {
        super();
        this.state = {
            channels: null
        }
    }

    componentDidMount() {
        fetch(`//${window.location.hostname}:9090/`)
            .then(response => response.json())
            .then(responseJson => {
                this.setState({channels: responseJson})
            });
    }

    render() {
        const { classes, channelName } = this.props;
        const { channels } = this.state;

        return (
            <nav className={classes.drawer}>
                {channels &&
                <Drawer variant="permanent" classes={{paper: classes.drawerPaper}}>
                    <div className={classes.toolbar}/>
                    <Divider/>
                    <List>
                        {channels.sort().map(text => (
                            <ListItem button selected={text === channelName} key={text} onClick={() => this.props.history.push("/" + text)}>
                                <ListItemText primary={"#" + text}/>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                }
            </nav>
        )
    }
}

Menu.propTypes = {
    channelName: PropTypes.string,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(Menu));

