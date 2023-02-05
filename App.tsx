import { StatusBar, Text } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { LatLng } from "react-native-maps";
import { useAtom } from "jotai";
import {
  NavigationContainer,
  StackActions,
  useNavigationContainerRef,
} from "@react-navigation/native";

import MapEditScreen from "./src/screens/MapEditScreen";
import HomeScreen from "./src/screens/HomeScreen";
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomBar } from "./src/components/BottomBar";
import StopPointEditScreen from "./src/screens/StopPointEditScreen";
import AudioRecordingScreen from "./src/screens/AudioRecordingScreen";
import MapViewScreen from "./src/screens/MapViewScreen";
import MapExplorerScreen from "./src/screens/MapExplorerScreen";
import { useLocationTrackingStore, useMapStore } from "./src/stores/store";
import OptionsScreen from "./src/screens/OptionsScreen";
import MapWebExplorerScreen from "./src/screens/MapWebExplorerScreen";
import MapWebPreview from "./src/screens/MapWebPreviewScreen";
import { initialRegionAtom } from "./src/config/AtomsState";
import tw from "./src/lib/tailwind";
import { useDeviceContext } from "twrnc/dist/esm/hooks";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import { parse, Url } from "url";
import HelpScreen from "./src/screens/HelpScreen";
import OtherSettingsScreen from "./src/screens/OtherSettingsScreen";
import { getLocationPermissions } from "./src/utils/HelperFunctions";
import { useDownloadTrackingStore } from "./src/stores/DownloadTrackingStore";

const Navigator = createNativeStackNavigator();

useDownloadTrackingStore.getState().validateDownloadTracker();

const sensitiveTabs = ["Nagraj", "Planuj", "NagrywanieAudio", "EdycjaMap"];

/**
 * Główny komponent, punkt wejścia aplikacji
 * @component App
 */
export default function App() {
  const navigationRef = useNavigationContainerRef();
  useDeviceContext(tw);

  const [currentScreen, setCurrentScreen] = useState("Trasy");
  const [, setInitialRegion] = useAtom(initialRegionAtom);

  /**
   *
   * @param to ekran do której ma być przekierowany użytkownik
   * @param options opcje przekazywane do ekranu
   */
  function handleNav(to: string, options: object) {
    const route = navigationRef.getCurrentRoute().name;
    if (sensitiveTabs.includes(route)) return;
    else navigationRef.navigate(to, options);
  }
  /**
   * Funckja przekierowująca użytkownika do ekranu z mapą na podstawie linku
   * @param link link dynamiczny
   */
  function handleDynamicLink(link: any) {
    const parsedUrl = parse(link.url, true);
    if (link.url) {
      if (parsedUrl.pathname === "/pathes" && parsedUrl.query["id"]) {
        handleNav("MapWebPreviewScreen", { id: parsedUrl.query["id"] });
      }
    }
  }

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    TaskManager.unregisterAllTasksAsync();
    setInitialRegion({
      latitude: 52,
      longitude: 19,
      latitudeDelta: 2.5,
      longitudeDelta: 2.5,
    });
    getPermsAndSetLocation().then((coords) => {
      if (!coords) return;
      setInitialRegion({
        ...coords,
        latitudeDelta: 0.2,
        longitudeDelta: 0.1,
      });
    });
  }, []);

  useEffect(() => {
    if (!["NagrywanieAudio", "EdycjaMap", "Nagraj"].includes(currentScreen)) {
      Location.hasStartedLocationUpdatesAsync("location_tracking").then((res) => {
        if (!res) return;
        Location.stopLocationUpdatesAsync("location_tracking");
      });
    }
  }, [currentScreen]);

  return (
    <>
      <StatusBar
        barStyle={tw.prefixMatch("dark") ? "light-content" : "dark-content"}
        backgroundColor={tw.prefixMatch("dark") ? "black" : "white"}
      />
      <NavigationContainer
        ref={navigationRef}
        onStateChange={(key) => setCurrentScreen(key.routes[key.index].name)}
        fallback={<Text>Ładowanie...</Text>}>
        <Navigator.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Navigator.Screen name="Trasy" component={HomeScreen} />
          <Navigator.Screen name="Opcje" component={OptionsScreen} />
          <Navigator.Screen name="Nagraj" component={MapEditScreen} />
          <Navigator.Screen name="Planuj" component={MapEditScreen} />
          <Navigator.Screen name="EdycjaMap" component={StopPointEditScreen} />
          <Navigator.Screen name="NagrywanieAudio" component={AudioRecordingScreen} />
          <Navigator.Screen name="PrzegladanieMap" component={MapExplorerScreen} />
          <Navigator.Screen name="PrzegladanieWebMap" component={MapWebExplorerScreen} />
          <Navigator.Screen name="MapWebPreviewScreen" component={MapWebPreview} />
          <Navigator.Screen name="PodgladMap" component={MapViewScreen} />
          <Navigator.Screen name="Pomoc" component={HelpScreen} />
          <Navigator.Screen name="Settings" component={OtherSettingsScreen} />
        </Navigator.Navigator>
      </NavigationContainer>
      <BottomBar navigationRef={navigationRef} currentRoute={currentScreen} />
    </>
  );
}

/* 
 wywołanie funkcji które rejestruje zadanie które można wywołać w tle
 jest to śledzenie lokalizacji użytkownika
 śledzi jego pozycje poprzez zapamiętywanie jego kierunku ruchu i konwertowanie jego kolejne współrzędne do lini
*/
TaskManager.defineTask("location_tracking", async ({ data, error }) => {
  const addLocations = useLocationTrackingStore.getState().addLocations;
  const stamp = useLocationTrackingStore.getState().highestTimestamp;
  const setNotSaved = useMapStore.getState().setNotSaved;
  const notSaved = useMapStore.getState().notSaved;

  !notSaved && setNotSaved(true);
  if (error) {
    return;
  }
  if (data) {
    const { locations } = data;
    addLocations(
      locations
        .filter((n) => n.timestamp > stamp)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((n) => ({ latitude: n.coords.latitude, longitude: n.coords.longitude })),
      Math.max(...locations.map((n) => n.timestamp))
    );
        
  }
});

/**
 * Funkcja prosząca użytkownika o dostęp do lokalizacji oraz zwracająca aktualną lokalizację użytkownika
 * @return {LatLng | undefined} aktualna lokacja użytkownika | brak
 */
async function getPermsAndSetLocation() {
  const perms = await getLocationPermissions();
  if (!perms) return undefined;
  const location = await Location.getLastKnownPositionAsync();
  if (!location) return undefined;
  const coords = location.coords as LatLng;
  return coords;
}
