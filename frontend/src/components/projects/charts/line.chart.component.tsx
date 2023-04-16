import React, {useMemo} from 'react';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {test} from "../../models.interfaces";
import {statuses} from "../../model.statuses";
import {MomentTMS} from "../../../services/momentTMS";
import {useMode} from "../../../context/ColorModeContextProvider";

const LineChartComponent = (props: {
    tests: test[]
}) => {
    const [, theme] = useMode();
    const momentTMS = MomentTMS.initWithFormat;
    const sliceOfTests = props.tests.slice(0, 100).sort((a, b) =>
        momentTMS(a.updated_at).valueOf() - momentTMS(b.updated_at).valueOf())
    const result: { [key: string]: number; }[] = []
    const dates: string[] = []


    // Joining date and statuses for creating data for line chart
    const lineData = useMemo(() => {
        // Filling lists with date and results statuses on that date
        sliceOfTests.forEach((test) => {
            const testDate = momentTMS(test.updated_at).format("L")
            if (dates[dates.length - 1] !== testDate) {
                const currentResult: { [key: string]: number; } = {}
                statuses.map((status) => currentResult[status.name.toLowerCase()] = 0)
                currentResult[String(test.last_status).toLowerCase()]++
                result.push(currentResult)
                dates.push(testDate)
            } else {
                result[result.length - 1][String(test.last_status).toLowerCase()]++
            }
        })

        return dates.map((value, index) => {
                const dateData: { [key: string]: number | string | undefined; } = {
                    name: value
                }
                statuses.map((status) => dateData[status.name.toLowerCase()] = result[index][status.name.toLowerCase()])
                return dateData
            }
        )
    }, [])


    return (
        <ResponsiveContainer height={200}>
            <LineChart data={lineData}>
                <CartesianGrid/>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                {statuses.map((status, index) =>
                    <Line key={index} name={status.name} type="monotone" dataKey={status.name.toLowerCase()}
                          stroke={theme.palette[status.name.toLowerCase()]}
                          strokeWidth={3}
                          dot={false}/>)}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartComponent;