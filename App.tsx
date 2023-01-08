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
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomBar } from "./src/components/BottomBar";
import StopPointEditScreen from "./src/screens/StopPointEditScreen";
import AudioRecordingScreen from "./src/screens/AudioRecordingScreen";
import MapViewScreen from "./src/screens/MapViewScreen";
import MapExplorerScreen from "./src/screens/MapExplorerScreen";
import { createNewMap, ensureMapDirExists, listAllMaps } from "./src/utils/FileSystemManager";

import * as TaskManager from "expo-task-manager";
import { useLocationTrackingStore, useMapStore } from "./src/stores/store";
import { LatLng } from "react-native-maps";
import LogInScreen from "./src/screens/LogInScreen";
import OptionsScreen from "./src/screens/OptionsScreen";
import MapWebExplorerScreen from "./src/screens/MapWebExplorerScreen";
import MapWebPreview from "./src/screens/MapWebPreviewScreen";

// MapboxGL.setWellKnownTileServer('Mapbox')
// MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')

const Navigator = createNativeStackNavigator();
console.log(StatusBar.currentHeight);

export default function App() {
  // listAllMaps();
  // ensureMapDirExists();
  // createNewMap("testowa_mapa");
  const isTunnel = false;
  const navigationRef = useNavigationContainerRef();
  //context api variable
  const [currentScreen, setCurrentScreen] = useState("");

  useEffect(() => {
    TaskManager.unregisterAllTasksAsync();
  }, []);

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
        <Navigator.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Navigator.Screen name="Trasy" component={HomeScreen} />
          <Navigator.Screen name="Nagraj" component={MapEditScreen} />
          {/* <Nor.Screen name="Opcje" component={MapEditScreen} /> */}
          <Navigator.Screen name="EdycjaMap" component={StopPointEditScreen} />
          <Navigator.Screen name="NagrywanieAudio" component={AudioRecordingScreen} />
          <Navigator.Screen name="PrzegladanieMap" component={MapExplorerScreen} />
          <Navigator.Screen name="PrzegladanieWebMap" component={MapWebExplorerScreen} />
          <Navigator.Screen name="MapWebPreviewScreen" component={MapWebPreview} />
          <Navigator.Screen name="PodgladMap" component={MapViewScreen} />
          <Navigator.Screen name="LogIn" component={LogInScreen} />
          <Navigator.Screen name="Opcje" component={OptionsScreen} />
        </Navigator.Navigator>
      </NavigationContainer>

      <BottomBar navigationRef={navigationRef} currentRoute={currentScreen} />
    </>
  );
}
TaskManager.defineTask("location_tracking", async ({ data, error }) => {
  const addLocations = useLocationTrackingStore.getState().addLocations;
  const locationss = useLocationTrackingStore.getState().locations;
  const rec = useLocationTrackingStore.getState().currentRecording;
  const stamp = useLocationTrackingStore.getState().highestTimestamp;

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
    console.log(stamp);
    console.log(locationss.coords.length, rec);
    addLocations(
      locations
        .filter((n) => n.timestamp > stamp)
        .map((n) => ({ latitude: n.coords.latitude, longitude: n.coords.longitude })),
      Math.max(locations.map((n) => n.timestamp))
    );
    if (locations.length > 1)
      console.log(
        "Received new locations",
        locations.map((l) => [l.coords.longitude, l.coords.latitude])
      );
  }
});
