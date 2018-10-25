import React from "react";
import PropTypes from "prop-types";
import {Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Bar} from "recharts";

export default class Reactions extends React.Component {
    render () {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={convertReactionStats(this.props.data)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis/>
                    <Radar name="Mike" dataKey="count" fill="#3f51b5"/>
                </RadarChart>
            </ResponsiveContainer>
        )
    }
}

Reactions.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        count: PropTypes.number,
    }))
};

function convertReactionStats(moiraStats) {
    return Object.keys(moiraStats).map(item => ({name: item, count: moiraStats[item]}))
}
