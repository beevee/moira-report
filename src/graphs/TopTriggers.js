import React from "react";
import PropTypes from "prop-types";
import { Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import Emoji from "node-emoji";

export default class TopTriggers extends React.Component {
    render () {
        const topTriggers = getTopTriggers(this.props.data);
        const allReactions = getAllReactions(topTriggers);

        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Триггер</TableCell>
                        {allReactions.map(col => {
                            return <TableCell numeric key={col}>{Emoji.get(col)}</TableCell>;
                        })}
                        <TableCell numeric>Всего</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {topTriggers.map(row => {
                        return (
                            <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                    {row.link && <a href={row.link} target="_blank" rel="noopener noreferrer">{row.name}</a>}
                                    {!row.link && row.name}
                                </TableCell>
                                {allReactions.map(col => {
                                    return <TableCell numeric key={col}>{row.reactions[col]}</TableCell>;
                                })}
                                <TableCell numeric>{row.count}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        )
    }
}

TopTriggers.propTypes = {
    data: PropTypes.object
};

function getTopTriggers(moiraStats) {
    return Object.keys(moiraStats)
        .map(item => ({
            'name': item,
            'count': moiraStats[item].count,
            'reactions': moiraStats[item].reactions,
            'link': moiraStats[item].link }))
        .sort((a, b) => a.count > b.count ? -1 : 1)
        .slice(0, 10)
}

function getAllReactions(topTriggers) {
    return [...new Set(topTriggers
        .map(value => Object.keys(value.reactions))
        .reduce((r, k) => r.concat(k), []))];
}

