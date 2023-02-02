import { useAtom } from "jotai";
import * as React from "react";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";
import MapGUIButton from "../components/MapGUIButton";
import { Markers } from "../components/Markers";
import SquareButton from "../components/SquareButton";
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

  const begin = currentMap.path[0];
  const end = currentMap.path[currentMap.path.length - 1];
  const waypointsPlaceholder = [begin, end];
  const wpoints = currentMap.waypoints.length > 0 ? currentMap.waypoints : waypointsPlaceholder;

  useEffect(() => {
    console.log(currentMap.path);
    console.log("uef");
    setTimeout(() => {
      mapRef.current.getCamera().then((c) => {
        setZoom(156543.03392 / Math.pow(2, c.zoom));
      });
    }, 1);
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
        maxZoomLevel={20}
        minZoomLevel={7}
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
        <Markers waypoints={wpoints} onWaypointPressed={() => {}} />

        <StopPoints
          waypoints={currentMap.stops}
          stopPointPressed={(stopPoint) => {
            navigation.navigate({
              name: "EdycjaMap",
              params: { editedWaypoint: stopPoint, isEdit: false, map: currentMap },
            });
          }}></StopPoints>
        <Polyline coordinates={currentMap.path} strokeWidth={8} strokeColor="#ffc800" zIndex={3} />
        <Polyline coordinates={currentMap.path} strokeColor={"black"} strokeWidth={12} zIndex={1} />
      </MapView>

      <View style={tw`absolute top-2 left-2`}>
        <SquareButton
          style={tw`m-2`}
          size={18}
          label="wróć"
          icon={"arrow-left"}
          onPress={() => navigation.goBack()}
        />
      </View>
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
    </View>
  );
};

export default MapViewScreen;
