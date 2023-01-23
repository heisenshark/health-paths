import * as React from "react";
import { useEffect } from "react";
import { View, Text, Image } from "react-native";
import { LatLng, Marker, Polyline } from "react-native-maps";
import tw from "../lib/tailwind";
import { useLocationTrackingStore } from "../stores/store";

export interface TrackLineProps {
  isRecordingFinished: boolean;
  isEdit: boolean;
  coords?: LatLng[];
}

const TrackLine = ({ isRecordingFinished, isEdit, coords }: TrackLineProps) => {
  const [line, getOutputLocations] = useLocationTrackingStore((state) => {
    return [state.currentLine, state.getOutputLocations];
  });

  useEffect(() => {
    console.log("TrackLine useEffect", isRecordingFinished);

    return () => {};
  });

  return (
    <>
      <Polyline
        coordinates={isEdit ? coords : getOutputLocations() ? getOutputLocations() : []}
        strokeColor="yellow"
        strokeWidth={6}
        lineDashPattern={[0]}
      />

      {(getOutputLocations().length > 0 || isEdit) && (
        <Marker coordinate={isEdit ? coords[0] : getOutputLocations()[0]} style={tw`flex`}>
          <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
            <Text>Start</Text>
            <Image
              source={imageStart}
              resizeMode="center"
              resizeMethod="resize"
              style={tw`flex-1 w-8 h-8`}
            />
          </View>
        </Marker>
      )}

      {((getOutputLocations().length > 0 && isRecordingFinished) || isEdit) && (
        <Marker
          coordinate={
            isEdit
              ? coords[coords.length - 1]
              : getOutputLocations()[getOutputLocations().length - 1]
          }
          style={tw`flex`}>
          <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
            <Text>Koniec</Text>
            <Image
              source={imageEnd}
              resizeMode="center"
              resizeMethod="resize"
              style={tw`flex-1 w-8 h-8`}
            />
          </View>
        </Marker>
      )}
    </>
  );
};

export default TrackLine;

const imageStart = require("../../assets/map-start-marker.png");
const imageEnd = require("../../assets/map-end-marker.png");
