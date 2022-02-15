import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'

import {
    VictoryChart,
    VictoryLine,
    VictoryScatter,
    VictoryTooltip,
    VictoryVoronoiContainer,
} from 'victory-native'

const ScatterLineChart = ({
    lineStyle = {},
    lineProps = {},
    scatterStyle = {},
    scatterProps = {},
    data: dataProp = [],
    style = {},
    ...props
}) => {
    const [data, setData] = useState(dataProp)

    return (
        <View style={styles.container}>
            <VictoryChart
                containerComponent={<VictoryVoronoiContainer />}
                style={style}
                animate={{ duration: 2000, easing: 'linear' }}
                {...props}
            >
                <VictoryLine
                    style={{
                        data: { stroke: "#c43a31" },
                        parent: { border: "1px solid #ccc" },
                        ...lineStyle
                    }}
                    data={data}
                    {...lineProps}
                />

                <VictoryScatter
                    style={{
                        data: { fill: "#c43a31" },
                        labels: { fill: "black", fontSize: 18 },
                        ...scatterStyle
                    }}
                    labels={({ datum }) => `x: ${datum.x}, y: ${datum.y}`}
                    labelComponent={<VictoryTooltip />}
                    size={7}
                    data={data}
                    {...scatterProps}
                />
            </VictoryChart>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5fcff',
    },
})

export default ScatterLineChart