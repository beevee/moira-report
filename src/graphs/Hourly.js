import React from "react"
import PropTypes from "prop-types"

import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts"

export default class SimpleBarChart extends React.Component {
    render () {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={this.props.data} fontFamily="Roboto">
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="hour"/>
                    <YAxis/>
                    <Tooltip/>
                    <Bar dataKey="count" fill="#3f51b5"/>
                </BarChart>
            </ResponsiveContainer>
        )
    }
}

SimpleBarChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        hour: PropTypes.string,
        count: PropTypes.number,
    }))
}