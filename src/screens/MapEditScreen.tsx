import { Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import MapView, { LatLng, MapPressEvent, Region } from "react-native-maps";
import Icon from "react-native-vector-icons/FontAwesome";
import { mapStylenoLandmarks, mapStylesJSON } from "../providedfiles/Export";
import { Markers } from "../components/Markers";
import MapViewDirections from "react-native-maps-directions";
import Waypoint, { HealthPath } from "../utils/interfaces";
import SquareButton from "../components/SquareButton";
import { WaypointsList } from "../components/Waypoints";
import tw from "../lib/tailwind";
import StopPoints from "../components/StopPoints";
import { useMapStore } from "./../stores/store";
import { saveMap } from "../utils/FileSystemManager";
import SelectNameModal from "../components/SelectNameModal";

import * as Location from "expo-location";

const MapEditScreen = ({ navigation, route }) => {
  //TODO Dodać przyciski powiększania dodawania itp
  //TODO Dodać logikę komponentu na tryby edycji ścieżek i inne
  //TODO Rozdzielić na kilka pure komponentów
  //TODO Dodać możliwość tworzenia waypointów
  let isPathEditable = false;
  const API_KEY = "***REMOVED***";
  const [saveMapModalVisible, setSaveMapModalVisible] = useState(false);
  const [calloutOpen, setCalloutOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editorState, setEditorState, toggleEditorState] = useEditorState(EditorState.VIEW);

  const [addMap, currentMap, setCurrentMap, getUUID, currentCamera, setCurrentCamera] = useMapStore(
    (state) => [
      state.addMap,
      state.currentMap,
      state.setCurrentMap,
      state.getUUID,
      state.currentCamera,
      state.setCurrentCamera,
    ]
  );
  const mapRef = useRef<MapView>();
  const initialRegion = {
    latitude: 52,
    longitude: 19,
    latitudeDelta: 5,
    longitudeDelta: 10,
  } as Region;
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [stopPoints, setStopPoints] = useState<Waypoint[]>([]);
  const [fullPath, setFullPath] = useState([] as LatLng[]);

  const [location, setLocation] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  /**
   * no to ten, markery działają tak że jest edit mode i jak jest edit mode to ten, można je edytować i one istnieją, więc albo renderujemy je warunkowo albo umieszczamy warunkowe renderowanie w komponencie
   */
  async function snapPoints() {
    //TODO dodać tutaj snapshota z mapy
    const path: string = waypoints
      .map((value) => `${value.latitude}%2${value.longitude}%7`)
      .reduce((n, m) => n + m);
    console.log(path);
    console.log(waypoints);
    // mapRef.current.takeSnapshot();
    //fetch(`https://roads.googleapis.com/v1/snapToRoads?path=-35.27801%2C149.12958%7C&key=***REMOVED***`)
  }
  //[x] uprościć funkcje zooma na początku mapy
  //TODO zmienić to na komponent który generuje markery trasy( chodziło mi o to żeby nie było tak że trzeba było wyciągać markery z waypointsApp)
  //TODO dodać możliwość rozpoczęcia od czystej karty na mapie, bez żadnej trasy

  //TODO dodać automatyczne robienie cover photo dla mapy
  //TODO Kliknięcie w mapęautomatycznie przenosi do edycji stoppointa
  function snapEnds(cords: LatLng[]) {
    if (waypoints.length < 2) return;
    waypoints[0] = cords[0];
    waypoints[waypoints.length - 1] = cords[cords.length - 1];
  }

  function addNewWaypoint(e: MapPressEvent) {
    //HACK may not work propertly
    switch (editorState) {
    case EditorState.EDIT:
      setWaypoints([...waypoints, e.nativeEvent.coordinate]);
      break;
    case EditorState.EDIT_STOP:
      setStopPoints([
        ...stopPoints,
          {
            waypoint_id: getUUID(),
            displayed_name: "",
            coordinates: e.nativeEvent.coordinate,
            description: "",
          } as Waypoint,
      ]);
      break;
    default:
      break;
    }
  }

  const saveMapEvent = (name: string) => {
    console.log(currentMap);
    let xd = {
      ...currentMap,
      name: name,
      waypoints: [...waypoints],
      stops: [...stopPoints],
      path: [...fullPath],
    };
    setCurrentMap(xd);
    saveMap(xd);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMessage("Permission to access location was denied");
        console.log("error");

        return;
      }
      console.log("aaaaa");
      // console.log(await Location.hasServicesEnabledAsync());
      // console.log(await Location.isBackgroundLocationAvailableAsync());

      let location = await Location.getCurrentPositionAsync({
        accuracy: 5,
        mayShowUserSettingsDialog: true,
      });

      // await Location.watchPositionAsync(
      //   {
      //     accuracy: 5,
      //     timeInterval: 1000,
      //     distanceInterval: 1,
      //   },
      //   (loc) => {
      //     setLocation(loc);
      //     console.log(loc);
      //   }
      // );
    })();
  }, []);

  useEffect(() => {
    if (route.params === undefined && currentMap.map_id === "") {
      console.log("elo");
      if (!currentMap || currentMap.map_id === "")
        setCurrentMap({
          map_id: getUUID(),
          name: "kato trasa",
          description: "trasa krajoznawcza w katowicach",
          location: "katowice",
          waypoints: [],
          stops: [],
        } as HealthPath);
      console.log(currentCamera);
    } else {
      setWaypoints(currentMap.waypoints);
      setStopPoints(currentMap.stops);
      setFullPath(currentMap.path);
      console.log("elo2");
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      console.log("beforeRemove_mapEdit");
      mapRef.current.getMapBoundaries().then((boundaries) => {
        console.log(boundaries);
      });
      mapRef.current.getCamera().then((camera) => {
        console.log(camera);
        setCurrentCamera(camera);
      });
      console.log(initialRegion);
    });

    return unsub;
  }, [navigation]);

  const hideModal = () => setSaveMapModalVisible(false);
  return (
    <View className="relative border-4">
      <SelectNameModal
        visible={saveMapModalVisible}
        onRequestClose={hideModal}
        actionLeft={hideModal}
        actionRight={(name: string) => {
          saveMapEvent(name);
          setSaveMapModalVisible(false);
        }}></SelectNameModal>

      <View className="w-full h-full bg-red-600">
        <MapView
          ref={mapRef}
          className="flex-1"
          camera={currentCamera}
          onPress={(e) => {
            addNewWaypoint(e);
            setCalloutOpen(false);
          }}
          customMapStyle={editorState != EditorState.VIEW ? mapStylenoLandmarks : mapStylesJSON}>
          {waypoints.length > 1 && (
            <MapViewDirections
              origin={waypoints[0]}
              destination={waypoints[waypoints.length - 1]}
              waypoints={waypoints.slice(1, -1)}
              mode={"WALKING"}
              apikey={API_KEY}
              strokeWidth={3}
              strokeColor="red"
              onReady={(n) => {
                console.log(n);

                console.log("path drawn ");
                snapEnds(n.coordinates);
                setFullPath(n.coordinates);
              }}
            />
          )}

          <Markers
            waypoints={waypoints}
            isEdit={editorState === EditorState.EDIT}
            updateWaypoints={() => {
              setWaypoints([...waypoints]);
            }}
          />

          <StopPoints
            waypoints={stopPoints}
            isStop={true}
            updateStopPoints={(w: Waypoint[]) => setStopPoints([...w])}
          />
        </MapView>
      </View>

      <View className="absolute h-full w-full pointer-events-none">
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={editorState === EditorState.EDIT ? "Zakończ edycję" : "Edytuj ścieżkę"}
          onPress={() => toggleEditorState(EditorState.EDIT)}
          icon="plus"
        />
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={editorState === EditorState.EDIT_STOP ? "Zakończ edycję" : "Edytuj STOPY"}
          onPress={() => toggleEditorState(EditorState.EDIT_STOP)}
          icon="map"
        />
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={"save"}
          onPress={() => {
            if (currentMap.name === "") setSaveMapModalVisible(true);
            else saveMapEvent(currentMap.name);
          }}
          icon="map"
        />
        <Text>{currentMap?.map_id}</Text>
        <SquareButton
          label="lista"
          onPress={() => {
            console.log("waypoint list open");
            setListOpen(!listOpen);
          }}>
          <Icon name="edit" size={40} color="black" className="flex-1" />
        </SquareButton>
        <Text>{editorState}</Text>
        <Text>{calloutOpen ? "open" : "closed"}</Text>
      </View>

      {listOpen && (
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
