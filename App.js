import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button } from 'react-native-paper'
import MapboxGL from '@rnmapbox/maps'

MapboxGL.setWellKnownTileServer('Mapbox')
MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')


import { Countdown } from './src/components/CountDown'
import { RoundedButton } from './src/components/RoundedButton'
import Timer from './src/components/Timer'
import Feature from './src/Feature'
import { exampleGeojsonFeatureCollection, exampleGeojsonFeatureCollection_Shape } from './src/utils/maps'

export default function App() {


  const [currentSubject, setCurrentSubject] = useState('defaultSuvject')
  const [permissionGranted, setPermissionGranted] = useState(false)

  const elo = useEffect(() => {
  MapboxGL.requestAndroidLocationPermissions().then(n => {
    setPermissionGranted(n)
  })
  return cleanUp = () => {

  }
}, []);


  const coordinates = [
    [
      18.665827,
      50.29441
    ],
    [
      18.665768,
      50.294341
    ],
    [
      18.665645,
      50.294409
    ],
    [
      18.665639,
      50.29449
    ],
    [
      18.665618,
      50.294508
    ],
    [
      18.665649,
      50.2946
    ],
    [
      18.665571,
      50.294543
    ],
    [
      18.665389,
      50.294659
    ]
  ]

  return (
    // <SafeAreaView className="flex-1 bg-slate-400 border-2 border-red-700">
    //   {!currentSubject ?
    //     <Feature addSubject={setCurrentSubject} />
    //     :
    //     <Timer
    //     setCurrentSubject={()=>{}} 
    //     focusSubject={currentSubject}
    //     onTimerEnd={()=>{}}
    //     clearSubject={()=>{}}
    //     />
    //   }
    // </SafeAreaView>
    <View className="relative">
      <View className="w-full h-screen">
        <MapboxGL.MapView style={styles.map} renderMode="normal" onPress={()=>{console.log("siema")}}>
          <MapboxGL.Camera
            followZoomLevel={16}
            followUserMode="compass"
          />
          <MapboxGL.UserLocation  />
          <MapboxGL.MarkerView coordinate={[18.66577, 50.29387]} />

          {coordinates.map(n => { return <MapboxGL.PointAnnotation id="point" coordinate={[n[0], n[1]]} /> }
          )}

          <MapboxGL.PointAnnotation id="point" coordinate={[18.66577, 50.29387]}  />
          {/* <MapboxGL.ShapeSource id="markerShape" shape={exampleGeojsonFeatureCollection_Shape}>
            <MapboxGL.LineLayer>
            </MapboxGL.LineLayer>
            <MapboxGL.SymbolLayer
              id='markersSymbol'
              filter={['==', 'showPin', true]}
              style={{
                iconAllowOverlap: true,
                iconImage: ['get', 'icon'],
              }}
            />

          </MapboxGL.ShapeSource> */}

        </MapboxGL.MapView>

      </View>
      <View className="absolute  h-screen w-full pointer-events-none">
        <Text className="text-3xl">Witam serdecznei w aplikacji ścieżki zdrowia</Text>
        <TouchableOpacity className="h-20 w-20 bg-yellow-900 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto">
          <Text className="text-3xl">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  container: {
    backgroundColor: 'tomato'
  },
  map: {
    flex: 1
  }
})
