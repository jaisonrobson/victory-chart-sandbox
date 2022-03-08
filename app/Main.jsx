import React from 'react'
import { View } from 'react-native'
import moment from 'moment'

import ScatterLineChart from './components/ScatterLineChart'

const Main = () => (
    <View>
        <ScatterLineChart
            style={{ flex: 1 }}
            scale={{ x: 'time', y: 'linear' }}
            xDataType="Date"
            zoomDimension="x"
            zoomScale={{ x: 'time', y: 'linear' }}
            zoomBrushDataType="Date"
            zoomBrushPercentualSize={50}
            zoomBrushAxisValueExtractor={(item) => item.x}
            zoomBrushAxisFormatter={value => value.format("DD/MM/YYYY")}
            dataSetsStyles={[
                {
                    scatter: {
                        data: { fill: "#265196" },
                        labels: { fill: "black", fontSize: 18 },
                    },
                    line: {
                        data: { stroke: "#265196" },
                        parent: { border: "1px solid #ccc" },
                    },
                },
                {
                    scatter: {
                        data: { fill: "#34ebd2" },
                        labels: { fill: "black", fontSize: 18 },
                    },
                    line: {
                        data: { stroke: "#34ebd2" },
                        parent: { border: "1px solid #ccc" },
                    },
                },
                {
                    scatter: {
                        data: { fill: "#c43a31" },
                        labels: { fill: "black", fontSize: 18 },
                    },
                    line: {
                        data: { stroke: "#c43a31" },
                        parent: { border: "1px solid #ccc" },
                    },
                }
            ]}
            dataSets={[
                [
                    { x: moment(4516938461453).toDate(), y: 1 },
                    { x: moment(5411205937013).toDate(), y: 3 },
                    { x: moment(1111111111111).toDate(), y: 4 },
                    { x: moment(7762463069988).toDate(), y: 7 }
                ],
                [
                    { x: moment(8782658062941).toDate(), y: 3 },
                    { x: moment(1298681152230).toDate(), y: 7 },
                    { x: moment(1801634938441).toDate(), y: 5 },
                    { x: moment(8581673344374).toDate(), y: 2 }
                ],
                [
                    { x: moment(9550074647790).toDate(), y: 0 },
                    { x: moment(9999999999999).toDate(), y: 5 },
                    { x: moment(3132517450923).toDate(), y: 10 },
                    { x: moment(9514753724541).toDate(), y: 2 }
                ]
            ]}
            // dataSets={[
            //     [
            //         { x: 2, y: 1 },
            //         { x: 4, y: 2 },
            //         { x: 8, y: 2 },
            //         { x: 10, y: 1 }
            //     ],
            //     [
            //         { x: 3, y: 3 },
            //         { x: 4, y: 2 },
            //         { x: 5, y: 3 },
            //         { x: 8, y: 2 }
            //     ],
            //     [
            //         { x: 1, y: 1 },
            //         { x: 2, y: 2 },
            //         { x: 4, y: 2 },
            //         { x: 6, y: 1 }
            //     ]
            // ]}
            projectionData={[
                { x: 0, y: 3 },
                { x: 2.5, y: 3 },
                { x: 8, y: 3 },
            ]}
        />
    </View>
)

export default Main