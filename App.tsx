import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button } from 'react-native-paper'
import MapboxGL from '@rnmapbox/maps'
import MapView, { Circle, Marker, Polyline } from 'react-native-maps'
import { enableLatestRenderer } from 'react-native-maps'
import { cloneDeep } from 'lodash'

import { RoundedButton } from './src/components/RoundedButton'
import { exampleGeojsonFeatureCollection, exampleGeojsonFeatureCollection_Shape } from './src/utils/maps'
import CircleIcon from './src/utils/Icons'
import { featuresRynek, waypointsApp } from './src/providedfiles/Export'
import Map from './src/screens/Map'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from './src/screens/HomeScreen'
import { NativeWindStyleSheet, useColorScheme } from 'nativewind'
import Icon from 'react-native-vector-icons/FontAwesome'

// MapboxGL.setWellKnownTileServer('Mapbox')
// MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

export default function App() {

  return (
    //TODO finish settings screen
    //TODO finish mapselect screen
    //TODO finish info screen
    //TODO finish mymaps screen
    //TODO add tracking position and making tracks by gps
    //TODO dodać możliwość eksportu mapy
    //TODO dodać możliwość udostępnienia mapy przez watsapp
    <NavigationContainer>
      {/* <Stack.Navigator screenOptions={{
        headerShown: false
      }}
      >
      </Stack.Navigator> */}
      <Tab.Navigator
        screenOptions={templateScreenOptions}
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
          name="Maps"
          component={Map}
          options={{
            tabBarIcon: ({ color, size }) =>
              (<Icon name="lock" size={50} color="black" />),
          }}
        />
        {/* <Tab.Screen
          name="Options"
          component={Map}
          options={{
            tabBarIcon: ({ color, size }) =>
              (<Icon name="lock" size={50} color="black" />),
          }}
        /> */}

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

const mainButtonNav = {
  tabBarItemStyle: {
    backgroundColor: 'yellow',
    borderWidth: 3,
    borderRadius: 5,
    flex: 0,
    width: 105,
    height: 105,
    borderRadius: 30,
  },
  tabBarLabelStyle: {
    fontSize: 20,
    color: 'black'
  },
}

const templateScreenOptions: BottomTabNavigationOptions = {
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
    alignSelf: 'center',
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
    textDecorationLine: 'underline',
  },
  headerShown: false,
}

