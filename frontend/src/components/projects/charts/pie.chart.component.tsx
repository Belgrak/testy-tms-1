import React, {useMemo} from 'react';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {test} from "../../models.interfaces";
import {useTranslation} from "react-i18next";

const PieChartComponent = (props: {
    tests: test[]
}) => {
    const {t} = useTranslation();
    let nTestsWithoutUser = useMemo(() => {
        let temp = 0
        props.tests.forEach((test) => {
            if (test.user == null) {
                temp++
            }
        })
        return temp
    }, [])
    // Counting tests with assigned user

    const pieData = [
        {name: t("chart.assigned"), value: props.tests.length - nTestsWithoutUser},
        {name: t("chart.not_assigned"), value: nTestsWithoutUser},
    ];

    return (
        <ResponsiveContainer height={200}>
            <PieChart>
                <Pie data={pieData} dataKey={"value"} labelLine={true}>
                    <Cell fill={"#98d589"}/>
                    <Cell fill={"#d99292"}/>
                </Pie>
                <Legend/>
                <Tooltip formatter={(value, name) => [t("chart.tests") + value, name]}/>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartComponent;