import React from "react";
import PropTypes from "prop-types";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip} from "recharts";

export default class Hourly extends React.Component {
    render () {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={convertHourlyStats(this.props.data)} fontFamily="Roboto">
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="hour"/>
                    <YAxis/>
                    <Tooltip/>
                    <Bar dataKey="ok" stackId="a" fill="rgb(0, 191, 165)"/>
                    <Bar dataKey="warn" stackId="a" fill="rgb(255, 193, 7)"/>
                    <Bar dataKey="error" stackId="a" fill="rgb(255, 87, 34)"/>
                    <Bar dataKey="nodata" stackId="a" fill="rgb(158, 158, 158)"/>
                </BarChart>
            </ResponsiveContainer>
        )
    }
}

Hourly.propTypes = {
    data: PropTypes.object
};

function convertHourlyStats(moiraStats) {
    return Object.keys(moiraStats).map(item => ({
        hour: item,
        ok: moiraStats[item].ok || 0,
        warn: moiraStats[item].warn || 0,
        error: moiraStats[item].error || 0,
        nodata: moiraStats[item].nodata || 0
    }))
}
