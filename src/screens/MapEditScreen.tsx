import { ActivityIndicator, Alert, BackHandler, Text, ToastAndroid, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MapView, { LatLng, MapPressEvent, Marker, Polyline, Region } from "react-native-maps";
import { mapStylenoLandmarks, mapstyleSilver, mapStylesJSON } from "../providedfiles/Export";
import { Markers } from "../components/Markers";
import MapViewDirections from "react-native-maps-directions";
import Waypoint, { HealthPath, MediaFile } from "../utils/interfaces";
import SquareButton from "../components/SquareButton";
import { WaypointsList } from "../components/Waypoints";
import tw from "../lib/tailwind";
import StopPoints from "../components/StopPoints";
import { useLocationTrackingStore, useMapStore } from "./../stores/store";
import { saveMap } from "../utils/FileSystemManager";
import uuid from "react-native-uuid";

import * as Location from "expo-location";
import TrackLine from "../components/TrackLine";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import MapInfoModal from "./../components/MapInfoModal";
import { headingDistanceTo } from "geolocation-utils";
import { getLocationPermissions, getRoute } from "../utils/HelperFunctions";
import StopPointPopUp from "../components/StopPointPopUp";
import AddPointModal from "../components/AddPointModal";
import EditWaypointModal from "../components/EditWaypointModal";

import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
} from "react-native-reanimated";
import TipDisplay from "../components/TipDisplay";
import { atom, Provider, useAtom } from "jotai";
import {
  currentModalOpenAtom,
  initialRegionAtom,
  mapEditorStateAtom,
  showHandlesAtom,
  zoomAtom,
} from "../config/AtomsState";
import MapGUIButton from "../components/MapGUIButton";
import { useShowable } from "../hooks/useShowable";
import { useForceUpdate } from "../hooks/useForceUpdate";
//[x] make the alert for saving the map normal and functional
//[x] make option to fill the path with google directions if the path was stopped and resumed
//[x] make is moving stoppoint and is movingwaypoint into state machine
//[x] Dodać przyciski powiększania dodawania itp
//[x] Dodać logikę komponentu na tryby edycji ścieżek i inne
//TODO Rozdzielić na kilka pure komponentów
//[x] fix the bug with the map animate camera on start
//[x] Dodać możliwość tworzenia waypointów
//[x] zrobić jakiś pseudo enum stan który będzie decydował o tym który modal jest otwarty

export type curmodalOpenType =
  | "None"
  | "MapInfo"
  | "WaypointsList"
  | "StopPoint"
  | "AddPoint"
  | "EditWaypoint";

const zoomlevels = [7, 10, 13, 16, 18, 20];

const [maxWaypoints, maxStops] = [10, 2];

