import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TailwindFn } from "twrnc";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import Icon from "react-native-vector-icons/FontAwesome5";

type SquareButtonProps = {
  children?: any;
  label: string;
  size?: number;
  uberActive: boolean;
  style?: Style;
  labelStyle?: Style;
  icon?: string;
  onPress?: () => any;
  disabled: boolean;
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
  disabled,
}: SquareButtonProps) => {
  const uberplus = uberActive ? 1 : 0;
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        [
          tw`w-[${size}] h-[${size}] flex items-center justify-center rounded-lg  bg-main-${disabled?
            (9):(uberActive ? "2" : "1")
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
  disabled: false,
};

export default SquareButton;
