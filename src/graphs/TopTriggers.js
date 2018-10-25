import React from "react";
import PropTypes from "prop-types";
import { Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';

export default class TopTriggers extends React.Component {
    render () {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Триггер</TableCell>
                        <TableCell numeric>Количество сообщений</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {getTopTriggers(this.props.data).map(row => {
                        return (
                            <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                    {row.link && <a href={row.link} target="_blank" rel="noopener noreferrer">{row.name}</a>}
                                    {!row.link && row.name}
                                </TableCell>
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
        .map(item => ({ 'name': item, 'count': moiraStats[item].count, 'link': moiraStats[item].link }))
        .sort((a, b) => a.count > b.count ? -1 : 1)
        .slice(0, 10)
}

