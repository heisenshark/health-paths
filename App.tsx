// import { StatusBar as ExpoStatusBar } from "expo-status-bar";
// import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
// import { Button } from "react-native-paper";
// import MapboxGL from "@rnmapbox/maps";
// import MapView, { Circle, Marker, Polyline , enableLatestRenderer } from "react-native-maps";
// import { cloneDeep } from "lodash";

// import { RoundedButton } from "./src/components/RoundedButton";
// import { exampleGeojsonFeatureCollection, exampleGeojsonFeatureCollection_Shape } from "./src/utils/maps";
// import CircleIcon from "./src/utils/Icons";
// import { featuresRynek, waypointsApp } from "./src/providedfiles/Export";
import Map from "./src/screens/Map";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import HomeScreen from "./src/screens/HomeScreen";
// import { NativeWindStyleSheet, useColorScheme } from "nativewind";
import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomBar } from "./src/components/BottomBar";
import StopPointEditScreen from "./src/screens/StopPointEditScreen";
import AudioRecordingScreen from "./src/screens/AudioRecordingScreen";
// MapboxGL.setWellKnownTileServer('Mapbox')
// MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')

const Nor = createNativeStackNavigator();
console.log(StatusBar.currentHeight);
export default function App() {
  const navigationRef = useNavigationContainerRef();
  //context api variable
  const [currentScreen, setCurrentScreen] = useState("");
  return (
    //TODO finish settings screen
    //TODO finish mapselect screen
    //TODO finish info screen
    //TODO finish mymaps screen
    //TODO add tracking position and making tracks by gps
    //TODO dodać możliwość eksportu mapy
    //TODO dodać możliwość udostępnienia mapy przez watsapp
    <>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={(key) => {
          setCurrentScreen(key.routes[key.index].name);
        }}>
        <Nor.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Nor.Screen name="Trasy" component={HomeScreen} />
          <Nor.Screen name="Nagraj" component={Map} />
          <Nor.Screen name="Opcje" component={Map} />
          <Nor.Screen name="EdycjaMap" component={StopPointEditScreen} />
          <Nor.Screen name="NagrywanieAudio" component={AudioRecordingScreen} />
        </Nor.Navigator>
      </NavigationContainer>
      <BottomBar navigationRef={navigationRef} currentRoute={currentScreen} />
    </>
  );
}
