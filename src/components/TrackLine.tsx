import * as React from "react";
import { Polyline } from "react-native-maps";
import { useLocationTrackingStore } from "../stores/store";

const TrackLine = () => {
  const [getOutputLocations] = useLocationTrackingStore((state) => {
    return [state.getOutputLocations];
  });

  return (
    <Polyline
      coordinates={getOutputLocations ? getOutputLocations() : []}
      strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
      strokeWidth={6}
    />
  );
};

export default TrackLine;
