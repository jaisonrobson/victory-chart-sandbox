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
    VictoryArea,
    createContainer,
} from 'victory-native'

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi")

const getFilteredValueFromObjectMatrix = (matrix, iteratee, formatter) =>
    formatter(
        iteratee(
            iteratee(
                matrix,
                (set) => formatter(iteratee(set, (item) => formatter(item)))
            ),
            (item) => formatter(item)
        )
    )

const getAxisLineLength = (min, max) => {
    let length = 0

    if (min <= 0 && max >= 0)
        length = Math.abs(max) + Math.abs(min)
    else
        length = Math.abs(max - min)

    return length
}

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
    xDataItemValueExtractor = (item) => item.x,
    yDataItemValueExtractor = (item) => item.y,
    scale = undefined,
    dataSets = [[]],
    projectionData = [],
    style = {},
    ...props
}) => {
    const [zoomDomain, setZoomDomain] = useState({})
    const [selectedDomain, setSelectedDomain] = useState({})

    const getAxisMinValue = (axisExtractor) => getFilteredValueFromObjectMatrix(dataSets, _.minBy, axisExtractor) - 2
    const getAxisMaxValue = (axisExtractor) => getFilteredValueFromObjectMatrix(dataSets, _.maxBy, axisExtractor) + 2

    const getDomain = () => ({
        x: [
            getAxisMinValue(xDataItemValueExtractor),
            getAxisMaxValue(xDataItemValueExtractor)
        ],
        y: [
            getAxisMinValue(yDataItemValueExtractor),
            getAxisMaxValue(yDataItemValueExtractor)
        ],
    })

    const onChangeZoomDomain = (domain) =>
        setZoomDomain(prevState => prevState !== domain ? domain : prevState)

    const onChangeSelectedDomain = (domain) =>
        setSelectedDomain(prevState => prevState !== domain ? domain : prevState)

    const isDimensionalZoomEnabled = () => _.toLower(zoomDimension) === 'x' || _.toLower(zoomDimension) === 'y'

    const calculateBrushMaximumSize = () => (
        getAxisLineLength(
            getAxisMinValue(zoomBrushAxisValuesExtractor),
            getAxisMaxValue(zoomBrushAxisValuesExtractor)
        ) * (zoomBrushPercentualSize / 100)
    )

    const calculateBrushMinimumSize = () => getAxisMinValue(zoomBrushAxisValuesExtractor)

    const getBrushDomain = () =>
        _.toLower(zoomDimension) === 'x'
            ? ({
                x: [
                    calculateBrushMinimumSize(),
                    calculateBrushMaximumSize()
                ]
            })
            :
            ({
                y: [
                    calculateBrushMinimumSize(),
                    calculateBrushMaximumSize()
                ]
            })

    const getZoomBrushAxisValues = () => {
        const axisMinValue = getAxisMinValue(zoomBrushAxisValuesExtractor)

        const axisLength = getAxisLineLength(
            axisMinValue,
            getAxisMaxValue(zoomBrushAxisValuesExtractor)
        )

        let axisValues = Array(axisLength + 1)
        axisValues = _.map(axisValues, (value, index) => axisMinValue + index)

        return axisValues
    }

    const LineGraphics = () => _.map(
        dataSets,
        (dataSet) => (
            <React.Fragment key={_.sumBy(dataSet, o => o.x + o.y)}>
                <VictoryLine
                    style={{
                        data: { stroke: "#c43a31" },
                        parent: { border: "1px solid #ccc" },
                        ...lineStyle
                    }}
                    data={dataSet}
                    domain={getDomain()}
                    {...lineProps}
                />
            </React.Fragment>
        )
    )

    const ScatterGraphics = () => _.map(
        dataSets,
        (dataSet) => (
            <React.Fragment key={_.sumBy(dataSet, o => o.x + o.y)}>
                <VictoryScatter
                    style={{
                        data: { fill: "#c43a31" },
                        labels: { fill: "black", fontSize: 18 },
                        ...scatterStyle
                    }}
                    labels={({ datum }) => `x: ${datum.x}, y: ${datum.y}`}
                    labelComponent={<VictoryTooltip renderInPortal={false} />}
                    size={7}
                    data={dataSet}
                    domain={getDomain()}
                    {...scatterProps}
                />
            </React.Fragment>
        )
    )

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
                domain={getDomain()}
                style={style}
                scale={scale}
                {...props}
            >
                <VictoryArea
                    style={{
                        data: {
                            fill: '#c43a31',
                            fillOpacity: 0.2,
                            stroke: '#c43a31',
                            strokeWidth: 3,
                            strokeDasharray: 5,
                        }
                    }}
                    data={projectionData}
                    labels={() => 'Projection'}
                />

                {LineGraphics()}
                {ScatterGraphics()}
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
                                        ? getZoomBrushAxisValues()
                                        : zoomBrushAxisValues
                                }
                                tickFormat={zoomBrushAxisFormatter}
                            />

                            {LineGraphics()}
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