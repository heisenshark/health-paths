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
import MapEditScreen from "./src/screens/MapEditScreen";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import HomeScreen from "./src/screens/HomeScreen";
// import { NativeWindStyleSheet, useColorScheme } from "nativewind";
import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomBar } from "./src/components/BottomBar";
import StopPointEditScreen from "./src/screens/StopPointEditScreen";
import AudioRecordingScreen from "./src/screens/AudioRecordingScreen";
import MapViewScreen from "./src/screens/MapViewScreen";
import MapExplorerScreen from "./src/screens/MapExplorerScreen";
import { createNewMap, ensureMapDirExists, listAllMaps } from "./src/utils/FileSystemManager";

import * as TaskManager from "expo-task-manager";
import { useMapStore } from "./src/stores/store";
import { LatLng } from "react-native-maps";

// MapboxGL.setWellKnownTileServer('Mapbox')
// MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')

const Nor = createNativeStackNavigator();
console.log(StatusBar.currentHeight);

TaskManager.defineTask("location_tracking", async ({ data, error }) => {
  const addLocations = useMapStore.getState().addLocations;
  let locationss = useMapStore.getState().locations;
  // let test = useMapStore.getState().testobject;
  // test.test.push("test");
  // console.log("test", test);

  if (error) {
    console.log("LOCATION_TRACKING task ERROR:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    let lat = locations[0].coords.latitude;
    let long = locations[0].coords.longitude;
    const newLocation = { latitude: lat, longitude: long } as LatLng;
    /**
     * Załatwimy upraszcznie mapy w ten sposób że będziemy trzymać
     * kierunek użytkownika(kierunek rucho, względem poprzedniej lokacji
     * będziemy liczyć kąt od ostatniego puntku, oraz ostatiego początku linii
     * jeśli kąt lokalny przekroczy 5 stopni to zaczniemy nową linię tak samo z kątem
     * do ostatniego począku linii
     * also jeśli linia jest dłuższa niż 100m to automatycznie zaczynamy następną
     */
    // locations.forEach((n) => locationss.push(n.coords));

    addLocations(locations.map((n) => ({latitude : n.coords.latitude, longitude : n.coords.longitude})));
    // console.log(locationss);
    console.log("len: ",locationss.coords.length);
    
    // useMapStore.setState({
    //   locations: [...locationss],
    // });

    // { latitude: lat, longitude: long }] });
    // addLocation({ latitude: lat, longitude: long });

    // console.log(useMapStore.getState().locations);
    // console.log("test", useMapStore.getState().testobject);

    // console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${long}`);
    console.log(
      "Received new locations",
      locations.map((l) => l.coords)
    );
  }
});

export default function App() {
  // listAllMaps();
  // ensureMapDirExists();
  // createNewMap("testowa_mapa");
  const isTunnel = true;
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
      {isTunnel && <StatusBar style="auto" />}
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
          <Nor.Screen name="Nagraj" component={MapEditScreen} />
          {/* <Nor.Screen name="Opcje" component={MapEditScreen} /> */}
          <Nor.Screen name="EdycjaMap" component={StopPointEditScreen} />
          <Nor.Screen name="NagrywanieAudio" component={AudioRecordingScreen} />
          <Nor.Screen name="PrzegladanieMap" component={MapExplorerScreen} />
          <Nor.Screen name="PodgladMap" component={MapViewScreen} />
        </Nor.Navigator>
      </NavigationContainer>
      <BottomBar navigationRef={navigationRef} currentRoute={currentScreen} />
    </>
  );
}
