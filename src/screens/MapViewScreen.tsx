import * as React from "react";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import { Markers } from "../components/Markers";
import StopPoints from "../components/StopPoints";
import tw from "../lib/tailwind";
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
    <View style={tw`w-full h-full bg-red-600`}>
      <MapView
        ref={mapRef}
        style={tw`flex-1`}
        initialRegion={initialRegion}
        customMapStyle={mapStylesJSON}
        onMapReady={() => {
          mapRef.current.fitToCoordinates(currentMap.path, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: false,
          });
        }}>
        <Markers
          waypoints={currentMap.waypoints}
          showHandles={false}
          updateWaypoints={undefined}
          zoom={15}
        />

        <StopPoints waypoints={currentMap.stops} isStop={false} zoom={15}></StopPoints>
        <Polyline coordinates={currentMap.path} strokeColor="#000" strokeWidth={3} />
      </MapView>
    </View>
  );
};

export default MapViewScreen;
