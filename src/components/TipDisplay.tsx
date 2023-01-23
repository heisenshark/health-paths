import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import tw from "../lib/tailwind";

type Props = {
  forceVisible: boolean;
  timeVisible: number;
};

const TipDisplay = ({ forceVisible, timeVisible }: Props) => {
  const [time, setTime] = useState(0);
  let ti;
  let tip = null;
  if (forceVisible) tip = "Wybierz Lokację dla punktu";
  else tip = "Dotknij aby dodać punkt lub edytować istniejący";

  useEffect(() => {
    setTime(timeVisible);
    ti = setInterval(() => {
      setTime((t) => {
        if (t <= 0) clearInterval(ti);
        // console.log("time", t);
        return t - 1000;
      });
    }, 1000);

    return () => {
      clearInterval(ti);
    };
  }, [timeVisible]);
  if (!forceVisible && time <= 0) return null;

  return (
    <Animated.View
      style={[tw`absolute bg-black bg-opacity-70 w-full`]}
      pointerEvents="none"
      entering={FadeInUp}
      exiting={FadeOutUp}>
      <Text style={tw`text-white text-3xl text-center p-2 py-4`}>{tip}</Text>
    </Animated.View>
  );
};

export default TipDisplay;
