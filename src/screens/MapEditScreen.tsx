import { Alert, BackHandler, Text, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MapView, { LatLng, MapPressEvent, Marker, Region } from "react-native-maps";
import Icon from "react-native-vector-icons/FontAwesome";
import { mapStylenoLandmarks, mapStylesJSON } from "../providedfiles/Export";
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
//[x] make the alert for saving the map normal and functional
//[x] make option to fill the path with google directions if the path was stopped and resumed
type curmodalOpenType =
  | "None"
  | "MapInfo"
  | "WaypointsList"
  | "StopPoint"
  | "AddPoint"
  | "EditWaypoint";

const MapEditScreen = ({ navigation, route }) => {
  //TODO Dodać przyciski powiększania dodawania itp
  //TODO Dodać logikę komponentu na tryby edycji ścieżek i inne
  //TODO Rozdzielić na kilka pure komponentów
  //[x] Dodać możliwość tworzenia waypointów
  //[x] zrobić jakiś pseudo enum stan który będzie decydował o tym który modal jest otwarty
  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync("location_tracking", {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    });
    const hasStarted = await Location.hasStartedLocationUpdatesAsync("location_tracking");
    console.log("tracking started?", hasStarted);
  };

  let isPathEditable = false;
  const isInRecordingState = route.params.isRecording as boolean;
  const API_KEY = "***REMOVED***";
  const [currentModalOpen, setCurrentModalOpen] = useState<curmodalOpenType>("None"); //
  const [mapInfoModalVisible, setMapInfoModalVisible] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editorState, setEditorState, toggleEditorState] = useEditorState(EditorState.VIEW);
  const [isWatchingposition, setIsWatchingposition] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [isRecordingDone, setIsRecordingDone] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null as Waypoint);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null as LatLng);
  const [pointPivot, setPointPivot] = useState(null as LatLng);

  const [
    addMap,
    currentMap,
    setCurrentMap,
    getUUID,
    currentCamera,
    setCurrentCamera,
    notSaved,
    setNotSaved,
    navAction,
    executeNavAction,
  ] = useMapStore((state) => [
    state.addMap,
    state.currentMap,
    state.setCurrentMap,
    state.getUUID,
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
  //TODO zmienić to na komponent który generuje markery trasy( chodziło mi o to żeby nie było tak że trzeba było wyciągać markery z waypointsApp)
  //TODO dodać możliwość rozpoczęcia od czystej karty na mapie, bez żadnej trasy

  //[x] dodać automatyczne robienie cover photo dla mapy
  //TODO Kliknięcie w mapęautomatycznie przenosi do edycji stoppointa

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
    default:
      break;
    }
    return null;
  }

  const saveMapEvent = async (
    name: string,
    description: string,
    mapIcon: MediaFile
  ): Promise<boolean> => {
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
      edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
      animated: false,
    });
    const uri = await mapRef.current.takeSnapshot({
      width: 500, // optional, when omitted the view-width is used
      height: 500, // optional, when omitted the view-height is used
      format: "jpg", // image formats: 'png', 'jpg' (default: 'png')
      quality: 0.8, // image quality: 0..1 (only relevant for jpg, default: 1)
      result: "file", // result types: 'file', 'base64' (default: 'file')
    });
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
  };
  const getPermissions = async (): Promise<boolean> => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log(status);
    let ss = await Location.requestBackgroundPermissionsAsync();
    console.log(ss.status);
    if (status !== "granted" || ss.status !== "granted") {
      return false;
    }
    return true;
  };

  const startBackgroundTracking = async () => {
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
  };

  const stopBackgroundTracking = async () => {
    console.log("isRec: ", isRecording);

    Location.hasStartedLocationUpdatesAsync("location_tracking")
      .then((res) => {
        setIsRecording(false);
        if (!res) return;
        console.log("stopping tracking");
        Location.stopLocationUpdatesAsync("location_tracking");
      })
      .catch((e) => console.log(e));
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

  function elo(): boolean {
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
    const backHandler = BackHandler.addEventListener("hardwareBackPress", elo);
    return () => backHandler.remove();
  }, [notSaved]);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      mapRef.current.getMapBoundaries().then((boundaries) => {});
      mapRef.current.getCamera().then((camera) => {
        setCurrentCamera(camera);
      });
    });
    return unsub;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      Location.hasStartedLocationUpdatesAsync("location_tracking").then((res) => {
        setIsRecording(res);
      });
      console.log("onFocus");
      return () => {
        console.log("onBlur");
        BackHandler.removeEventListener("hardwareBackPress", () => false);
      };
    }, [navigation])
  );

  return (
    <View className="relative border-4">
      <View style={tw`absolute top-0 left-0 right-0 bottom-0 bg-black w-full h-20`}>
        <Text>AAAAAAAAAAAAAAAAA</Text>
      </View>
      <EditWaypointModal
        visible={currentModalOpen === "EditWaypoint"}
        hide={() => {
          setCurrentModalOpen("None");
          setSelectedWaypoint(null);
        }}
        onDelete={() => {
          waypoints.splice(waypoints.indexOf(selectedWaypoint), 1);
        }}
        onMove={() => {
          console.log("initiating move sequence");
        }}></EditWaypointModal>

      <AddPointModal
        visible={currentModalOpen === "AddPoint"}
        hide={() => {
          setPointPivot(null);
          setCurrentModalOpen("None");
          console.log("popclose");
        }}
        onStopPointEdit={() => {
          const stoppint = addNewWaypoint(pointPivot, "stop");
          setTimeout(() => {
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: stoppint, isEdit: true },
            });
          }, 10);
        }}
        onWaypointEdit={(position: number) => {
          addNewWaypoint(pointPivot, "waypoint", position);
          console.log(waypoints);
        }}
        waypointsLength={waypoints.length}></AddPointModal>
      <StopPointPopUp
        visible={currentModalOpen === "StopPoint"}
        stopPoint={selectedStop}
        hide={() => {
          setCurrentModalOpen("None");
          console.log("popclose");
        }}
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
          // setSelectedStop(null);
          // force();
        }}
      />
      <MapInfoModal
        visible={currentModalOpen === "MapInfo"}
        onRequestClose={() => {
          setMapInfoModalVisible(false);
          setCurrentModalOpen("None");
          setShowUserLocation(true);
        }}
        onSave={async (
          name: string,
          description: string,
          asNew: boolean,
          mapIcon: MediaFile
        ): Promise<boolean> => {
          try {
            if (asNew) currentMap.map_id = getUUID();
            const good = await saveMapEvent(name, description, mapIcon); //[x] mordo tutaj trzeba to zamienić na asynca
            if (good) {
              setNotSaved(false);
              return true;
            }
          } catch (e) {
            console.log(e, "AAAAAA");
          }
          return false;
        }}
      />
      <View className="w-full h-full bg-red-600">
        <MapView
          ref={mapRef}
          className="flex-1"
          camera={currentCamera}
          toolbarEnabled={true}
          minZoomLevel={7}
          showsUserLocation={showUserLocation}
          onMapReady={() => {
            // console.log("map ready", mapRef.current);
            mapRef.current.fitToCoordinates(currentMap.path, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }}
          onPress={(e) => {
            // addNewWaypoint(e);
            setCurrentModalOpen("AddPoint");
            setPointPivot(e.nativeEvent.coordinate);
          }}
          customMapStyle={editorState != EditorState.VIEW ? mapStylenoLandmarks : mapStylesJSON}
          onRegionChangeComplete={(e, { isGesture }) => {
            if (isGesture) setIsWatchingposition(false);
          }}
          onUserLocationChange={(coordinate) => {
            // console.log("user location change", coordinate);
            if (isWatchingposition) {
              console.log("watching position");
              mapRef.current.animateCamera({
                center: {
                  latitude: coordinate.nativeEvent.coordinate.latitude,
                  longitude: coordinate.nativeEvent.coordinate.longitude,
                },
                zoom: 15,
              });
            }
          }}>
          {pointPivot !== null && <Marker coordinate={pointPivot} title="Nowy punkt" />}
          {waypoints.length > 1 && (
            <MapViewDirections
              origin={waypoints[0]}
              destination={waypoints[waypoints.length - 1]}
              waypoints={waypoints.slice(1, -1)}
              mode={"WALKING"}
              apikey={API_KEY}
              strokeWidth={3}
              strokeColor="red"
              lineDashPattern={[0]}
              precision={"low"}
              optimizeWaypoints
              onReady={(n) => {
                console.log(n);
                console.log(n.legs[0].start_address);
                const adress = n.legs[0].start_address;
                console.log(adress.split(", "));
                console.log("path drawn ");
                snapEnds(n.coordinates);
                setFullPath(n.coordinates);
                currentMap.distance = n.distance * 1000;
                console.log(n.distance * 1000);
                currentMap.location = adress;
              }}
            />
          )}
          {isInRecordingState && <TrackLine />}
          <Markers
            waypoints={waypoints}
            isEdit={editorState === EditorState.EDIT}
            updateWaypoints={() => {
              // setWaypoints([...waypoints]);
              force();
              setNotSaved(true);
            }}
            onWaypointSelect={(w: LatLng) => {
              setCurrentModalOpen("EditWaypoint");
              setSelectedWaypoint(w);
            }}
          />

          <StopPoints
            waypoints={stopPoints}
            isStop={true}
            updateStopPoints={(w: Waypoint[]) => {
              setStopPoints(w);
              force();
              setNotSaved(true);
            }}
            stopPointPressed={(w: Waypoint) => {
              setSelectedStop(w);
              setCurrentModalOpen("StopPoint");
            }}
          />
        </MapView>
      </View>

      <View className="absolute h-full w-full pointer-events-none">
        {!isInRecordingState && (
          <SquareButton
            style={tw`self-end m-3 mt-auto`}
            label={editorState === EditorState.EDIT ? "Zakończ edycję" : "Edytuj ścieżkę"}
            onPress={() => toggleEditorState(EditorState.EDIT)}
            icon="edit"
          />
        )}
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={editorState === EditorState.EDIT_STOP ? "Zakończ edycję" : "Edytuj STOPY"}
          onPress={() => toggleEditorState(EditorState.EDIT_STOP)}
          icon="marker"
        />
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={"zapisz"}
          onPress={() => {
            setMapInfoModalVisible(true);
            setCurrentModalOpen("MapInfo");
            setShowUserLocation(false);
          }}
          // disabled={!isRecording && fullPath !== undefined && fullPath.length < 2}
          icon="save"
        />

        {isInRecordingState && (
          <>
            <SquareButton
              style={tw`self-end m-3 mt-auto ${isRecording ? "bg-red-600" : ""}`}
              label={isRecording ? "stop" : "start"}
              onPress={() => {
                isRecording
                  ? (() => {
                    stopBackgroundTracking();
                  })()
                  : startBackgroundTracking();
              }}
              icon={isRecording ? "stop" : "record-vinyl"}
            />
            <SquareButton
              style={tw`self-end m-3 mt-auto border-0`}
              label={"delete"}
              onPress={() => useLocationTrackingStore.getState().clearLocations()}
              icon="trash"
            />
          </>
        )}
        <SquareButton
          style={tw`self-end m-3 mt-auto ${isWatchingposition ? "bg-blue-600" : ""} border-0`}
          label={"centruj"}
          onPress={() => {
            setIsWatchingposition((p) => !p);
          }}
          icon="map"
        />
        <SquareButton
          style={tw`self-end m-3 mt-auto ${isWatchingposition ? "bg-blue-600" : ""} border-0`}
          label={"centruj"}
          onPress={() => {
            force();
          }}
          icon="map"
        />

        <Text>{notSaved ? "not Saved" : "saved"}</Text>

        {!isInRecordingState && (
          <SquareButton
            label="lista"
            onPress={() => {
              console.log("waypoint list open");
              setListOpen(!listOpen);
              if (currentModalOpen === "WaypointsList") setCurrentModalOpen("None");
              else setCurrentModalOpen("WaypointsList");
            }}>
            <Icon name="list" size={40} color="black" className="flex-1" />
          </SquareButton>
        )}
        <Text>{editorState}</Text>
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

enum EditorState {
  EDIT = "EDIT",
  VIEW = "VIEW",
  EDIT_STOP = "EDIT_STOP",
}

function useEditorState(
  editorState: EditorState
): [EditorState, (state: EditorState) => void, (edit: EditorState) => void] {
  const [state, setState] = useState(editorState);

  function toggleEditorState(edit: EditorState) {
    if (state == edit) {
      setState(EditorState.VIEW);
    } else {
      setState(edit);
    }
  }
  return [state, setState, toggleEditorState];
}
