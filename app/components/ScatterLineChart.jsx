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
    VictoryPortal,
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

    const getDomain = () => ({
        x: [
            getFilteredValueFromObjectMatrix(dataSets, _.minBy, xDataItemValueExtractor) - 2,
            getFilteredValueFromObjectMatrix(dataSets, _.maxBy, xDataItemValueExtractor) + 2
        ],
        y: [
            getFilteredValueFromObjectMatrix(dataSets, _.minBy, yDataItemValueExtractor) - 2,
            getFilteredValueFromObjectMatrix(dataSets, _.maxBy, yDataItemValueExtractor) + 2
        ],
    })

    const onChangeZoomDomain = (domain) =>
        setZoomDomain(prevState => prevState !== domain ? domain : prevState)

    const onChangeSelectedDomain = (domain) =>
        setSelectedDomain(prevState => prevState !== domain ? domain : prevState)

    const isDimensionalZoomEnabled = () => _.toLower(zoomDimension) === 'x' || _.toLower(zoomDimension) === 'y'

    const calculateBrushMaximumSize = () => (
        Math.abs(getFilteredValueFromObjectMatrix(dataSets, _.minBy, zoomBrushAxisValuesExtractor))
        + Math.abs(getFilteredValueFromObjectMatrix(dataSets, _.maxBy, zoomBrushAxisValuesExtractor))
        * (zoomBrushPercentualSize / 100)
    )

    const calculateBrushMinimumSize = () => getFilteredValueFromObjectMatrix(dataSets, _.minBy, zoomBrushAxisValuesExtractor)

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

    const LineScatterGraphics = () => _.map(
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

                {LineScatterGraphics()}
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
                            {/* PARA SABER A MAIOR RETA DE EIXO ENTRE OS DATASETS,
                                FAZER UM SOMATORIO DOS VALORES ABSOLUTOS EM CADA DATASET E
                                POR FIM, COMPARAR QUAL A MAIOR RETA, COM ISSO A POSICAO DE VETOR,
                                CUJO ESTE POSSUIR A MAIOR RETA SERA O VETOR VENCEDOR PARA EXIBICAO NO
                                EIXO DE VALORES DO BRUSH DO ZOOM
                            */}

                            {console.log('maiorVetor', _.map(dataSets, (dataSet) => [_.sumBy(dataSet)]))}

                            {/* <VictoryAxis
                                tickValues={
                                    _.isEmpty(zoomBrushAxisValues)
                                        ? _.map(data, zoomBrushAxisValuesExtractor)
                                        : zoomBrushAxisValues
                                }
                                tickFormat={zoomBrushAxisFormatter}
                            /> */}

                            {/*
                                EXIBIR AQUI APENAS OS LINE CHARTS DE CADA DATASET
                            */}
                            {/* <VictoryLine
                                style={{
                                    data: { stroke: "#c43a31" },
                                    parent: { border: "1px solid #ccc" },
                                    ...lineStyle
                                }}
                                data={data}
                                domain={getDomain()}
                                {...lineProps}
                            /> */}
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