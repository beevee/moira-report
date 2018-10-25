import React from "react";
import PropTypes from "prop-types";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer} from "recharts";

export default class Hourly extends React.Component {
    render () {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={convertHourlyStats(this.props.data)} fontFamily="Roboto">
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="hour"/>
                    <YAxis/>
                    <Bar dataKey="count" fill="#3f51b5"/>
                </BarChart>
            </ResponsiveContainer>
        )
    }
}

Hourly.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        hour: PropTypes.string,
        count: PropTypes.number,
    }))
}

function convertHourlyStats(moiraStats) {
    return Object.keys(moiraStats).map(item => ({hour: item, count: moiraStats[item]}))
}
