import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button } from 'react-native-paper'
import MapboxGL from '@rnmapbox/maps'
import MapView, { Circle, Marker, Polyline } from 'react-native-maps'
import { enableLatestRenderer } from 'react-native-maps'
import { cloneDeep } from 'lodash'

import { Countdown } from './src/components/CountDown'
import { RoundedButton } from './src/components/RoundedButton'
import Timer from './src/components/Timer'
import Feature from './src/Feature'
import { exampleGeojsonFeatureCollection, exampleGeojsonFeatureCollection_Shape } from './src/utils/maps'
import CircleIcon from './src/utils/CircleIcon'
import { featuresRynek, waypointsApp } from './src/providedfiles/Export'

MapboxGL.setWellKnownTileServer('Mapbox')
MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')

export default function App() {


  const [currentSubject, setCurrentSubject] = useState('defaultSuvject')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isEdit, setIsEdit] = useState(false);
  const elo = useEffect(() => {
    MapboxGL.requestAndroidLocationPermissions().then(n => {
      setPermissionGranted(n)
    })


    return cleanUp = () => {

    }
  }, [])

  const [waypoints, setWaypoints] = useState(
      cloneDeep(waypointsApp)
  )
  const markers = waypoints.map((n, index) => {
    return <Marker
      key={index}
      coordinate={{ longitude: n.coordinates[1], latitude: n.coordinates[0] }}
      title={n.displayed_name}
      description={n.type}
      onPress={() => console.log("circlepressed " + n.coordinates)}
      onDrag={(e) => {
        console.log(n.coordinates)
        n.coordinates = [e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude]
        setWaypoints([...waypoints])/**  waypoints[index].coordinates = [c.latitude, c.longitude]; */
      }}
      draggable = {isEdit}
    >
    </Marker>
  })

  const addWaypoint = (cords)=>{
    setWaypoints([...waypoints,
      {
        "waypoint_id": "gliwice.rynek.ratusz",
        "coordinates": [
          cords.latitude,
          cords.longitude
        ],
        "type": "station",
        "displayed_name": "Rynek Rzeźba Madonny",
        "navigation_audio": "",
        "image": "image.station.gliwice.ratusz.icon",
        "introduction_audio": "audio.introduction.ratusz"
      }
    ])
  }
  return (
    <View className="relative">
      <View className="w-full h-screen bg-red-600">


        <MapView className="flex-1"
          initialRegion={{
            latitude: 50.29441,
            longitude: 18.665827,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress = {(e)=>{
            isEdit&& addWaypoint(e.nativeEvent.coordinate)
          }}
        >

          {markers}

          {/* <Polyline
            coordinates={
              coordinates.map(n => { return { longitude: n[0], latitude: n[1] } })
            }
            strokeColor="#000"
            strokeWidth={3}
          /> */}
          <Polyline
            coordinates={
              waypoints.map(n => { return { longitude: n.coordinates[1], latitude: n.coordinates[0] } })
            }
            strokeColor="#F00"
            strokeWidth={6}
          />

        </MapView>

      </View>
      <View className="absolute  h-screen w-full pointer-events-none">
        <Text className="text-3xl text-gray-800 bg-black">{waypoints[0].coordinates}</Text>
        <TouchableOpacity className="h-20 w-20 bg-yellow-900 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto">
          <Text className="text-3xl" onPress={()=>{setIsEdit(!isEdit)}}>
              {isEdit ? "exit":"+"}
          </Text>
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
