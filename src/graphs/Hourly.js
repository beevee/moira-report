import React from "react";
import PropTypes from "prop-types";
import {ScatterChart, XAxis, YAxis, ZAxis, Scatter, ResponsiveContainer, Tooltip, ReferenceLine, Cell} from "recharts";

export default class Hourly extends React.Component {
    render () {
        const domain = getDomain(this.props.data);
        const lastDayKey = Object.keys(this.props.data)[Object.keys(this.props.data).length-1];
        return (
            <div>
                {Object.keys(this.props.data).map(dayKey => {
                    const data = convertHourlyStats(this.props.data[dayKey], dayKey);
                    return <ResponsiveContainer width="100%" height={60} key={dayKey}>
                        <ScatterChart fontFamily="Roboto" margin={{top: 10, right: 0, bottom: 0, left: 0}}>
                            <XAxis type="category" dataKey="hour" interval={0} tick={{ fontSize: dayKey === lastDayKey ? 15 : 0 }} tickLine={false} axisLine={{ strokeWidth: "0.2" }} />
                            <YAxis type="number" dataKey="day" name={dayKey} height={10} width={60} tick={false} tickLine={false} axisLine={false} label={{ value: dayKey, position: 'insideRight' }}/>
                            <ZAxis type="number" dataKey="count" range={[0,450]} domain={domain} />
                            <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{ zIndex: 100 }} />
                            <Scatter data={data} fill="#3f51b5">
                                {
                                    data.map((cell, index) => (
                                        <Cell key={`cell-${index}`} fill={cell.hour > 19 || cell.hour < 8 ? "rgb(255, 87, 34)" : "#3f51b5"}/>
                                    ))
                                }
                            </Scatter>
                            <ReferenceLine x="8" />
                            <ReferenceLine x="20" />
                        </ScatterChart>
                    </ResponsiveContainer>
                }
                )}
            </div>
        )
    }
}

Hourly.propTypes = {
    data: PropTypes.object
};

function convertHourlyStats(moiraStats, dayKey) {
    let flatStats = [];
    Object.keys(moiraStats).map(hourKey => {
        flatStats.push({
            'day': dayKey,
            'hour': hourKey,
            'count': moiraStats[hourKey],
        })
    });
    return flatStats;
}

function getDomain(moiraStats) {
    let maxCount = 0;
    Object.keys(moiraStats).map(dayKey =>
        Object.keys(moiraStats[dayKey]).map(hourKey => {
            if (maxCount < moiraStats[dayKey][hourKey])
                maxCount = moiraStats[dayKey][hourKey]
        }));
    return [0, maxCount]
}
