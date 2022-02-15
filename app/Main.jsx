import React from 'react'
import { View } from 'react-native'

import ScatterLineChart from './components/ScatterLineChart'

const Main = () => (
    <View>
        <ScatterLineChart
            style={{ flex: 1 }}
            data={[
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 2 },
                { x: 4, y: 1 }
            ]}
        />
    </View>
)

export default Main