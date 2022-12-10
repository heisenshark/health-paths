import { Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import MapView, { LatLng, MapPressEvent, Region } from "react-native-maps";
import { cloneDeep } from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";
import { mapStylenoLandmarks, mapStylesJSON, waypointsApp } from "../providedfiles/Export";
import { Markers } from "../components/Markers";
import MapViewDirections from "react-native-maps-directions";
import Waypoint from "../utils/interfaces";
import SquareButton from "../components/SquareButton";
import { WaypointsList } from "../components/Waypoints";
import tw from "../lib/tailwind";
import StopPoints from "../components/StopPoints";
const MapEditScreen = ({ params }) => {
  //TODO Dodać przyciski powiększania dodawania itp
  //TODO Dodać logikę komponentu na tryby edycji ścieżek i inne
  //TODO Rozdzielić na kilka pure komponentów
  //TODO Dodać możliwość tworzenia waypointów
  const API_KEY = "***REMOVED***";

  const [calloutOpen, setCalloutOpen] = useState(false);
  const [editorState, setEditorState, toggleEditorState] = useEditorState(EditorState.VIEW);
  const [listOpen, setListOpen] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>(cloneDeep(waypointsApp));
  const [stopPoints, setStopPoints] = useState<Waypoint[]>([]);
  const [zoomVals, calcZoomValues] = useZoom(waypoints);
  const [fullPath, setFullPath] = useState({} as LatLng[]);
  const mapRef = useRef({} as MapView);
  const origin = { latitude: 50.29416, longitude: 18.66541 };
  const destination = { latitude: 50.29387, longitude: 18.66577 };

  /**
   * no to ten, markery działają tak że jest edit mode i jak jest edit mode to ten, można je edytować i one istnieją, więc albo renderujemy je warunkowo albo umieszczamy warunkowe renderowanie w komponencie
   */
  async function snapPoints() {
    const path: string = waypoints
      .map((value) => `${value.coordinates.latitude}%2${value.coordinates.longitude}%7`)
      .reduce((n, m) => n + m);
    console.log(path);
    console.log(waypoints);
    // mapRef.current.takeSnapshot();
    //fetch(`https://roads.googleapis.com/v1/snapToRoads?path=-35.27801%2C149.12958%7C&key=***REMOVED***`)
  }
  //[x] uprościć funkcje zooma na początku mapy
  //TODO zmienić to na komponent który generuje markery trasy( chodziło mi o to żeby nie było tak że trzeba było wyciągać markery z waypointsApp)
  //TODO dodać możliwość rozpoczęcia od czystej karty na mapie, bez żadnej trasy
  function snapEnds(cords: LatLng[]) {
    if (waypoints.length < 2) return;
    waypoints[0].coordinates = cords[0];
    waypoints[waypoints.length - 1].coordinates = cords[cords.length - 1];
  }

  function addNewWaypoint(e: MapPressEvent) {
    //refactor
    const addWaypoint = (waypoint: Waypoint) => {
      setWaypoints([...waypoints, waypoint]);
    };
    const addStop = (waypoint: Waypoint) => {
      setStopPoints([...stopPoints, waypoint]);
      toggleEditorState(EditorState.VIEW);
    };

    editorState == EditorState.EDIT &&
      addWaypoint({
        waypoint_id: "asd",
        displayed_name: "name",
        coordinates: e.nativeEvent.coordinate,
        description: "asdsad",
      } as Waypoint);

    editorState == EditorState.EDIT_STOP &&
      addStop({
        waypoint_id: "asd",
        displayed_name: "name",
        coordinates: e.nativeEvent.coordinate,
        description: "asdsad",
      } as Waypoint);
  }

  return (
    <View className="relative border-4">
      <View className="w-full h-full bg-red-600">
        <MapView
          ref={mapRef}
          className="flex-1"
          initialRegion={zoomVals}
          region={zoomVals}
          onPress={(e) => {
            addNewWaypoint(e);
            setCalloutOpen(false);
          }}
          customMapStyle={editorState != EditorState.VIEW ? mapStylenoLandmarks : mapStylesJSON}>
          <MapViewDirections
            origin={waypoints[0].coordinates}
            destination={waypoints[waypoints.length - 1].coordinates}
            waypoints={waypoints.slice(1, -1).map((value) => value.coordinates)}
            mode={"WALKING"}
            apikey={API_KEY}
            strokeWidth={3}
            strokeColor="red"
            onReady={(n) => {
              console.log("path drawn ");
              snapEnds(n.coordinates);
              setFullPath(n.coordinates);
            }}
          />

          <Markers
            waypoints={waypoints}
            isEdit={editorState === EditorState.EDIT}
            updateWaypoints={() => {
              setWaypoints([...waypoints]);
            }}
          />

          <StopPoints
            waypoints={stopPoints}
            isStop={editorState === EditorState.EDIT_STOP}
            updateStopPoints={(w: Waypoint[]) => {
              setStopPoints([...w]);
            }}></StopPoints>
        </MapView>
      </View>

      <View className="absolute h-full w-full pointer-events-none">
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={editorState == EditorState.EDIT ? "Zakończ edycję" : "Edytuj ścieżkę"}
          onPress={() => toggleEditorState(EditorState.EDIT)}>
          <Icon name="plus" size={50} color="black" />
        </SquareButton>
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={editorState == EditorState.EDIT_STOP ? "Zakończ edycję" : "Edytuj STOPY"}
          onPress={() => toggleEditorState(EditorState.EDIT_STOP)}>
          <Icon name="plus" size={50} color="black" />
        </SquareButton>
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={"center"}
          onPress={() => mapRef.current.fitToCoordinates(fullPath, { animated: true })}>
          <Icon name="map" size={50} color="black" />
        </SquareButton>
        <SquareButton style={tw`self-end m-3 mt-auto`} label={"center"} onPress={snapPoints}>
          <Icon name="map" size={50} color="black" />
        </SquareButton>
        <SquareButton
          style={tw`self-end m-3 mt-auto`}
          label={"center"}
          onPress={() => setWaypoints([waypoints[0], waypoints[waypoints.length - 1]])}
          icon="map"
        />

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
// function undefined({ isEdit, markers }) {
//     return <View>{isEdit && markers}</View>;
// }

export function useWaypoints() {
  return [waypoints, setWaypoints];
}

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

function useZoom(w: Waypoint[]): [Region, (w: Waypoint[]) => void] {
  const [zoomVals, setZoomVals] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  } as Region);

  useEffect(() => {
    calcZoomValues(w);
  }, []);

  const calcZoomValues = (wpoints: Waypoint[]) => {
    let minLat = 1000,
      minLon = 1000,
      maxLat = -1000,
      maxLon = -1000;
    const retval: Region = {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    };
    wpoints.forEach((n) => {
      minLat = Math.min(minLat, n.coordinates.latitude);
      maxLat = Math.max(maxLat, n.coordinates.latitude);
      minLon = Math.min(minLon, n.coordinates.longitude);
      maxLon = Math.max(maxLon, n.coordinates.longitude);
    });
    retval.latitude = (minLat + maxLat) / 2;
    retval.longitude = (minLon + maxLon) / 2;

    retval.latitudeDelta = (maxLat - minLat) * 1.2;
    retval.longitudeDelta = (maxLon - minLon) * 1.2;
    setZoomVals(retval);
  };

  return [zoomVals, calcZoomValues];
}
