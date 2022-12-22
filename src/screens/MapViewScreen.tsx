import * as React from "react";
import { useEffect, useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Markers } from "../components/Markers";
import StopPoints from "../components/StopPoints";
import { mapStylesJSON } from "../providedfiles/Export";
import { useMapStore } from "../stores/store";

interface MapViewScreenProps {}

const MapViewScreen = ({ navigation, route }) => {
  const initialRegion = {
    latitude: 52,
    longitude: 19,
    latitudeDelta: 5,
    longitudeDelta: 10,
  } as Region;

  const mapRef = useRef<MapView>();
  const [currentMap] = useMapStore((state) => [state.currentMap]);
  useEffect(() => {
    console.log(currentMap.path);
    console.log("uef");
  }, []);

  return (
    <View className="w-full h-full bg-red-600">
      <MapView
        ref={mapRef}
        className="flex-1"
        initialRegion={initialRegion}
        // camera={currentCamera}
        customMapStyle={mapStylesJSON}
        onMapReady={() => {
          // mapRef.current.fitToCoordinates(currentMap.path, {
          //   edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          //   animated: true,
          mapRef.current.fitToCoordinates(currentMap.path, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }}>
        {/* <Markers
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
          }}></StopPoints> */}
        <Polyline coordinates={currentMap.path} strokeColor="#000" strokeWidth={3} />
      </MapView>
    </View>
  );
};

export default MapViewScreen;
