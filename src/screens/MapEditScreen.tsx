import { ActivityIndicator, BackHandler, Text, ToastAndroid, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MapView, { LatLng, MapPressEvent, Marker, Polyline } from "react-native-maps";
import { mapstyleSilver } from "../providedfiles/Export";
import Markers from "../components/Markers";
import MapViewDirections from "react-native-maps-directions";
import { Waypoint, HealthPath, MediaFile } from "../utils/interfaces";
import SquareButton from "../components/SquareButton";
import tw from "../lib/tailwind";
import StopPoints from "../components/StopPoints";
import { useLocationTrackingStore, useMapStore } from "./../stores/store";
import { saveMap } from "../utils/FileSystemManager";
import uuid from "react-native-uuid";

import * as Location from "expo-location";
import TrackLine from "../components/TrackLine";
import { StackActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import MapInfoModal from "./../components/MapInfoModal";
import { headingDistanceTo } from "geolocation-utils";
import { getLocationPermissions, getRoute } from "../utils/HelperFunctions";
import StopPointPopUp from "../components/StopPointPopUp";
import AddPointModal from "../components/AddPointModal";
import EditWaypointModal from "../components/EditWaypointModal";

import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
} from "react-native-reanimated";
import TipDisplay from "../components/TipDisplay";
import { useAtom } from "jotai";
import {
  initialRegionAtom,
  mapEditorStateAtom,
  showHandlesAtom,
  zoomAtom,
} from "../config/AtomsState";
import MapGUIButton from "../components/MapGUIButton";
import { useShowable } from "../hooks/useShowable";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { ModalChoice, useAlertModal } from "../components/ModalChoice";
import { gApiKey } from "../config/firebase";
import ZoomGUI from "../components/ZoomGUI";

export type curmodalOpenType =
  | "None"
  | "MapInfo"
  | "StopPoint"
  | "AddPoint"
  | "EditWaypoint"
  | "WaypointsList";

const [maxWaypoints, maxStops] = [10, 20];

/**
 * Ekran edycji ścieżki ekran w któym znajduje się ścieżka i można ją tworzyć poprzez nagrywanie i planowanie
 * @category Ekrany
 * @param {*} navigation_props { navigation, route }
 * @component
 */
const MapEditScreen = ({ navigation, route }) => {
  const isInRecordingState = route.params.isRecording as boolean;
  const force = useForceUpdate();
  const mapRef = useRef<MapView>();
  const [isWatchingposition, setIsWatchingposition] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [pointPivot, setPointPivot] = useState(null as LatLng);
  const [currentModalOpen, setCurrentModalOpen] = useState<curmodalOpenType>("None"); //
  const [showHandles, setShowHandles] = useAtom(showHandlesAtom);
  const [mapEditState, setMapEditState] = useAtom(mapEditorStateAtom);
  const [initialRegion] = useAtom(initialRegionAtom);
  const [, setZoom] = useAtom(zoomAtom);
  const [isRecordedHealthPath, setIsRecordedHealthPath] = useState(false);
  const [blockInteractability, setBlockInteractability] = useState(false);
  const [tipVisible, showTip] = useShowable(2000);
  const [tipMessage, setTipMessage] = useState("Dotknij aby dodać lub edytować punkt");
  const [selectedStop, setSelectedStop] = useState(null as Waypoint);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null as LatLng);
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [stopPoints, setStopPoints] = useState<Waypoint[]>([]);
  const [fullPath, setFullPath] = useState([] as LatLng[]);
  const [alertModalState, alertShow, setAlertState] = useAlertModal();
  const [initialRecorddingPrompt, setInitialRecorddingPrompt] = useState(false);

  const [startBackgroundTracking, stopBackgroundTracking, isRecording, checkRecording] =
    useLocationBackground(alertShow);
  const [currentMap, setCurrentMap, resetCurrentMap, notSaved, setNotSaved] = useMapStore(
    (state) => [
      state.currentMap,
      state.setCurrentMap,
      state.resetCurrentMap,
      state.notSaved,
      state.setNotSaved,
    ]
  );

  usePreventBack(alertShow);

  useEffect(() => {
    if (!route.params?.navigateTo) return;
    if (!notSaved && route.params?.navigateTo?.route) {
      navigation.navigate(route.params.navigateTo.route, route.params.navigateTo?.params ?? {});
      return;
    }
    alertShow(
      "Masz niezapisane zmiany. Czy na pewno chcesz opuścić tworzenie ścieżki?",
      [
        {
          text: "Tak",
          icon: "sign-out-alt",
          onPress: async () => {
            useMapStore.getState().resetCurrentMap();
            useMapStore.getState().setNotSaved(false);
            navigation.dispatch(
              StackActions.replace(
                route.params.navigateTo.route,
                route.params.navigateTo?.params ?? {}
              )
            );
          },
        },
        {
          text: "Nie",
          icon: "arrow-left",
          onPress: () => {
            return;
          },
        },
      ],
      true
    );
  }, [route.params.navigateTo]);

  useEffect(() => {
    if (currentMap.path === undefined) {
      if (!currentMap || currentMap.map_id === "") resetCurrentMap();
      (async () => {
        const loc = await Location.getCurrentPositionAsync();
        await new Promise((r) => setTimeout(r, 100));
        if (!mapRef.current) return;
        mapRef.current.animateToRegion(
          {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.2,
          },
          0
        );
        const cam = await mapRef.current.getCamera();
        setZoom(156543.03392 / Math.pow(2, cam.zoom));
      })();
    } else {
      //
      if (currentMap.waypoints.length === 0 && currentMap?.path?.length > 0)
        setIsRecordedHealthPath(true);
      setWaypoints(currentMap.waypoints);
      setStopPoints(currentMap.stops);
      setFullPath(currentMap.path);

      setTimeout(async () => {
        await mapRef.current.fitToCoordinates(currentMap.path, {
          edgePadding: { top: 100, right: 100, bottom: 50, left: 50 },
          animated: false,
        });
        mapRef.current.getCamera().then((c) => {
          setZoom(156543.03392 / Math.pow(2, c.zoom));
        });
      }, 20);
    }

    if (isInRecordingState) {
      setInitialRecorddingPrompt(true);
    }
    return () => {
      resetCurrentMap();
      setWaypoints([]);
      setStopPoints([]);
      setFullPath([]);
      useLocationTrackingStore.getState().clearLocations();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkRecording();
      return () => {
        if (route.name === "Nagraj" && isInRecordingState) return;
        if (route.name === "Planuj" && !isInRecordingState) return;
        if (route.name !== "EdycjaMap" && route.name !== "NagrywanieAudio") {
          setAlertState({ ...alertModalState, visible: false });
          setCurrentModalOpen("None");
          if (isRecording) {
            useLocationTrackingStore.getState().clearLocations();
          }
          resetCurrentMap();
        }
      };
    }, [navigation, route])
  );

  /**
   * Funkcja zmieniające współrzędne punktów początkowego i końcowego trasy na takie które trzymają się drogi
   * @param {LatLng[]} cords
   */
  function snapEnds(cords: LatLng[]) {
    if (waypoints.length < 2) return;
    waypoints[0] = cords[0];
    waypoints[waypoints.length - 1] = cords[cords.length - 1];
  }

  /**
   * Funkcja dodająca nowy punkt do trasy
   * @param {LatLng} cords współrzędne punktu
   * @param {("waypoint" | "stop")} type typ punktu
   * @param {number} [position=waypoints.length] pozycja w tablicy
   * @return {(null|Waypoint)} jeśli dodany punkt jest punktem stopu to go zwraca
   */
  function addNewWaypoint(
    cords: LatLng,
    type: "waypoint" | "stop",
    position: number = waypoints.length
  ): null | Waypoint {
    //HACK may not work propertly
    switch (type) {
    case "waypoint":
      if (waypoints.length >= maxWaypoints) {
        ToastAndroid.show(
          "Nie dodano, maksymalna ilość punktów trasy została osiągnięta",
          ToastAndroid.SHORT
        );
        return null;
      }
      waypoints.splice(position, 0, cords);
      setNotSaved(true);
      force();
      break;
    case "stop":
      if (stopPoints.length >= maxStops) {
        ToastAndroid.show(
          "Nie dodano, maksymalna ilość punktów stopu została osiągnięta",
          ToastAndroid.SHORT
        );
        return null;
      }
      const newStop = {
        waypoint_id: uuid.v4(),
        displayed_name: "",
        coordinates: cords,
        description: "",
      } as Waypoint;
      stopPoints.push(newStop);
      setNotSaved(true);
      return newStop;
    }
    return null;
  }
  /**
   * Funkcja animująca kamerę do punktu
   * @param {LatLng} point współrzędne punktu
   * @param {number} [zoom=undefined] zoom
   * @param {number} [time=300] czas animacji
   */
  async function animateToPoint(point: LatLng, zoom: number = undefined, time: number = 300) {
    mapRef.current.animateCamera({ center: point, zoom: zoom ?? undefined }, { duration: time });
    await new Promise((resolve) => setTimeout(resolve, time));
  }
  /**
   * Funkcja zapisująca ścieżkę
   * @param {string} name nazwa ścieżki
   * @param {string} description opis ścieżki
   * @param {MediaFile} mapIcon ikona ścieżki
   * @return {(string | null)} zwraca null jeśli zapisano poprawnie, w przeciwnym wypadku zwraca string z błędem
   */
  async function saveMapEvent(
    name: string,
    description: string,
    mapIcon: MediaFile
  ): Promise<string | void> {
    if (!isInRecordingState && waypoints.length < 2)
      return "NIE ZAPISANO ŚCIEŻKI, Dodaj przynajmniej dwa punkty do trasy";
    let p = [];
    if (isInRecordingState) p = [...useLocationTrackingStore.getState().getOutputLocations()];
    else p = [...fullPath];

    if (p.length <= 0) return "NIE ZAPISANO ŚCIEŻKI, Brak trasy...";

    let xd = {
      ...currentMap,
      name: name,
      description: description,
      imageIcon: mapIcon,
      waypoints: [...waypoints],
      stops: [...stopPoints],
      path: [...p],
    } as HealthPath;

    const geoCode = await Location.reverseGeocodeAsync(p[0]);

    if (geoCode.length > 0 && geoCode[0].city) xd.location = geoCode[0].city;

    setShowUserLocation(false);
    mapRef.current.fitToCoordinates([...waypoints, ...p], {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: false,
    });
    const cam = await mapRef.current.getCamera();
    setZoom(156543.03392 / Math.pow(2, cam.zoom));
    await new Promise((r) => setTimeout(r, 100));
    const uri = await mapRef.current.takeSnapshot({
      width: 350, // optional, when omitted the view-width is used
      height: 700, // optional, when omitted the view-height is used
      format: "jpg", // image formats: 'png', 'jpg' (default: 'png')
      quality: 0.8, // image quality: 0..1 (only relevant for jpg, default: 1)
      result: "file", // result types: 'file', 'base64' (default: 'file')
    });
    setShowHandles(true);
    setShowUserLocation(true);

    xd.imagePreview = {
      media_id: uuid.v4(),
      storage_type: "cache",
      type: "image",
      path: uri,
    } as MediaFile;

    setCurrentMap(xd);

    await saveMap(xd);
    return;
  }
  /**
   * Funkcja wywoływana przy naciśnięciu na ścieżkę
   * @param {MapPressEvent} e zdarzenie naciśnięcia na mapę
   */
  async function onPressMap(e: MapPressEvent) {
    e.persist();

    if (mapEditState === "Idle") {
      setPointPivot(e.nativeEvent.coordinate);
      mapEditState === "Idle" && setCurrentModalOpen("AddPoint");
      await animateToPoint(e.nativeEvent.coordinate);
      setMapEditState("Idle");
      setSelectedStop(null);
      setSelectedWaypoint(null);
      return;
    }
    if (mapEditState === "MovingWaypoint")
      waypoints.splice(waypoints.indexOf(selectedWaypoint), 1, {
        ...e.nativeEvent.coordinate,
      });
    else if (mapEditState === "MovingStopPoint")
      selectedStop.coordinates = {
        ...e.nativeEvent.coordinate,
      };
    await animateToPoint(e.nativeEvent.coordinate);
    setMapEditState("Idle");
    force();
  }
  /**
   * Funkcja wywoływana przy naciśnięciu Zapisz w modalu zapisu ścieżki
   * @param {string} name nazwa ścieżki
   * @param {string} description
   * @param {boolean} asNew
   * @param {MediaFile} mapIcon
   * @return {*}  {Promise<boolean>}
   */
  async function onSave(
    name: string,
    description: string,
    asNew: boolean,
    mapIcon: MediaFile
  ): Promise<boolean> {
    setBlockInteractability(true);
    try {
      if (asNew) currentMap.map_id = uuid.v4().toString();
      const good = await saveMapEvent(name, description, mapIcon);

      if (typeof good === "string") {
        ToastAndroid.show(good, ToastAndroid.SHORT);
        setNotSaved(true);
        setBlockInteractability(false);
        return true;
      } else ToastAndroid.show("Zapisano Ścieżkę!", ToastAndroid.SHORT);
    } catch (e) {}
    setNotSaved(false);
    setBlockInteractability(false);
    return false;
  }
  /**
   * Funckja wywoływana przy czyszczeniu mapy, pyta się użytkownika czy na pewno chce wyczyścić trasę
   */
  function onClear() {
    alertShow(
      "Czy na pewno chcesz wyczyścić trasę?",
      [
        {
          text: "Czyść",
          icon: "trash",
          onPress: () => {
            if (isInRecordingState) {
              useLocationTrackingStore.getState().clearLocations();
              stopBackgroundTracking();
            } else {
              setFullPath([]);
              setWaypoints([]);
              setIsRecordedHealthPath(false);
              if (stopPoints.length === 0) setNotSaved(false);
            }
          },
        },
        {
          text: "Anuluj",
          icon: "arrow-left",
        },
      ],
      true
    );
  }

  /**
   * Funkcja wywoływana przy naciśnięciu na przycisk pauzy/wznowienia
   * w przypadku gdy jest nagrywana ścieżka, pyta użytkownika czy na pewno chce zatrzymać nagrywanie
   * w przeciwnym wypadku rozpoczyna nagrywanie
   */
  function onPausePress() {
    isRecording
      ? alertShow(
        "Zatrzymać nagrywanie?",
        [
          {
            text: "Zatrzymaj",
            icon: "pause",
            onPress: () => {
              stopBackgroundTracking();
            },
          },
          {
            text: "Anuluj",
            icon: "arrow-left",
          },
        ],
        true
      )
      : startBackgroundTracking();
  }

  return (
    <View style={tw`relative`} pointerEvents={blockInteractability ? "none" : "auto"}>
      <ModalChoice {...alertModalState} />
      <EditWaypointModal
        visible={currentModalOpen === "EditWaypoint"}
        hide={() => {
          setCurrentModalOpen("None");
        }}
        onDelete={() => {
          waypoints.splice(waypoints.indexOf(selectedWaypoint), 1);
          setSelectedWaypoint(null);
        }}
        onMove={() => {
          setMapEditState("MovingWaypoint");
        }}
      />
      <AddPointModal
        isRecordingMode={isInRecordingState || isRecordedHealthPath}
        visible={currentModalOpen === "AddPoint"}
        hide={() => {
          setPointPivot(null);
          setCurrentModalOpen("None");
        }}
        onStopPointAdd={() => {
          setCurrentModalOpen("None");
          const stoppint = addNewWaypoint(pointPivot, "stop");
          if (stoppint === null) return;
          setTimeout(() => {
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: stoppint, isEdit: true },
            });
          }, 1);
        }}
        onWaypointAdd={(position: number) => {
          addNewWaypoint(pointPivot, "waypoint", position);
        }}
        waypointsLength={waypoints.length}
      />
      <StopPointPopUp
        visible={currentModalOpen === "StopPoint"}
        stopPoint={selectedStop}
        hide={() => setCurrentModalOpen("None")}
        onEdit={() =>
          setTimeout(() => {
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: selectedStop, isEdit: true },
            });
          }, 1)
        }
        onDelete={() => {
          stopPoints.splice(stopPoints.indexOf(selectedStop), 1);
          setSelectedStop(null);
        }}
        onMove={() => setMapEditState("MovingStopPoint")}
      />
      <MapInfoModal
        visible={currentModalOpen === "MapInfo"}
        onRequestClose={() => {
          setCurrentModalOpen("None");
          setShowHandles(true);
          setShowUserLocation(true);
        }}
        onSave={onSave}
      />
      <View
        style={tw`w-full h-full bg-red-600 ${
          isRecording && isInRecordingState ? "border-4 border-red-600" : ""
        }`}>
        <MapView
          ref={(r) => (mapRef.current = r)}
          style={tw`flex-1`}
          toolbarEnabled={false}
          showsMyLocationButton={false}
          showsCompass={true}
          minZoomLevel={7}
          maxZoomLevel={20}
          showsUserLocation={showUserLocation}
          initialRegion={initialRegion}
          customMapStyle={mapstyleSilver}
          onPress={onPressMap}
          onTouchStart={() => {
            setTipMessage(
              mapEditState === "Idle"
                ? "Dotknij aby dodać lub edytować punkt"
                : "Dotknij aby przenieśc punkt"
            );
            showTip();
          }}
          onRegionChangeComplete={(e, { isGesture }) => {
            if (isGesture) setIsWatchingposition(false);
            mapRef.current.getCamera().then((c) => {
              setZoom(156543.03392 / Math.pow(2, c.zoom));
            });
          }}
          onUserLocationChange={(coordinate) => {
            isWatchingposition && animateToPoint(coordinate.nativeEvent.coordinate);
          }}>
          {pointPivot !== null && <Marker coordinate={pointPivot} title="Nowy punkt" />}
          <Markers
            waypoints={waypoints}
            selectedWaypoint={selectedWaypoint}
            onWaypointPressed={(w: LatLng) => {
              animateToPoint(w);
              setCurrentModalOpen("EditWaypoint");
              setSelectedWaypoint(w);
            }}
          />
          <StopPoints
            waypoints={stopPoints}
            selectedStop={selectedStop}
            stopPointPressed={(w: Waypoint) => {
              animateToPoint(w.coordinates);
              setCurrentModalOpen("StopPoint");
              setSelectedStop(w);
            }}
          />

          {waypoints.length > 1 && (
            <>
              <MapViewDirections
                origin={waypoints[0]}
                destination={waypoints[waypoints.length - 1]}
                waypoints={waypoints.slice(1, -1)}
                mode={"WALKING"}
                apikey={gApiKey}
                strokeWidth={8}
                strokeColor="#ffc800"
                precision={"low"}
                optimizeWaypoints
                zIndex={2}
                onReady={(n) => {
                  const adress = n.legs[0].start_address;
                  snapEnds(n.coordinates);
                  setFullPath(n.coordinates);
                  currentMap.distance = n.distance * 1000;
                }}
              />
              <Polyline coordinates={fullPath} strokeColor="black" strokeWidth={12} zIndex={1} />
            </>
          )}

          {(isInRecordingState || isRecordedHealthPath) && (
            <TrackLine
              isRecordingFinished={!isRecording}
              isEdit={isRecordedHealthPath}
              coords={fullPath}
            />
          )}
        </MapView>
      </View>

      {tipVisible && (
        <TipDisplay
          tipMessage={tipMessage}
          hideWaypoints={isInRecordingState || isRecordedHealthPath}
          currentPoints={waypoints.length}
          currentStops={stopPoints.length}
          maxPoints={maxWaypoints}
          maxStops={maxStops}
        />
      )}

      <Animated.View
        style={tw`absolute w-auto mt-16 md:mt-30 right-2 bg-main-200 self-end overflow-hidden rounded-2xl border-2`}
        pointerEvents="auto"
        entering={FadeInRight}
        exiting={FadeOutRight}>
        {isInRecordingState && (
          <MapGUIButton
            colorOverride={isRecording && isInRecordingState && "bg-red-600"}
            style={tw`self-end border-b-2 mt-auto`}
            label={isRecording ? "pauza" : "wznów"}
            icon={isRecording ? "pause" : "record-vinyl"}
            onPress={onPausePress}
          />
        )}
        <MapGUIButton
          style={tw`self-end border-b-2 mt-auto`}
          label={"zapisz"}
          icon="save"
          onPress={() => {
            setCurrentModalOpen("MapInfo");
            setShowHandles(false);
            setShowUserLocation(false);
          }}
          disabled={isRecording && isInRecordingState}
        />
        <MapGUIButton
          colorOverride={isWatchingposition && "bg-blue-600"}
          style={tw`self-end border-b-2 mt-auto`}
          label={"centruj"}
          icon="location-arrow"
          onPress={async () => {
            setIsWatchingposition((p) => !p);
            if (isWatchingposition) return;
            const loc = await Location.getLastKnownPositionAsync();
            animateToPoint(loc.coords as LatLng, 15, 100);
          }}
        />
        <MapGUIButton
          style={tw`self-end border-b-2 mt-auto`}
          label={"czyść"}
          icon="trash"
          onPress={onClear}
        />

        <MapGUIButton
          colorOverride={showHandles && "bg-main-500"}
          style={tw`self-end mt-auto`}
          label={showHandles ? "ukryj" : "pokaż"}
          icon="map-pin"
          onPress={() => {
            setShowHandles((p) => !p);
            force();
          }}
        />
      </Animated.View>

      <ZoomGUI mapRef={mapRef} />

      {initialRecorddingPrompt && (
        <View style={tw`absolute w-full h-full flex bg-slate-100 items-center justify-center`}>
          <SquareButton
            size={60}
            labelStyle={tw`text-3xl`}
            label="Rozpocznij nagrywanie"
            icon="play"
            onPress={() => {
              startBackgroundTracking().then(() => setInitialRecorddingPrompt(false));
            }}
          />
        </View>
      )}
      {blockInteractability && (
        <View
          style={tw`absolute w-full flex items-center justify-center h-full bg-opacity-70 bg-black`}>
          <ActivityIndicator style={tw`w-60 h-60 bg-opacity-0`} size={200} />
        </View>
      )}
    </View>
  );
};

