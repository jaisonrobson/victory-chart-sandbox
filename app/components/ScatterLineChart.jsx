import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import _ from 'lodash'
import moment from 'moment'

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

const getFilteredValueFromObjectMatrix = (matrix, iteratee, dataExtractor, dataType) => {
    let result = undefined

    switch (dataType) {
        case 'Date': {
            result = iteratee(
                _.map(
                    matrix,
                    (dataSet) => iteratee(_.map(dataSet, dataExtractor))
                )
            )

            break
        }
        default: {
            result = iteratee(
                _.map(
                    matrix,
                    dataSet => iteratee(_.map(dataSet, dataExtractor))
                )
            )

            break
        }
    }

    return result
}

//AJUSTAR O CALCULO DO TAMANHO DO VETOR PARA TRABALHAR COM DATAS TAMBEM
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
    zoomScale = { x: 'linear', y: 'linear' },
    zoomBrushAxisValues = [],
    zoomBrushPercentualSize = 30,
    zoomBrushDataType = 'Number',
    zoomBrushAxisValueExtractor = (value) => value,
    zoomBrushAxisFormatter = (value) => value,
    xDataType = 'Number',
    yDataType = 'Number',
    xDataItemValueExtractor = (item) => item.x,
    yDataItemValueExtractor = (item) => item.y,
    scale = { x: 'linear', y: 'linear' },
    dataSetsStyles = [],
    dataSets = [[]],
    projectionStyle = {},
    projectionData = [],
    style = {},
    ...props
}) => {
    const [zoomDomain, setZoomDomain] = useState({})
    const [selectedDomain, setSelectedDomain] = useState({})

    const getIterateeAccordingToDataType = (dataType, iterateeType) => {
        if (dataType === 'Date')
            return iterateeType === 'min' ? moment.min : moment.max
        else
            return iterateeType === 'min' ? _.minBy : _.maxBy
    }

    const getDataExtractorAccordingToDataType = (dataType, extractor) =>
        dataType === 'Date'
            ? item => moment(extractor(item))
            : extractor

    const getAxisMinValue = (axisExtractor, dataType) => {
        let result = getFilteredValueFromObjectMatrix(
            dataSets,
            getIterateeAccordingToDataType(dataType, 'min'),
            getDataExtractorAccordingToDataType(dataType, axisExtractor),
            dataType
        )

        if (dataType === 'Date') {
            result = moment(result).subtract(2, 'days')
        } else {
            result = result - 2
        }

        return result
    }

    const getAxisMaxValue = (axisExtractor, dataType) => {
        let result = getFilteredValueFromObjectMatrix(
            dataSets,
            getIterateeAccordingToDataType(dataType, 'max'),
            getDataExtractorAccordingToDataType(dataType, axisExtractor),
            dataType
        )

        if (dataType === 'Date') {
            result = moment(result).add(2, 'days')
        } else {
            result = result + 2
        }

        return result
    }

    const getDomain = () => ({
        x: [
            getAxisMinValue(xDataItemValueExtractor, xDataType),
            getAxisMaxValue(xDataItemValueExtractor, xDataType)
        ],
        y: [
            getAxisMinValue(yDataItemValueExtractor, yDataType),
            getAxisMaxValue(yDataItemValueExtractor, yDataType)
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
        //AJUSTAR O CALCULO DO TAMANHO DO VETOR PARA TRABALHAR COM DATAS TAMBEM
        getAxisLineLength(
            getAxisMinValue(zoomBrushAxisValueExtractor, zoomBrushDataType),
            getAxisMaxValue(zoomBrushAxisValueExtractor, zoomBrushDataType)
        ) * (zoomBrushPercentualSize / 100)
    )

    const calculateBrushMinimumSize = () => getAxisMinValue(zoomBrushAxisValueExtractor, zoomBrushDataType)

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
        const axisMinValue = getAxisMinValue(zoomBrushAxisValueExtractor, zoomBrushDataType)

        const axisLength = getAxisLineLength(
            axisMinValue,
            getAxisMaxValue(zoomBrushAxisValueExtractor, zoomBrushDataType)
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

    const ProjectionGraphic = () =>
        !_.isEmpty(projectionData)
            ? (
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
            )
            : undefined

    const BrushGraphic = () =>
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
            : undefined

    // return <View style={styles.container} />

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
                {ProjectionGraphic()}

                {LineGraphics()}

                {ScatterGraphics()}
            </VictoryChart>

            {BrushGraphic()}
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