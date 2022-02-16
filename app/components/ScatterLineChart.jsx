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
    VictoryVoronoiContainer,
    createContainer,
} from 'victory-native'

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi")

const ScatterLineChart = ({
    lineStyle = {},
    lineProps = {},
    scatterStyle = {},
    scatterProps = {},
    zoomDimension = undefined,
    zoomScale = undefined,
    zoomBrushAxisValues = [],
    zoomBrushPercentualSize = 30,
    zoomBrushAxisValuesExtractor = (value) => value,
    zoomBrushAxisFormatter = (value) => value,
    scale = undefined,
    data: dataProp = [],
    style = {},
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

    const isDimensionalZoomEnabled = () => _.toLower(zoomDimension) === 'x' || _.toLower(zoomDimension) === 'y'

    const calculateBrushMaximumPercentualSize = () => (
        Math.abs(zoomBrushAxisValuesExtractor(_.minBy(data, zoomBrushAxisValuesExtractor)))
        + Math.abs(zoomBrushAxisValuesExtractor(_.maxBy(data, zoomBrushAxisValuesExtractor)))
        * (zoomBrushPercentualSize / 100)
    )

    const getBrushDomain = () =>
        _.toLower(zoomDimension) === 'x'
            ? ({
                x: [
                    zoomBrushAxisValuesExtractor(_.minBy(data, zoomBrushAxisValuesExtractor)),
                    calculateBrushMaximumPercentualSize()
                ]
            })
            :
            ({
                y: [
                    zoomBrushAxisValuesExtractor(_.minBy(data, zoomBrushAxisValuesExtractor)),
                    calculateBrushMaximumPercentualSize()
                ]
            })

    return (
        <View style={styles.container}>
            <VictoryChart
                containerComponent={
                    isDimensionalZoomEnabled()
                        ? (
                            <VictoryZoomVoronoiContainer
                                responsive={true}
                                zoomDimension={_.toLower(zoomDimension)}
                                zoomDomain={zoomDomain}
                                onZoomDomainChange={onChangeSelectedDomain}
                            />
                        )
                        : <VictoryVoronoiContainer />
                }
                style={style}
                scale={scale}
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

            {
                isDimensionalZoomEnabled()
                    ? (
                        <VictoryChart
                            style={{ flex: 1 }}
                            scale={zoomScale}
                            containerComponent={
                                <VictoryBrushContainer
                                    allowDraw={false}
                                    allowResize={false}
                                    responsive={false}
                                    brushDimension={_.toLower(zoomDimension)}
                                    brushDomain={isDimensionalZoomEnabled() ? getBrushDomain() : selectedDomain}
                                    onBrushDomainChange={onChangeZoomDomain}
                                />
                            }
                        >
                            <VictoryAxis
                                tickValues={
                                    _.isEmpty(zoomBrushAxisValues)
                                        ? _.map(data, zoomBrushAxisValuesExtractor)
                                        : zoomBrushAxisValues
                                }
                                tickFormat={zoomBrushAxisFormatter}
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
                    )
                    : <></>
            }
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