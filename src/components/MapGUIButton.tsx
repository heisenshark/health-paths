import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import Icon from "react-native-vector-icons/FontAwesome5";

type Props = {
  children?: any;
  label: string;
  size?: number;
  style?: Style;
  labelStyle?: Style;
  icon?: string;
  onPress?: () => any;
  disabled?: boolean;
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
}: Props) => {
  const size2 = size * 2.5;

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        [tw`flex items-center justify-center rounded-lg`, style],
        { transform: [{ scale: 1 }] },
      ]}
      onPress={() => {
        onPress && onPress();
      }}
      onLongPress={() => {
        console.log("long press");
      }}>
      <View
        style={tw`p-1 bg-main-${
          disabled ? 900 : "200"
        } border-2 rounded-md flex justify-center items-center w-[${size}] h-[${size}]`}>
        {icon !== "" && <Icon name={icon} size={size2} color={"black"} />}
        {children}
      </View>
      <Text
        style={[
          tw`text-sm text-center leading-4 underline font-black bg-main-200 rounded-lg p-1 w-[${size}]`,
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
};

export default MapGUIButton;
