import { Alert, BackHandler, Text, View } from "react-native";
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
import { getRoute } from "../utils/HelperFunctions";
import StopPointPopUp from "../components/StopPointPopUp";
import AddPointModal from "../components/AddPointModal";
import EditWaypointModal from "../components/EditWaypointModal";

import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import TipDisplay from "../components/TipDisplay";
import { atom, Provider, useAtom } from "jotai";
import {
  currentModalOpenAtom,
  initialRegionAtom,
  mapEditorStateAtom,
  showHandlesAtom,
  zoomAtom,
} from "../config/AtomsState";
//[x] make the alert for saving the map normal and functional
//[x] make option to fill the path with google directions if the path was stopped and resumed
//TODO make is moving stoppoint and is movingwaypoint into state machine
//TODO Dodać przyciski powiększania dodawania itp
//TODO Dodać logikę komponentu na tryby edycji ścieżek i inne
//TODO Rozdzielić na kilka pure komponentów
//[x] Dodać możliwość tworzenia waypointów
//[x] zrobić jakiś pseudo enum stan który będzie decydował o tym który modal jest otwarty

export type curmodalOpenType =
  | "None"
  | "MapInfo"
  | "WaypointsList"
  | "StopPoint"
  | "AddPoint"
  | "EditWaypoint";

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
  const [currentModalOpen, setCurrentModalOpen] = useAtom<curmodalOpenType>(currentModalOpenAtom); //
  const [initialRegion, setInitialRegion] = useAtom(initialRegionAtom);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [isRecordedHealthPath, setIsRecordedHealthPath] = useState(false);

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

  function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue((value) => value + 1);
  }

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
      waypoints.splice(position, 0, cords);
      setNotSaved(true);
      force();
      break;
    case "stop":
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
  ): Promise<boolean> {
    console.log(mapIcon); //HACK tutaj może coś się wywrócić
    let p = [...fullPath, ...useLocationTrackingStore.getState().getOutputLocations()];
    if (p.length <= 0) return false;
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
    const elo = await mapRef.current.getCamera();
    setZoom(elo.zoom);
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
    return true;
  }
  async function getPermissions(): Promise<boolean> {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log(status);
    let ss = await Location.requestBackgroundPermissionsAsync();
    console.log(ss.status);
    if (status !== "granted" || ss.status !== "granted") {
      return false;
    }
    return true;
  }

  const onSave = async (
    name: string,
    description: string,
    asNew: boolean,
    mapIcon: MediaFile
  ): Promise<boolean> => {
    try {
      if (asNew) currentMap.map_id = uuid.v4().toString();
      const good = await saveMapEvent(name, description, mapIcon); //[x] mordo tutaj trzeba to zamienić na asynca
      if (good) {
        setNotSaved(false);
        return true;
      }
    } catch (e) {
      console.log(e, "AAAAAA");
    }
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
    if (currentMap.map_id === "") {
      console.log("elo");
      if (!currentMap || currentMap.map_id === "") resetCurrentMap();
      console.log("elo3");
      (async () => {
        const loc = await Location.getCurrentPositionAsync();
        console.log(loc);
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
        setZoom(cam.zoom);
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
        resetCurrentMap();
      };
    }, [navigation])
  );

  const animateToPoint = async (point: LatLng) => {
    const time = 300;
    mapRef.current.animateCamera({ center: point }, { duration: time });
    await new Promise((resolve) => setTimeout(resolve, time));
  };

  const showTip = () => {
    setShowingTip((t) => (t === 5000 ? t - 1 : 5000));
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

  function Modals() {
    return (
      <>
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
            const stoppint = addNewWaypoint(pointPivot, "stop");
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: stoppint, isEdit: true },
            });
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
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: selectedStop, isEdit: true },
            })
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
      </>
    );
  }

  return (
    <View style={tw`relative`}>
      <Modals />
      <View style={tw`w-full h-full bg-red-600`}>
        <MapView
          ref={(r) => (mapRef.current = r)}
          style={tw`flex-1`}
          toolbarEnabled={false}
          showsMyLocationButton={false}
          showsCompass={true}
          minZoomLevel={7}
          showsUserLocation={showUserLocation}
          initialRegion={initialRegion}
          onMapReady={() => {
            // mapRef.current.fitToCoordinates(currentMap.path, {
            //   edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            //   animated: true,
            // });
          }}
          onTouchStart={showTip}
          onPress={onPressMap}
          customMapStyle={mapstyleSilver}
          onRegionChangeComplete={(e, { isGesture }) => {
            if (isGesture) setIsWatchingposition(false);
            mapRef.current.getCamera().then((c) => {
              setZoom(156543.03392 / Math.pow(2, c.zoom));
            });
          }}
          onUserLocationChange={(coordinate) => {
            isWatchingposition &&
              mapRef.current.animateCamera({
                center: coordinate.nativeEvent.coordinate,
                zoom: 15,
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
            <TrackLine isRecordingFinished={!isRecording} isEdit={true} coords={fullPath} />
          )}
        </MapView>
      </View>
      <TipDisplay forceVisible={mapEditState !== "Idle"} timeVisible={showingTip} />
      <View style={tw`absolute w-full mt-40`} pointerEvents="auto">
        {isInRecordingState && (
          <>
            <SquareButton
              style={tw`self-end m-3 mt-auto ${isRecording ? "bg-red-600" : ""}`}
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
            <SquareButton
              style={tw`self-end m-3 mt-auto border-0`}
              label={"czyść"}
              icon="trash"
              onPress={() => {
                useLocationTrackingStore.getState().clearLocations();
                stopBackgroundTracking();
              }}
            />
          </>
        )}
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={"zapisz"}
          icon="save"
          onPress={() => {
            setCurrentModalOpen("MapInfo");
            setShowHandles(false);
            setShowUserLocation(false);
          }}
          disabled={isRecording}
        />
        <SquareButton
          style={tw`self-end m-3 mt-auto ${isWatchingposition ? "bg-blue-600" : ""} border-0`}
          label={"centruj"}
          icon="map"
          onPress={() => {
            setIsWatchingposition((p) => !p);
          }}
        />
        <SquareButton
          style={tw`self-end m-3 mt-auto border-0`}
          label={"pokaż punkty"}
          icon="map"
          onPress={() => {
            console.log(showHandles, fullPath);
            setInitialRegion({
              latitude: 52.229676,
              longitude: 21.012229,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setShowHandles((p) => !p);
            force();
          }}
        />
        <Text>{currentModalOpen}</Text>
        <Text>{notSaved ? "not Saved" : "saved"}</Text>
      </View>
    </View>
  );
};

export default MapEditScreen;

function useLocationBackground() {
  const [isRecording, setIsRecording] = useState(false);

  async function getPermissions(): Promise<boolean> {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log(status);
    let ss = await Location.requestBackgroundPermissionsAsync();
    console.log(ss.status);
    if (status !== "granted" || ss.status !== "granted") {
      return false;
    }
    return true;
  }

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
    const perms = await getPermissions();
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
      Alert.alert("Czy na pewno chcesz wyjść?", "Twoja trasa nie zostanie zapisana", [
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
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [navigation]);
}
