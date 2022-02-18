import React from 'react'
import { View } from 'react-native'

import ScatterLineChart from './components/ScatterLineChart'

const Main = () => (
    <View>
        <ScatterLineChart
            style={{ flex: 1 }}
            zoomDimension="x"
            zoomBrushPercentualSize={50}
            zoomBrushAxisValueExtractor={(item) => item.x}
            dataSets={[
                [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                    { x: 3, y: 2 },
                    { x: 4, y: 1 }
                ],
                [
                    { x: 2, y: 3 },
                    { x: 3, y: 2 },
                    { x: 4, y: 3 },
                    { x: 5, y: 2 }
                ]
            ]}
            projectionData={[
                { x: 0, y: 3 },
                { x: 2.5, y: 3 },
                { x: 5, y: 3 },
            ]}
        />
    </View>
)

export default Main