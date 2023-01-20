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
      strokeColor="yellow"
      strokeWidth={6}
    />
  );
};

export default TrackLine;
