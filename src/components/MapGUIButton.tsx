import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import Icon from "react-native-vector-icons/FontAwesome5";
import { color } from "react-native-elements/dist/helpers";

/**
 * @property {string} label etykieta przycisku
 * @property {number} size rozmiar przycisku
 * @property {Style} style dodatkowy styl przycisku
 * @property {Style} labelStyle dodatkowy styl etykiety
 * @property {string} icon nazwa ikony
 * @property {boolean} disabled czy przycisk jest wyłączony
 * @property {string} colorOverride nadpisanie koloru przycisku
 * @property {function} onPress funkcja wywoływana po naciśnięciu przycisku
 * @interface Props
 */
interface Props {
  label: string;
  size?: number;
  style?: Style;
  labelStyle?: Style;
  icon?: string;
  disabled?: boolean;
  colorOverride?: string;
  onPress?: () => any;
}

/**
 * Komponent będący przyciskiem z ikoną i tekstem używanym w GUI mapy
 * @param {Props} {
 *   label,
 *   size,
 *   style,
 *   labelStyle,
 *   icon,
 *   onPress,
 *   disabled,
 *   colorOverride,
 * }
 * @component
 */
const MapGUIButton = ({
  label,
  size,
  style,
  labelStyle,
  icon,
  disabled,
  colorOverride,
  onPress,
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
      onLongPress={() => {}}>
      <View style={tw`p-1 flex justify-center items-center w-[${size / 1.5}] h-[${size / 1.5}]`}>
        {icon !== "" && <Icon name={icon} size={size2 / 1.5} color={"black"} />}
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
