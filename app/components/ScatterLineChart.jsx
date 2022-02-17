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
            xDataItemValueExtractor(_.minBy(dataSets, (dataSet) => xDataItemValueExtractor(_.minBy(dataSet, (item) => xDataItemValueExtractor(item))))) - 2,
            xDataItemValueExtractor(_.maxBy(dataSets, (dataSet) => xDataItemValueExtractor(_.maxBy(dataSet, (item) => xDataItemValueExtractor(item))))) + 2
        ],
        y: [
            yDataItemValueExtractor(_.minBy(dataSets, (dataSet) => yDataItemValueExtractor(_.minBy(dataSet, (item) => yDataItemValueExtractor(item))))) - 2,
            yDataItemValueExtractor(_.maxBy(dataSets, (dataSet) => yDataItemValueExtractor(_.maxBy(dataSet, (item) => yDataItemValueExtractor(item))))) + 2
        ],
    })

    const onChangeZoomDomain = (domain) =>
        setZoomDomain(prevState => prevState !== domain ? domain : prevState)

    const onChangeSelectedDomain = (domain) =>
        setSelectedDomain(prevState => prevState !== domain ? domain : prevState)

    const isDimensionalZoomEnabled = () => _.toLower(zoomDimension) === 'x' || _.toLower(zoomDimension) === 'y'

    const calculateBrushMaximumPercentualSize = () => (
        Math.abs(zoomBrushAxisValuesExtractor(_.minBy(dataSets, (dataSet) => zoomBrushAxisValuesExtractor(_.minBy(dataSet, (item) => zoomBrushAxisValuesExtractor(item))))))
        + Math.abs(zoomBrushAxisValuesExtractor(_.maxBy(dataSets, (dataSet) => zoomBrushAxisValuesExtractor(_.maxBy(dataSet, (item) => zoomBrushAxisValuesExtractor(item))))))
        * (zoomBrushPercentualSize / 100)
    )

    const calculateBrushMinimumPercentualSize = () => (
        zoomBrushAxisValuesExtractor(
            _.minBy(
                dataSets,
                (dataSet) => zoomBrushAxisValuesExtractor(_.minBy(dataSet, (item) => zoomBrushAxisValuesExtractor(item)))
            )
        )
    )

    const getBrushDomain = () =>
        _.toLower(zoomDimension) === 'x'
            ? ({
                x: [
                    calculateBrushMinimumPercentualSize(),
                    calculateBrushMaximumPercentualSize()
                ]
            })
            :
            ({
                y: [
                    calculateBrushMinimumPercentualSize(),
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

                {
                    _.map(
                        dataSets,
                        (dataSet) => {
                            return (
                                <>
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
                                        labelComponent={<VictoryTooltip />}
                                        size={7}
                                        data={dataSet}
                                        domain={getDomain()}
                                        {...scatterProps}
                                    />
                                </>
                            )
                        }
                    )
                }
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
                            <VictoryAxis
                                tickValues={
                                    _.isEmpty(zoomBrushAxisValues)
                                        ? _.map(data, zoomBrushAxisValuesExtractor)
                                        : zoomBrushAxisValues
                                }
                                tickFormat={zoomBrushAxisFormatter}
                            />

                            {/*
                                EXIBIR AQUI APENAS OS LINE CHARTS DE CADA DATASET
                            */}
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