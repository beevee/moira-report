import React from "react";
import PropTypes from "prop-types";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from "recharts";

export default class Reactions extends React.Component {
    render () {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={convertReactionStats(this.props.data)} fontFamily="Roboto">
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
    data: PropTypes.object
};

function convertReactionStats(moiraStats) {
    return Object.keys(moiraStats).map(item => ({name: item, count: moiraStats[item]})).sort((a, b) => a.count > b.count ? -1 : 1)
}
