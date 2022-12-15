import * as React from "react";
import { useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Markers } from "../components/Markers";
import StopPoints from "../components/StopPoints";
import { mapStylesJSON } from "../providedfiles/Export";
import { useMapStore } from "../stores/store";

interface MapViewScreenProps {}

const MapViewScreen = ({ navigation, route }) => {
  // const mapRef = useRef<MapView>();
  // const [currentMap] = useMapStore((state) => [state.currentMap]);
  // useEffect(() => {
  //   mapRef.current.fitToCoordinates(currentMap.path, {
  //     edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
  //     animated: true,
  //   });
  //   console.log("uef");
  // }, []);

  return (
    <View className="w-full h-full bg-red-600">
      {/* <MapView
        ref={mapRef}
        className="flex-1"
        // initialRegion={initialRegion}
        // camera={currentCamera}
        customMapStyle={mapStylesJSON}>
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
      </MapView> */}
    </View>
  );
};

export default MapViewScreen;
