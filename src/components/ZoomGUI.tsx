import { useAtom } from "jotai";
import React from "react";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";
import { zoomAtom } from "../config/AtomsState";
import tw from "../lib/tailwind";
import MapGUIButton from "./MapGUIButton";

/**
 * Funkcja zwracająca GUI do zmiany zoomu mapy
 * @export
 * @param {*} referencjaDoMapy { mapRef }
 * @component
 */
export default function ZoomGUI({ mapRef }) {
  const [zoom] = useAtom(zoomAtom);

  return (
    <Animated.View
      style={tw`absolute flex flex-row left-2 bottom-2 rounded-2xl border-black border-2 overflow-hidden`}
      entering={FadeInLeft}
      exiting={FadeOutLeft}>
      <MapGUIButton
        disabled={zoom <= 0.1493}
        style={tw`self-end border-r-2 mt-auto`}
        size={tw.prefixMatch("md") ? 20 : 15}
        label={"przybliż"}
        icon="search-plus"
        onPress={async () => {
          const cam = await mapRef.current.getCamera();
          mapRef.current.animateCamera({ zoom: cam.zoom + 1 });
        }}
      />
      <MapGUIButton
        disabled={zoom >= 1222}
        style={tw`self-end mt-auto`}
        size={tw.prefixMatch("md") ? 20 : 15}
        label={"oddal"}
        icon="search-minus"
        onPress={async () => {
          const cam = await mapRef.current.getCamera();
          mapRef.current.animateCamera({ zoom: cam.zoom - 1 });
        }}
      />
    </Animated.View>
  );
}
