import { useAtom } from "jotai";
import * as React from "react";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import { Markers } from "../components/Markers";
import StopPoints from "../components/StopPoints";
import { showHandlesAtom, zoomAtom } from "../config/AtomsState";
import tw from "../lib/tailwind";
import { mapstyleSilver, mapStylesJSON } from "../providedfiles/Export";
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
  const [resetCurrentMap] = useMapStore((state) => [state.resetCurrentMap]);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [, setShowHandles] = useAtom(showHandlesAtom);

  const currentMap = route.params.map;
  useEffect(() => {
    console.log(currentMap.path);
    console.log("uef");
    return () => {
      resetCurrentMap();
    };
  }, []);

  return (
    <View style={tw`w-full h-full bg-red-600`}>
      <MapView
        ref={mapRef}
        style={tw`flex-1`}
        initialRegion={initialRegion}
        customMapStyle={mapstyleSilver}
        onRegionChangeComplete={(e, { isGesture }) =>
          mapRef.current.getCamera().then((c) => {
            setZoom(156543.03392 / Math.pow(2, c.zoom));
          })
        }
        onMapReady={() => {
          mapRef.current.fitToCoordinates(currentMap.path, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: false,
          });
        }}>
        <Markers waypoints={currentMap.waypoints} onWaypointPressed={() => {}} />

        <StopPoints
          waypoints={currentMap.stops}
          stopPointPressed={(stopPoint) => {
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: stopPoint, isEdit: false },
            });
          }}></StopPoints>
        <Polyline coordinates={currentMap.path} strokeColor="#000" strokeWidth={3} />
      </MapView>
    </View>
  );
};

export default MapViewScreen;
