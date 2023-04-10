import { useAtom } from "jotai";
import * as React from "react";
import { View, Image } from "react-native";
import { Circle, LatLng, Marker } from "react-native-maps";
import tw from "../lib/tailwind";
import { mapEditorStateAtom, showHandlesAtom, zoomAtom } from "../config/AtomsState";

/**

@interface MarkersProps
@property {Array<LatLng>} waypoints Punkty trasy.
@property {LatLng} [selectedWaypoint] Aktualnie wybrany punkt trasy.
@property {boolean} [isView=false] Czy Markery są w trybie przeglądania.
@property {Function} [onWaypointPressed] funkcja callback wywoływana kiedy punkt trasy jest naciśnięty.
*/

export interface MarkersProps {
  waypoints: LatLng[];
  selectedWaypoint?: LatLng;
  isView?: boolean;
  onWaypointPressed?: (w: LatLng) => void;
}

/**
 * Komponent wyświetlający punkty trasy. wyświtla punkty trasy w trybie edycji lub przeglądania.
 *
 * @param {MarkersProps}
 * @component
 */
function Markers({ waypoints, selectedWaypoint, isView, onWaypointPressed }: MarkersProps) {
  const [showHandles] = useAtom(showHandlesAtom);
  const [mapEditState] = useAtom(mapEditorStateAtom);
  const [zoom] = useAtom(zoomAtom);

  /**
   * Funkcja wyświetlająca ikonę początku lub końca trasy.
   * @param isEnd czy jest to koniec trasy
   * @param isBegin czy jest to początek trasy
   * @returns {JSX.Element}
   */
  const renderImage = (isEnd, isBegin) => {
    if (isEnd)
      return (
        <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
          <Image
            source={imageStart}
            resizeMode="center"
            resizeMethod="resize"
            style={tw`flex-1 w-10 h-10`}
          />
        </View>
      );
    if (isBegin)
      return (
        <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
          <Image
            source={imageEnd}
            resizeMode="center"
            resizeMethod="resize"
            style={tw`flex-1 w-10 h-10`}
          />
        </View>
      );

    return null;
  };

  const markers = waypoints.map((n: LatLng, index) => {
    const isEnd = index === waypoints.length - 1;
    const isBegin = index === 0;

    if (isView && !isEnd && !isBegin)
      return (
        <Circle
          key={index}
          center={n}
          radius={Math.min(zoom * 7, 100)}
          fillColor={"gray"}
          zIndex={4}
        />
      );
    return (
      <View key={index}>
        {(isBegin ||
          isEnd ||
          (showHandles && mapEditState === "Idle") ||
          (selectedWaypoint === n && mapEditState === "MovingWaypoint")) && (
          <Marker
            coordinate={n}
            onPress={() => {
              mapEditState === "Idle" && onWaypointPressed(n);
            }}
            tappable={false}
            pinColor={index == 0 ? "blue" : "yellow"}
            style={tw`flex`}
            opacity={selectedWaypoint === n && mapEditState === "MovingWaypoint" ? 0.5 : 0.9}>
            {renderImage(index == 0, index == waypoints.length - 1)}
          </Marker>
        )}

        <Circle center={n} radius={Math.min(zoom * 7, 100)} fillColor={"gray"} zIndex={4} />
      </View>
    );
  });

  return <>{markers}</>;
}

Markers.defaultProps = {
  waypoints: [],
  onWaypointPressed: () => {},
} as MarkersProps;

export default Markers;

const imageEnd = require("../../assets/map-end-marker.png");
const imageStart = require("../../assets/map-start-marker.png");
// const marker = require("../../assets/map-marker.png");
