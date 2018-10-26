import React from "react";
import PropTypes from "prop-types";
import {ScatterChart, XAxis, YAxis, ZAxis, Scatter, ResponsiveContainer, Tooltip} from "recharts";

export default class Hourly extends React.Component {
    render () {
        const domain = getDomain(this.props.data);
        const lastDayKey = Object.keys(this.props.data)[Object.keys(this.props.data).length-1];
        return (
            <div>
                {Object.keys(this.props.data).map(dayKey => (
                    <ResponsiveContainer width="100%" height={60} key={dayKey}>
                        <ScatterChart fontFamily="Roboto" margin={{top: 10, right: 0, bottom: 0, left: 0}}>
                            <XAxis type="category" dataKey="hour" interval={0} tick={{ fontSize: dayKey === lastDayKey ? 15 : 0 }} tickLine={{ transform: 'translate(0, -6)' }} />
                            <YAxis type="number" dataKey="day" name={dayKey} height={10} width={60} tick={false} tickLine={false} axisLine={false} label={{ value: dayKey, position: 'insideRight' }}/>
                            <ZAxis type="number" dataKey="count" range={[0,200]} domain={domain} />
                            <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{ zIndex: 100 }} />
                            <Scatter data={convertHourlyStats(this.props.data[dayKey], dayKey)} fill="#3f51b5"/>
                        </ScatterChart>
                    </ResponsiveContainer>
                ))}
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
    console.log(maxCount);
    return [0, maxCount]
}