export default MapEditScreen;

/**
 * Hook do obsługi lokalizacji w tle, wywietla alert o wypenieniu trasy
 * @return {*} [startBackgroundTracking, stopBackgroundTracking, isRecording, checkRecording] - funkcja do uruchomienia w tle, funkcja do zatrzymania w tle, czy nagrywanie się odbywa, funkcja do sprawdzenia czy nagrywanie się odbywa
 */
function useLocationBackground(
  alertShow: (
    label: string,
    args: {
      text: string;
      icon?: string;
      onPress?: () => any;
    }[],
    hideCancel?: boolean
  ) => void
) {
  const [isRecording, setIsRecording] = useState(false);

  async function startBackgroundTracking() {
    const startBckg = () =>
      Location.startLocationUpdatesAsync("location_tracking", {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        timeInterval: 1000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Ścieżki Zdrowia",
          notificationBody: "Trasa ścieżki zdrowia nagrywa się w tle",
          notificationColor: "#fff",
        },
      });

    const perms = await getLocationPermissions();
    if (!perms) return;

    const startedTracking = await Location.hasStartedLocationUpdatesAsync("location_tracking");

    const start = useLocationTrackingStore.getState().currentLine.end;
    let end = {} as LatLng;
    let distance = 0;
    if (start) {
      const loc = await Location.getCurrentPositionAsync();
      end = { longitude: loc.coords.longitude, latitude: loc.coords.latitude } as LatLng;
      distance = headingDistanceTo(start, end).distance;
    }

    if (distance > 100) {
      alertShow("wypełnić brakującą trasę?", [
        {
          text: "Tak",
          icon: "sign-out-alt",
          onPress: async () => {
            const locs = await getRoute(start, end);
            useLocationTrackingStore.getState().addLocations(locs, Date.now());
            await startBckg();
            setIsRecording(true);
          },
        },
        {
          text: "Nie",
          icon: "arrow-left",
          onPress: async () => {
            await startBckg();
            setIsRecording(true);
          },
        },
      ]);
      return;
    }
    setIsRecording(true);
    startBckg();
  }

  async function stopBackgroundTracking() {
    Location.hasStartedLocationUpdatesAsync("location_tracking").then((res) => {
      setIsRecording(false);
      if (!res) return;
      Location.stopLocationUpdatesAsync("location_tracking");
    });
  }

  async function checkRecording() {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync("location_tracking");
    setIsRecording(hasStarted);
  }
  return [startBackgroundTracking, stopBackgroundTracking, isRecording, checkRecording] as const;
}
/**
 * Hook do zapobiegania wyjściu z ekranu bez zapisania, wyświetla alert
 * @param {*} alertShow funkcja do wyświetlania alertów
 */
function usePreventBack(
  alertShow: (
    label: string,
    args: {
      text: string;
      icon?: string;
      onPress?: () => any;
    }[],
    hideCancel?: boolean
  ) => void
) {
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      if (!useMapStore.getState().notSaved) return false;
      if (!navigation.isFocused()) return false;
      alertShow(
        "Masz niezapisane zmiany. Czy na pewno chcesz opuścić tworzenie ścieżki?",
        [
          {
            text: "Tak",
            icon: "sign-out-alt",
            onPress: () => {
              useMapStore.getState().resetCurrentMap();
              useMapStore.getState().setNotSaved(false);
              navigation.dispatch(StackActions.pop());
            },
          },
          {
            text: "Nie",
            icon: "arrow-left",
            onPress: () => {
              return;
            },
          },
        ],
        true
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [navigation]);
}
