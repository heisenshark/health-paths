import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import tw from "../lib/tailwind";

type Props = {
  tipMessage: string;
};

const TipDisplay = ({ tipMessage }: Props) => {

  return (
    <Animated.View
      style={[tw`absolute bg-black bg-opacity-70 w-full`]}
      pointerEvents="none"
      entering={FadeInUp}
      exiting={FadeOutUp}>
      <Text style={tw`text-white text-3xl text-center p-2 py-4`}>{tipMessage}</Text>
    </Animated.View>
  );
};

export default TipDisplay;
