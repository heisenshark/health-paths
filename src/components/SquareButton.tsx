import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TailwindFn } from "twrnc";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import Icon from "react-native-vector-icons/FontAwesome";

type SquareButtonProps = {
  children?: any;
  label: string;
  size?: number;
  uberActive: boolean;
  style?: Style;
  labelStyle?: Style;
  icon?: string;
  onPress?: () => any;
};

const SquareButton = ({
  children,
  label,
  size,
  uberActive,
  style,
  labelStyle,
  icon,
  onPress,
}: SquareButtonProps) => {
  const uberplus = uberActive ? 1 : 0;
  return (
    <TouchableOpacity
      style={[
        [
          tw`w-[${size}] h-[${size}] flex items-center justify-center rounded-2xl border-4 bg-main-${
            uberActive ? "2" : "1"
          }`,
          style,
        ],
        { transform: [{ scale: 1 + uberplus / 10 }] },
      ]}
      onPress={() => {
        onPress && onPress();
      }}>
      <View>
        {icon !== "" && <Icon name={icon} size={50} color={"black"} />}
        {children}
      </View>
      <Text
        numberOfLines={1}
        style={[tw`text-base py-0 leading-4 underline font-black`, labelStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
SquareButton.defaultProps = {
  size: 20,
  uberActive: false,
  icon: "",
};

export default SquareButton;
