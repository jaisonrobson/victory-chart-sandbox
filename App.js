import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { VictoryChart, VictoryLine, VictoryTheme, VictoryScatter, VictoryLabel, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native'

export default function App() {
  return (
    <View style={styles.container}>
      <VictoryChart
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryLine
          style={{
            data: { stroke: "#c43a31" },
            parent: { border: "1px solid #ccc" }
          }}
          data={[
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 5 },
            { x: 4, y: 4 },
            { x: 5, y: 7 }
          ]}
        />
        <VictoryScatter
          style={{ data: { fill: "#c43a31" }, labels: { fill: "black", fontSize: 18 } }}
          labels={({ datum }) => `x: ${datum.x}, y: ${datum.y}`}
          labelComponent={<VictoryTooltip />}
          size={7}
          data={[
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 5 },
            { x: 4, y: 4 },
            { x: 5, y: 7 }
          ]}
        />
      </VictoryChart>


      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