const MapEditScreen = ({ navigation, route }) => {
  let isPathEditable = false;
  const isInRecordingState = route.params.isRecording as boolean;
  const API_KEY = "***REMOVED***";
  // const [currentModalOpen, setCurrentModalOpen] = useState<curmodalOpenType>("None"); //
  const [showingTip, setShowingTip] = useState(3000);
  // const [mapEditState, setMapEditState] = useState<MapEditState>("Idle");
  const [selectedStop, setSelectedStop] = useState(null as Waypoint);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null as LatLng);

  const [isWatchingposition, setIsWatchingposition] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [pointPivot, setPointPivot] = useState(null as LatLng);

  const [showHandles, setShowHandles] = useAtom(showHandlesAtom);
  const [mapEditState, setMapEditState] = useAtom(mapEditorStateAtom);
  const [currentModalOpen, setCurrentModalOpen] = useState<curmodalOpenType>("None"); //
  const [initialRegion, setInitialRegion] = useAtom(initialRegionAtom);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [isRecordedHealthPath, setIsRecordedHealthPath] = useState(false);
  const [blockInteractability, setBlockInteractability] = useState(false);
  const [tipVisible, showTip] = useShowable(2000);
  const [tipMessage, setTipMessage] = useState("Dotknij aby dodać lub edytować punkt");

  const [
    currentMap,
    setCurrentMap,
    resetCurrentMap,
    notSaved,
    setNotSaved,
    navAction,
    executeNavAction,
  ] = useMapStore((state) => [
    state.currentMap,
    state.setCurrentMap,
    state.resetCurrentMap,
    state.notSaved,
    state.setNotSaved,
    state.navAction,
    state.executeNavAction,
  ]);
  const mapRef = useRef<MapView>();
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [stopPoints, setStopPoints] = useState<Waypoint[]>([]);
  const [fullPath, setFullPath] = useState([] as LatLng[]);
  const force = useForceUpdate();
  const [startBackgroundTracking, stopBackgroundTracking, isRecording, checkRecording] =
    useLocationBackground();

  //[x] uprościć funkcje zooma na początku mapy
  //[x] zmienić to na komponent który generuje markery trasy( chodziło mi o to żeby nie było tak że trzeba było wyciągać markery z waypointsApp)
  //TODO dodać możliwość rozpoczęcia od czystej karty na mapie, bez żadnej trasy

  //[x] dodać automatyczne robienie cover photo dla mapy
  //[x] Kliknięcie w mapęautomatycznie przenosi do edycji stoppointa

  function snapEnds(cords: LatLng[]) {
    if (waypoints.length < 2) return;
    waypoints[0] = cords[0];
    waypoints[waypoints.length - 1] = cords[cords.length - 1];
  }

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

  async function saveMapEvent(
    name: string,
    description: string,
    mapIcon: MediaFile
  ): Promise<string | void> {
    if (waypoints.length < 2) return "Dodaj przynajmniej dwa punkty do trasy";
    console.log(mapIcon); //HACK tutaj może coś się wywrócić

    let p = [];
    if (isInRecordingState) p = [...useLocationTrackingStore.getState().getOutputLocations()];
    else p = [...fullPath];
    console.log("plen", p.length, p);
    if (p.length <= 0) return "Brak ścieżki...";
    let xd = {
      ...currentMap,
      name: name,
      description: description,
      imageIcon: mapIcon,
      waypoints: [...waypoints],
      stops: [...stopPoints],
      path: [...p],
    };
    setShowUserLocation(false);
    mapRef.current.fitToCoordinates([...waypoints, ...p], {
      edgePadding: { top: 200, right: 10, bottom: 200, left: 10 },
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
    console.log("snapshot taken");
    xd.imagePreview = {
      media_id: uuid.v4(),
      storage_type: "cache",
      type: "image",
      path: uri,
    } as MediaFile;
    console.log("printing preview and icon onSaveEvent");

    console.log(xd.imagePreview);
    console.log(xd.imageIcon);

    setCurrentMap(xd);
    console.log("current map set");
    await saveMap(xd);
    return;
  }

  const onSave = async (
    name: string,
    description: string,
    asNew: boolean,
    mapIcon: MediaFile
  ): Promise<boolean> => {
    setBlockInteractability(true);
    try {
      if (asNew) currentMap.map_id = uuid.v4().toString();
      const good = await saveMapEvent(name, description, mapIcon); //[x] mordo tutaj trzeba to zamienić na asynca
      console.log(good);

      if (typeof good === "string") {
        ToastAndroid.show(good, ToastAndroid.SHORT);
        setNotSaved(false);
        setBlockInteractability(false);
        return true;
      } else ToastAndroid.show("Zapisano Mapę!", ToastAndroid.SHORT);
    } catch (e) {
      console.log(e, "AAAAAA");
    }
    setBlockInteractability(false);
    return false;
  };

  useEffect(() => {
    console.log("rerender ", mapEditState, showHandles, isRecording);
  });

  useEffect(() => {
    if (!navAction) return;
    console.log("Event Emitted");
    if (!notSaved) {
      setStopPoints([]);
      executeNavAction();
      return;
    }
    Alert.alert(
      "Porzucić zmiany?",
      "Masz niezapisane zmiany. Czy na pewno chcesz opuścić tworzenie mapy?",
      [
        {
          text: "Nie, Zostań",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Opusć",
          style: "destructive",
          onPress: () => {
            setStopPoints([]);
            executeNavAction();
          },
        },
      ]
    );
  }, [navAction]);

  useEffect(() => {
    if (currentMap.path === undefined) {
      console.log("elo");
      if (!currentMap || currentMap.map_id === "") resetCurrentMap();
      console.log("elo3");
      (async () => {
        const loc = await Location.getCurrentPositionAsync();
        console.log(loc);
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
      // console.log("itsrecordedHP", currentMap.waypoints, currentMap.stops, currentMap.path);
      if (currentMap.waypoints.length === 0 && currentMap?.path?.length > 0)
        setIsRecordedHealthPath(true);
      setWaypoints(currentMap.waypoints);
      setStopPoints(currentMap.stops);
      setFullPath(currentMap.path);
      console.log("elo2");
      console.log(currentMap);

      setTimeout(async () => {
        console.log("elo4");

        await mapRef.current.fitToCoordinates(currentMap.path, {
          edgePadding: { top: 100, right: 100, bottom: 50, left: 50 },
          animated: false,
        });
        mapRef.current.getCamera().then((c) => {
          setZoom(156543.03392 / Math.pow(2, c.zoom));
        });
      }, 0);
    }

    if (isInRecordingState) {
      console.log("clearing locations");
      setStopPoints([]);
      setWaypoints([]);
      setFullPath([]);
      setNotSaved(false);
    }

    return () => {
      console.log("unmounting");
      resetCurrentMap();
      setWaypoints([]);
      setStopPoints([]);
      setFullPath([]);
      useLocationTrackingStore.getState().clearLocations();
    };
  }, []);

  usePreventBack();

  useFocusEffect(
    useCallback(() => {
      checkRecording();
      return () => {
        // resetCurrentMap();
      };
    }, [navigation])
  );

  const animateToPoint = async (point: LatLng, zoom: number = undefined, time: number = 300) => {
    mapRef.current.animateCamera({ center: point, zoom: zoom ?? undefined }, { duration: time });
    await new Promise((resolve) => setTimeout(resolve, time));
  };

  async function onPressMap(e: MapPressEvent) {
    e.persist();
    console.log(mapEditState);
    if (mapEditState === "Idle") {
      setPointPivot(e.nativeEvent.coordinate);
      await animateToPoint(e.nativeEvent.coordinate);
      mapEditState === "Idle" && setCurrentModalOpen("AddPoint");
      setMapEditState("Idle");
      setSelectedStop(null);
      setSelectedWaypoint(null);
      return;
    }
    if (mapEditState === "MovingWaypoint")
      waypoints.splice(waypoints.indexOf(selectedWaypoint), 1, {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      });
    else if (mapEditState === "MovingStopPoint")
      selectedStop.coordinates = {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      };
    await animateToPoint(e.nativeEvent.coordinate);
    setMapEditState("Idle");
    force();
  }

  return (
    <View style={tw`relative`} pointerEvents={blockInteractability ? "none" : "auto"}>
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
          console.log("initiating move sequence");
          setMapEditState("MovingWaypoint");
        }}
      />
      <AddPointModal
        isRecordingMode={isInRecordingState || isRecordedHealthPath}
        visible={currentModalOpen === "AddPoint"}
        hide={() => {
          setPointPivot(null);
          setCurrentModalOpen("None");
          console.log("popclose");
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
          console.log(waypoints);
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
      <View style={tw`w-full h-full bg-red-600`}>
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
          onTouchStart={() => {
            setTipMessage(
              mapEditState === "Idle"
                ? "Dotknij aby dodać lub edytować punkt"
                : "Dotknij aby przenieśc punkt"
            );
            showTip();
          }}
          onPress={onPressMap}
          customMapStyle={mapstyleSilver}
          onRegionChangeComplete={(e, { isGesture }) => {
            if (isGesture) setIsWatchingposition(false);
            mapRef.current.getCamera().then((c) => {
              console.log("zoom", zoom);
              setZoom(156543.03392 / Math.pow(2, c.zoom));
            });
          }}
          onUserLocationChange={(coordinate) => {
            isWatchingposition &&
              mapRef.current.animateCamera({
                center: coordinate.nativeEvent.coordinate,
              });
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
            <MapViewDirections
              origin={waypoints[0]}
              destination={waypoints[waypoints.length - 1]}
              waypoints={waypoints.slice(1, -1)}
              mode={"WALKING"}
              apikey={API_KEY}
              strokeWidth={6}
              strokeColor="#ffc800"
              lineDashPattern={[0]}
              precision={"low"}
              optimizeWaypoints
              onReady={(n) => {
                const adress = n.legs[0].start_address;
                snapEnds(n.coordinates);
                setFullPath(n.coordinates);
                currentMap.distance = n.distance * 1000;
                currentMap.location = adress;
              }}
            />
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
          currentPoints={waypoints.length}
          maxPoints={maxWaypoints}
          currentStops={stopPoints.length}
          maxStops={maxStops}
          hideWaypoints={isInRecordingState}
        />
      )}

      <Animated.View
        style={tw`absolute w-auto mt-30 right-2 bg-main-200 self-end overflow-hidden rounded-2xl border-2`}
        pointerEvents="auto"
        entering={FadeInRight}
        exiting={FadeOutRight}>
        {isInRecordingState && (
          <>
            <MapGUIButton
              colorOverride={isRecording && "bg-red-600"}
              style={tw`self-end border-b-2 mt-auto`}
              label={isRecording ? "stop" : "start"}
              icon={isRecording ? "stop" : "record-vinyl"}
              onPress={() => {
                isRecording
                  ? (() => {
                    stopBackgroundTracking();
                  })()
                  : startBackgroundTracking();
              }}
            />
            <MapGUIButton
              style={tw`self-end border-b-2 mt-auto`}
              label={"czyść"}
              icon="trash"
              onPress={() => {
                Alert.alert(
                  "Czy na pewno chcesz usunąć wszystkie punkty?",
                  "Ta operacja jest nieodwracalna",
                  [
                    {
                      text: "Anuluj",
                      style: "cancel",
                    },
                    {
                      text: "Usuń",
                      onPress: () => {
                        useLocationTrackingStore.getState().clearLocations();
                        stopBackgroundTracking();
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </>
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
          disabled={isRecording}
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
          colorOverride={showHandles && "bg-main-500"}
          style={tw`self-end mt-auto`}
          label={showHandles ? "ukryj" : "pokaż"}
          icon="map-pin"
          onPress={() => {
            console.log(showHandles, fullPath, initialRegion);
            setShowHandles((p) => !p);
            force();
          }}
        />
        {/* <Text>{currentModalOpen}</Text>
        <Text>{notSaved ? "not Saved" : "saved"}</Text> */}
      </Animated.View>

      <Animated.View
        style={tw`absolute flex flex-row left-2 bottom-2 rounded-2xl border-black border-2 overflow-hidden`}
        entering={FadeInLeft}
        exiting={FadeOutLeft}>
        <MapGUIButton
          disabled={zoom <= 0.1493}
          style={tw`self-end border-r-2 mt-auto`}
          size={20}
          label={"przybliż"}
          icon="search-plus"
          onPress={async () => {
            const cam = await mapRef.current.getCamera();
            mapRef.current.animateCamera({ zoom: cam.zoom + 1 });
          }}
        />
        <MapGUIButton
          disabled={zoom >= 1222}
          size={20}
          style={tw`self-end mt-auto`}
          label={"oddal"}
          icon="search-minus"
          onPress={async () => {
            const cam = await mapRef.current.getCamera();
            mapRef.current.animateCamera({ zoom: cam.zoom - 1 });
          }}
        />
      </Animated.View>

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

function useLocationBackground() {
  const [isRecording, setIsRecording] = useState(false);

  async function startBackgroundTracking() {
    console.log("startBackgroundTracking");

    const startBckg = () =>
      Location.startLocationUpdatesAsync("location_tracking", {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Ścieżki Zdrowia",
          notificationBody: "Trasa ścieżki zdrowia nagrywa się w tle",
          notificationColor: "#fff",
        },
      });

    setIsRecording(true);
    console.log("have permissions?");
    const perms = await getLocationPermissions();
    if (!perms) return;
    console.log("have permissions");

    const startedTracking = await Location.hasStartedLocationUpdatesAsync("location_tracking");
    if (!startedTracking) console.log("starting tracking");

    const start = useLocationTrackingStore.getState().currentLine.end;
    let end = {} as LatLng;
    let distance = 0;
    if (start) {
      const loc = await Location.getCurrentPositionAsync();
      end = { longitude: loc.coords.longitude, latitude: loc.coords.latitude } as LatLng;
      distance = headingDistanceTo(start, end).distance;
    }

    if (distance > 100) {
      Alert.alert("wypełnić brakującą trasę?", "", [
        {
          text: "Nie",
          style: "cancel",
          onPress: () => {
            startBckg();
          },
        },
        {
          text: "Tak",
          onPress: async () => {
            const locs = await getRoute(start, end);
            useLocationTrackingStore.getState().addLocations(locs, Date.now());
            startBckg();
          },
        },
      ]);
      return;
    }
    startBckg();
  }

  async function stopBackgroundTracking() {
    console.log("stopBackgroundTracking", "isRec: ", isRecording);

    Location.hasStartedLocationUpdatesAsync("location_tracking")
      .then((res) => {
        setIsRecording(false);
        if (!res) return;
        console.log("stopping tracking");
        Location.stopLocationUpdatesAsync("location_tracking");
      })
      .catch((e) => console.log(e));
  }

  async function checkRecording() {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync("location_tracking");
    setIsRecording(hasStarted);
  }
  return [startBackgroundTracking, stopBackgroundTracking, isRecording, checkRecording] as const;
}

function usePreventBack() {
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      if (!useMapStore.getState().notSaved) return false;
      if (!navigation.isFocused()) return false;
      Alert.alert(
        "Porzucić zmiany?",
        "Masz niezapisane zmiany. Czy na pewno chcesz opuścić tworzenie mapy?",
        [
          {
            text: "Nie",
            style: "cancel",
            onPress: () => {
              return;
            },
          },
          {
            text: "Tak",
            onPress: () => {
              useMapStore.getState().resetCurrentMap();
              useMapStore.getState().setNotSaved(false);
              navigation.goBack();
            },
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [navigation]);
}
