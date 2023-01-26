import { StatusBar, Text } from "react-native";
import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";
import {
  OpenSans_700Bold,
  OpenSans_800ExtraBold,
  OpenSans_600SemiBold,
  OpenSans_500Medium,
  OpenSans_400Regular,
  OpenSans_300Light,
} from "@expo-google-fonts/open-sans";

import * as SplashScreen from "expo-splash-screen";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { LatLng } from "react-native-maps";
import { useAtom } from "jotai";
import {
  NavigationContainer,
  StackActions,
  useNavigationContainerRef,
} from "@react-navigation/native";
import * as Speech from "expo-speech";

import MapEditScreen from "./src/screens/MapEditScreen";
import HomeScreen from "./src/screens/HomeScreen";
import React, { useCallback, useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomBar } from "./src/components/BottomBar";
import StopPointEditScreen from "./src/screens/StopPointEditScreen";
import AudioRecordingScreen from "./src/screens/AudioRecordingScreen";
import MapViewScreen from "./src/screens/MapViewScreen";
import MapExplorerScreen from "./src/screens/MapExplorerScreen";
import { validateDownloadTracker } from "./src/utils/FileSystemManager";
import { useLocationTrackingStore, useMapStore } from "./src/stores/store";
import LogInScreen from "./src/screens/LogInScreen";
import OptionsScreen from "./src/screens/OptionsScreen";
import MapWebExplorerScreen from "./src/screens/MapWebExplorerScreen";
import MapWebPreview from "./src/screens/MapWebPreviewScreen";
import { initialRegionAtom } from "./src/config/AtomsState";
import AppText from "./src/components/AppText";
import tw from "./src/lib/tailwind";
import { useDeviceContext } from "twrnc/dist/esm/hooks";
import * as Linking from "expo-linking";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import { parse, Url } from "url";
import HelpScreen from "./src/screens/HelpScreen"

SplashScreen.preventAutoHideAsync();
const Navigator = createNativeStackNavigator();
validateDownloadTracker();
console.log(StatusBar.currentHeight);

const sensitiveTabs = ["Nagraj", "Planuj", "NagrywanieAudio", "EdycjaMap"];

export default function App() {
  const isTunnel = false;

  const navigationRef = useNavigationContainerRef();
  useDeviceContext(tw);

  const [currentScreen, setCurrentScreen] = useState("");
  const [, setInitialRegion] = useAtom(initialRegionAtom);

  const handleNav = (to: string, options: object) => {
    const route = navigationRef.getCurrentRoute().name;
    useMapStore.getState().setNavAction(() => {
      if (sensitiveTabs.includes(route)) navigationRef.dispatch(StackActions.replace(to, options));
      else navigationRef.navigate(to, options);
    });
  };

  const handleDynamicLink = (link) => {
    console.log(navigationRef.current.getCurrentRoute());

    console.log(link);
    const parsedUrl = parse(link.url, true);
    if (link.url) {
      if (parsedUrl.pathname === "/pathes" && parsedUrl.query["id"]) {
        handleNav("MapWebPreviewScreen", { id: parsedUrl.query["id"] });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    // When the component is unmounted, remove the listener
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    TaskManager.unregisterAllTasksAsync();
    setInitialRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.2,
      longitudeDelta: 0.1,
    });
    Location.getLastKnownPositionAsync().then((location) => {
      if (location) {
        const coords = location.coords as LatLng;
        console.log("startApp", coords);

        setInitialRegion({
          ...coords,
          latitudeDelta: 0.2,
          longitudeDelta: 0.1,
          // latitude: 1,
          // longitude: 1,
        });
      }
    });
  }, []);

  const [fontsLoaded] = useFonts({
    Inter_900Black,
    OpenSans_700Bold,
    OpenSans_800ExtraBold,
    OpenSans_600SemiBold,
    OpenSans_500Medium,
    OpenSans_400Regular,
    OpenSans_300Light,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    //TODO finish settings screen
    //[x] finish mapselect screen
    //[x] finish info screen
    //[x] finish mymaps screen
    //[x] add tracking position and making tracks by gps
    //[x] dodać możliwość eksportu mapy
    //TODO dodać możliwość udostępnienia mapy przez watsapp
    <>
      {/* <Provider> */}
      {isTunnel && <StatusBar style="auto" />}
      {/* <Text style={{ fontFamily: "OpenSans_700Bold", fontSize: 20 }}>Inter Black</Text> */}

      <NavigationContainer
        ref={navigationRef}
        onStateChange={(key) => {
          setCurrentScreen(key.routes[key.index].name);
        }}
        fallback={<AppText>Ładowanie...</AppText>}>
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
          <Navigator.Screen name="LogIn" component={LogInScreen} />
          <Navigator.Screen name="Pomoc" component={HelpScreen} />
        </Navigator.Navigator>
      </NavigationContainer>

      <BottomBar navigationRef={navigationRef} currentRoute={currentScreen} />
      {/* </Provider> */}
    </>
  );
}
TaskManager.defineTask("location_tracking", async ({ data, error }) => {
  const addLocations = useLocationTrackingStore.getState().addLocations;
  const locationss = useLocationTrackingStore.getState().locations;
  const rec = useLocationTrackingStore.getState().currentRecording;
  const stamp = useLocationTrackingStore.getState().highestTimestamp;
  const setNotSaved = useMapStore.getState().setNotSaved;
  const notSaved = useMapStore.getState().notSaved;
  console.log("setting not saved", notSaved);

  !notSaved && setNotSaved(true); //needed, otherwise we get rerendered xD
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
