import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import Icon from "react-native-vector-icons/FontAwesome5";
import { color } from "react-native-elements/dist/helpers";

type Props = {
  children?: any;
  label: string;
  size?: number;
  style?: Style;
  labelStyle?: Style;
  icon?: string;
  onPress?: () => any;
  disabled?: boolean;
  colorOverride?: string;
};

const MapGUIButton = ({
  children,
  label,
  size,
  style,
  labelStyle,
  icon,
  onPress,
  disabled,
  colorOverride,
}: Props) => {
  const size2 = size * (tw.prefixMatch("md") ? 2.5 : 3);
  
  const color = colorOverride ? colorOverride : "bg-main-" + (disabled ? 900 : 200);
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        [tw`flex items-center justify-center ${color} border-main-900`, style],
        { transform: [{ scale: 1 }] },
      ]}
      onPress={() => {
        onPress && onPress();
      }}
      onLongPress={() => {
      }}>
      <View style={tw`p-1 flex justify-center items-center w-[${size / 1.5}] h-[${size / 1.5}]`}>
        {icon !== "" && <Icon name={icon} size={size2 / 1.5} color={"black"} />}
        {children}
      </View>
      <Text
        style={[
          tw`text-sm md:text-base text-center leading-4 underline font-black p-1 w-[${size}]`,
          labelStyle,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

MapGUIButton.defaultProps = {
  size: 15,
  disabled: false,
  colorOverride: null,
};

export default MapGUIButton;
