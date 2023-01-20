import { Alert, BackHandler, Text, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MapView, { LatLng, MapPressEvent, Marker, Region } from "react-native-maps";
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
import { useFocusEffect } from "@react-navigation/native";
import MapInfoModal from "./../components/MapInfoModal";
import { headingDistanceTo } from "geolocation-utils";
import { getRoute } from "../utils/HelperFunctions";
import StopPointPopUp from "../components/StopPointPopUp";
import AddPointModal from "../components/AddPointModal";
import EditWaypointModal from "../components/EditWaypointModal";

import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import TipDisplay from "../components/TipDisplay";

//[x] make the alert for saving the map normal and functional
//[x] make option to fill the path with google directions if the path was stopped and resumed
//TODO make is moving stoppoint and is movingwaypoint into state machine
type curmodalOpenType =
  | "None"
  | "MapInfo"
  | "WaypointsList"
  | "StopPoint"
  | "AddPoint"
  | "EditWaypoint";

type MapEditState = "Idle" | "MovingWaypoint" | "MovingStopPoint";

const MapEditScreen = ({ navigation, route }) => {
  //TODO Dodać przyciski powiększania dodawania itp
  //TODO Dodać logikę komponentu na tryby edycji ścieżek i inne
  //TODO Rozdzielić na kilka pure komponentów
  //[x] Dodać możliwość tworzenia waypointów
  //[x] zrobić jakiś pseudo enum stan który będzie decydował o tym który modal jest otwarty

  let isPathEditable = false;
  const isInRecordingState = route.params.isRecording as boolean;
  const API_KEY = "***REMOVED***";
  const [currentModalOpen, setCurrentModalOpen] = useState<curmodalOpenType>("None"); //
  const [isWatchingposition, setIsWatchingposition] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [selectedStop, setSelectedStop] = useState(null as Waypoint);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null as LatLng);
  const [pointPivot, setPointPivot] = useState(null as LatLng);
  const [tipMessage, setTipMessage] = useState("Dotknij ekran aby dodać nowy punkt");
  const [mapEditState, setMapEditState] = useState<MapEditState>("Idle");

  const [showingTip, setShowingTip] = useState(3000);
  const [showHandles, setShowHandles] = useState<boolean>(true);
  const [zoom, setZoom] = useState(15);

  const [
    currentMap,
    setCurrentMap,
    currentCamera,
    setCurrentCamera,
    notSaved,
    setNotSaved,
    navAction,
    executeNavAction,
  ] = useMapStore((state) => [
    state.currentMap,
    state.setCurrentMap,
    state.currentCamera,
    state.setCurrentCamera,
    state.notSaved,
    state.setNotSaved,
    state.navAction,
    state.executeNavAction,
  ]);
  const mapRef = useRef<MapView>();
  const initialRegion = {
    latitude: 51,
    longitude: 19,
    latitudeDelta: 5,
    longitudeDelta: 10,
  } as Region;
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [stopPoints, setStopPoints] = useState<Waypoint[]>([]);
  const [fullPath, setFullPath] = useState([] as LatLng[]);
  const force = useForceUpdate();
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
    console.log(mapIcon);
    let p = isInRecordingState
      ? useLocationTrackingStore.getState().getOutputLocations()
      : fullPath;
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

  async function startBackgroundTracking() {
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
    console.log("isRec: ", isRecording);

    Location.hasStartedLocationUpdatesAsync("location_tracking")
      .then((res) => {
        setIsRecording(false);
        if (!res) return;
        console.log("stopping tracking");
        Location.stopLocationUpdatesAsync("location_tracking");
      })
      .catch((e) => console.log(e));
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

  //Use to display renders
  useEffect(() => {
    console.log("render");
  });
  useEffect(() => {
    if (currentMap.map_id === "") {
      console.log("elo");
      if (!currentMap || currentMap.map_id === "")
        setCurrentMap({
          map_id: uuid.v4(),
          name: "nienazwana mapa",
          description: "opis",
          location: "",
          waypoints: [],
          stops: [],
          path: [],
        } as HealthPath);
      console.log(currentCamera);
      setTimeout(async () => {
        console.log("elo3");

        const loc = await Location.getCurrentPositionAsync();
        console.log(loc);

        mapRef.current.animateToRegion(
          {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.2,
          },
          50
        );
      }, 50);
    } else {
      setWaypoints(currentMap.waypoints);
      setStopPoints(currentMap.stops);
      setFullPath(currentMap.path);
      console.log("elo2");
      console.log(currentMap);

      setTimeout(async () => {
        console.log("elo4");

        await mapRef.current.fitToCoordinates(currentMap.path, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 50);
    }
  }, []);

  function handleBackPress(): boolean {
    console.log(notSaved);
    if (!navigation.isFocused()) return;
    if (!notSaved) return false;
    Alert.alert(
      "Porzucić zmiany?",
      "Masz niezapisane zmiany. Czy na pewno chcesz opuścić tworzenie mapy?",
      [
        { text: "Nie, Zostań", style: "cancel", onPress: () => {} },
        {
          text: "Opusć",
          style: "destructive",
          onPress: () => {
            setCurrentMap(undefined);
            setNotSaved(false);
            navigation.goBack();
          },
        },
      ]
    );
    return true;
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, [notSaved]);

  useFocusEffect(
    useCallback(() => {
      Location.hasStartedLocationUpdatesAsync("location_tracking").then((res) => {
        setIsRecording(res);
      });
      console.log("onFocus");
      return () => {
        console.log("onBlur");
        console.log(mapRef);
        mapRef?.current?.getCamera().then((camera) => {
          console.log("camera");
          setCurrentCamera(camera);
        });

        BackHandler.removeEventListener("hardwareBackPress", () => false);
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

  const InfoInfo = () => {
    let tip = null;
    if (!tipMessage) return null;
    if (mapEditState === "Idle") tip = "Wybierz Lokację dla punktu";
    else tip = "Dotknij aby dodać punkt lub edytować istniejący";

    return (
      <Animated.View
        style={[tw`absolute bg-black bg-opacity-40 w-full`]}
        pointerEvents="none"
        entering={FadeInUp}
        exiting={FadeOutUp}>
        <Text style={tw`text-white text-3xl text-center p-2 py-4`}>{tip}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={tw`relative border-4`}>
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
        }}></EditWaypointModal>

      <AddPointModal
        visible={currentModalOpen === "AddPoint"}
        hide={() => {
          setPointPivot(null);
          setCurrentModalOpen("None");
          console.log("popclose");
        }}
        onStopPointAdd={() => {
          const stoppint = addNewWaypoint(pointPivot, "stop");
          setTimeout(() => {
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: stoppint, isEdit: true },
            });
          }, 10);
        }}
        onWaypointAdd={(position: number) => {
          addNewWaypoint(pointPivot, "waypoint", position);
          console.log(waypoints);
        }}
        waypointsLength={waypoints.length}></AddPointModal>
      <StopPointPopUp
        visible={currentModalOpen === "StopPoint"}
        stopPoint={selectedStop}
        hide={() => setCurrentModalOpen("None")}
        onEdit={() => {
          setTimeout(() => {
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: selectedStop, isEdit: true },
            });
          }, 10);
        }}
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
          ref={mapRef}
          style={tw`flex-1`}
          camera={currentCamera}
          toolbarEnabled={true}
          minZoomLevel={7}
          showsUserLocation={showUserLocation}
          onMapReady={() => {
            mapRef.current.fitToCoordinates(currentMap.path, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }}
          onTouchStart={() => {
            console.log("touch start");
            setIsWatchingposition(false);
            showTip();
          }}
          onPress={async (e) => {
            // addNewWaypoint(e);
            e.persist();
            console.log(mapEditState);
            if (mapEditState === "Idle") setPointPivot(e.nativeEvent.coordinate);
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
            mapEditState === "Idle" && setCurrentModalOpen("AddPoint");
            setMapEditState("Idle");

            force();
          }}
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
            showHandles={showHandles && mapEditState === "Idle"}
            selectedWaypoint={mapEditState === "MovingWaypoint" ? selectedWaypoint : null}
            onWaypointSelect={(w: LatLng) => {
              setCurrentModalOpen("EditWaypoint");
              setSelectedWaypoint(w);
            }}
            zoom={zoom}
          />
          <StopPoints
            waypoints={stopPoints}
            showHandles={showHandles && mapEditState === "Idle"}
            selectedStop={mapEditState === "MovingStopPoint" ? selectedStop : null}
            zoom={zoom}
            stopPointPressed={(w: Waypoint) => {
              animateToPoint(w.coordinates);
              setSelectedStop(w);
              setCurrentModalOpen("StopPoint");
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

          {isInRecordingState && <TrackLine />}
        </MapView>
      </View>
      {/* <InfoInfo /> */}
      <TipDisplay forceVisible={mapEditState !== "Idle"} timeVisible={showingTip} />
      <View style={tw`absolute w-full mt-40`} pointerEvents="auto">
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={"zapisz"}
          icon="save"
          onPress={() => {
            setCurrentModalOpen("MapInfo");
            setShowHandles(false);
            setShowUserLocation(false);
          }}
          // disabled={!isRecording && fullPath !== undefined && fullPath.length < 2}
        />

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
              label={"delete"}
              icon="trash"
              onPress={() => useLocationTrackingStore.getState().clearLocations()}
            />
          </>
        )}
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
            setShowHandles((p) => !p);
            force();
          }}
        />
        <Text>{currentCamera?.zoom}</Text>
        <Text>{currentModalOpen}</Text>
        <Text>{notSaved ? "not Saved" : "saved"}</Text>

        {!isInRecordingState && (
          <SquareButton
            label="lista"
            icon="list"
            onPress={() => {
              console.log("waypoint list open");
              if (currentModalOpen === "WaypointsList") setCurrentModalOpen("None");
              else setCurrentModalOpen("WaypointsList");
            }}
          />
        )}
      </View>

      {currentModalOpen === "WaypointsList" && (
        <WaypointsList
          waypoints={waypoints}
          onDelete={(n) => {
            setWaypoints((w) => {
              w.splice(n, 1);
              return [...w];
            });
          }}
        />
      )}
    </View>
  );
};

export default MapEditScreen;
