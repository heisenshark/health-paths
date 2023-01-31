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
  const [line, outLocations] = useLocationTrackingStore((state) => {
    return [state.currentLine, state.outputLocations];
  });

  return (
    <>
      <Polyline
        coordinates={isEdit ? coords : outLocations ? outLocations : []}
        strokeColor={isRecordingFinished ? "yellow" : "rgba(0,0,0,0)"}
        strokeWidth={8}
        // lineDashPattern={isRecordingFinished ? [10,3,10,3,10] : null}
        zIndex={5}
      />
      <Polyline
        coordinates={isEdit ? coords : outLocations ? outLocations : []}
        strokeColor={isRecordingFinished ? "black" : "rgba(0,0,0,0)"}
        strokeWidth={12}
        // lineDashPattern={isRecordingFinished ? [10,3,10,3,10] : null}
        zIndex={4}
      />
      <Polyline
        coordinates={isEdit ? coords : outLocations ? outLocations : []}
        strokeColor={isRecordingFinished ? "rgba(0,0,0,0)" : "red"}
        strokeWidth={8}
        zIndex={3}
      />
      {(outLocations.length > 0 || isEdit) && (
        <Marker coordinate={isEdit ? coords[0] : outLocations[0]} style={tw`flex`}>
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

      {((outLocations.length > 0 && isRecordingFinished) || isEdit) && (
        <Marker
          coordinate={isEdit ? coords[coords.length - 1] : outLocations[outLocations.length - 1]}
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
