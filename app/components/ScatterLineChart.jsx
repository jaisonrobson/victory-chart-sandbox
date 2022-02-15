import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import _ from 'lodash'

import {
    VictoryChart,
    VictoryAxis,
    VictoryLine,
    VictoryScatter,
    VictoryTooltip,
    VictoryBrushContainer,
    createContainer,
} from 'victory-native'

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi")

const ScatterLineChart = ({
    lineStyle = {},
    lineProps = {},
    scatterStyle = {},
    scatterProps = {},
    data: dataProp = [],
    style = {},
    xZoom = false,
    ...props
}) => {
    const [data, setData] = useState(dataProp)
    const [zoomDomain, setZoomDomain] = useState({})
    const [selectedDomain, setSelectedDomain] = useState({})

    const getDomain = () => ({
        x: [_.minBy(data, value => value.x).x - 2, _.maxBy(data, value => value.x).x + 2],
        y: [_.minBy(data, value => value.y).y - 2, _.maxBy(data, value => value.y).y + 2],
    })

    const onChangeZoomDomain = (domain) =>
        setZoomDomain(prevState => prevState !== domain ? domain : prevState)

    const onChangeSelectedDomain = (domain) =>
        setSelectedDomain(prevState => prevState !== domain ? domain : prevState)

    return (
        <View style={styles.container}>
            <VictoryChart
                containerComponent={
                    <VictoryZoomVoronoiContainer
                        responsive={true}
                        zoomDimension='x'
                        zoomDomain={zoomDomain}
                        onZoomDomainChange={onChangeSelectedDomain}
                    />
                }
                style={style}
                scale={{ x: "linear" }}
                {...props}
            >
                <VictoryLine
                    style={{
                        data: { stroke: "#c43a31" },
                        parent: { border: "1px solid #ccc" },
                        ...lineStyle
                    }}
                    data={data}
                    domain={getDomain()}
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
                    domain={getDomain()}
                    {...scatterProps}
                />
            </VictoryChart>

            <VictoryChart
                style={{ flex: 1 }}
                scale={{ x: "linear" }}
                containerComponent={
                    <VictoryBrushContainer
                        responsive={false}
                        brushDimension="x"
                        brushDomain={selectedDomain}
                        onBrushDomainChange={onChangeZoomDomain}
                    />
                }
            >
                <VictoryAxis
                    tickValues={data.map((value) => value.x)}
                    tickFormat={(value) => value}
                />

                <VictoryLine
                    style={{
                        data: { stroke: "#c43a31" },
                        parent: { border: "1px solid #ccc" },
                        ...lineStyle
                    }}
                    data={data}
                    domain={getDomain()}
                    {...lineProps}
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