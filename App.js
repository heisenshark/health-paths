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
import CircleIcon from './src/utils/Icons'
import { featuresRynek, waypointsApp } from './src/providedfiles/Export'
import Map from './src/screens/Map'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from './src/screens/HomeScreen'
import { NativeWindStyleSheet, useColorScheme } from 'nativewind'
import Icon from 'react-native-vector-icons/FontAwesome'

MapboxGL.setWellKnownTileServer('Mapbox')
MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

export default function App() {

  return (

    <NavigationContainer>
      {/* <Stack.Navigator screenOptions={{
        headerShown: false
      }}
      >
      </Stack.Navigator> */}
      <Tab.Navigator
        screenOptions={
          {
            tabBarItemStyle: {
              backgroundColor: 'yellow',
              borderRadius: 5,
              flex: 0,
              width: 90,
              height: 90,
              marginHorizontal: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              marginVertical: 'auto',
              alignSelf: 'center'
            },
            tabBarStyle: {
              flexDirection: 'column',
              height: 110,
              justifyContent: 'space-around',
              alignItems: 'center',
              borderColor: 'yellow',
              borderWidth: 3,
              backgroundColor: 'black'
            },
            tabBarLabelStyle: {
              fontSize: 15,
              color: 'black',
              textDecorationLine:'underline',
            },
            activeTintColor: '#FFFFFF',
            headerShown: false,

          }
        }
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) =>
              (<Icon name="home" size={50} color="black" />),
          }}

        />
        <Tab.Screen
          name="Map"
          component={Map}
          options={{
            ...mainButtonNav,
            tabBarIcon: ({ color, size }) =>
              (<Icon name="map" size={50} color="black" />),
          }}

        />
        <Tab.Screen
          name="asdasd"
          component={Map}
          options={{
            tabBarIcon: ({ color, size }) =>
              (<Icon name="lock" size={50} color="black" />),
          }}

/>
      </Tab.Navigator>
    </NavigationContainer >
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

const style = <xd className="bg-red-200 text-yellow-200" />
const mainButtonNav = {
  tabBarItemStyle: {
    backgroundColor: 'yellow',
    marginVertical: 5,
    borderWidth: 3,
    borderRadius: 5,
    flex: 0,
    width: 100,
    height: 100,
  },
  tabBarLabelStyle: {
    fontSize: 20,
    color: 'black'
  },
}