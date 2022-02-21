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
    zoomBrushAxisValueExtractor = (value) => value,
    zoomBrushAxisFormatter = (value) => value,
    xDataItemValueExtractor = (item) => item.x,
    yDataItemValueExtractor = (item) => item.y,
    scale = undefined,
    dataSetsStyles = [],
    dataSets = [[]],
    projectionStyle = {},
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

    const onChangeZoomDomain = (domain) => {
        let newDomain = domain

        if (zoomDimension === 'x')
            newDomain = { ...domain, y: [domain.y[0] - 1, domain.y[1] + 1] }

        if (zoomDimension === 'y')
            newDomain = { ...domain, x: [domain.x[0] - 1, domain.x[1] + 1] }

        setZoomDomain(prevState => prevState !== newDomain ? newDomain : prevState)
    }

    const onChangeSelectedDomain = (domain) =>
        setSelectedDomain(prevState => prevState !== domain ? domain : prevState)

    const isDimensionalZoomEnabled = () => _.toLower(zoomDimension) === 'x' || _.toLower(zoomDimension) === 'y'

    const calculateBrushMaximumSize = () => (
        getAxisLineLength(
            getAxisMinValue(zoomBrushAxisValueExtractor),
            getAxisMaxValue(zoomBrushAxisValueExtractor)
        ) * (zoomBrushPercentualSize / 100)
    )

    const calculateBrushMinimumSize = () => getAxisMinValue(zoomBrushAxisValueExtractor)

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
        const axisMinValue = getAxisMinValue(zoomBrushAxisValueExtractor)

        const axisLength = getAxisLineLength(
            axisMinValue,
            getAxisMaxValue(zoomBrushAxisValueExtractor)
        )

        let axisValues = Array(axisLength + 1)
        axisValues = _.map(axisValues, (value, index) => axisMinValue + index)

        return axisValues
    }

    const LineGraphics = () => _.map(
        dataSets,
        (dataSet, index) => (
            <VictoryLine
                key={_.sumBy(dataSet, o => o.x + o.y)}
                style={{
                    data: { stroke: "#c43a31" },
                    parent: { border: "1px solid #ccc" },
                    ...dataSetsStyles[index].line,
                    ...lineStyle
                }}
                data={dataSet}
                {...lineProps}
            />
        )
    )

    const ScatterGraphics = () => _.map(
        dataSets,
        (dataSet, index) => (
            <VictoryScatter
                key={_.sumBy(dataSet, o => o.x + o.y)}
                style={{
                    data: { fill: "#c43a31" },
                    labels: { fill: "black", fontSize: 18 },
                    ...dataSetsStyles[index].scatter,
                    ...scatterStyle
                }}
                labels={({ datum }) => `x: ${datum.x}, y: ${datum.y}`}
                labelComponent={<VictoryTooltip renderInPortal={false} />}
                size={7}
                data={dataSet}
                {...scatterProps}
            />
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
                        },
                        ...projectionStyle,
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