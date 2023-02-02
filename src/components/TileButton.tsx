import { View, Text, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import Icon from "react-native-vector-icons/FontAwesome5";

type Props = {
  label: string;
  icon?: string;
  onPress?: () => void;
  style?: Style;
};

const TileButton = ({ onPress, style, label, icon }: Props) => {
  return (
    <View
      style={[
        tw`flex-initial h-full bg-main-200 dark:bg-main-700 rounded-md border-2 elevation-5`,
        style,
      ]}>
      <TouchableOpacity style={tw`flex h-full flex-row items-center p-4`} onPress={onPress}>
        <View style={tw`flex-0 flex h-auto w-5/12 justify-center items-center`}>
          <Icon name={icon ?? "map"} color={"black"} style={tw`sm:text-6xl md:text-7xl`} />
        </View>
        <Text style={tw`flex flex-1 text-2xl md:text-3xl font-bold text-center underline`}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TileButton;
