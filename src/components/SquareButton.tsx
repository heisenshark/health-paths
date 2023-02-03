import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TailwindFn } from "twrnc";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import Icon from "react-native-vector-icons/FontAwesome5";

/**
 * @property {string} label etykieta przycisku
 * @property {number} [size] rozmiar przycisku
 * @property {Style} [style] dodatkowy styl przycisku
 * @property {Style} [labelStyle] dodatkowy styl etykiety
 * @property {string} [icon] nazwa ikony
 * @property {boolean} [disabled] czy przycisk jest wyłączony
 * @property {string} colorOverride nadpisanie koloru przycisku
 * @property {function} onPress funkcja wywoływana po naciśnięciu przycisku
 * @interface SquareButtonProps
 */
interface SquareButtonProps {
  children?: any;
  label: string;
  size?: number;
  active: boolean;
  style?: Style;
  labelStyle?: Style;
  icon?: string;
  onPress?: () => any;
  disabled?: boolean;
}
/**
 * Komponent będący przyciskiem z ikoną i tekstem używanym w GUI aplikacji
 * @param {SquareButtonProps} {
 *   children,
 *   label,
 *   size,
 *   active,
 *   style,
 *   labelStyle,
 *   icon,
 *   onPress,
 *   disabled,
 * }
 * @component
 */
const SquareButton = ({
  children,
  label,
  size,
  active,
  style,
  labelStyle,
  icon,
  onPress,
  disabled,
}: SquareButtonProps) => {
  const uberplus = active ? 1 : 0;
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        [
          tw`w-[${size}] h-[${size}] flex items-center justify-center rounded-lg border-2 bg-main-${
            disabled ? 900 : active ? "400" : "200"
          }`,
          style,
        ],
        { transform: [{ scale: 1 }] },
      ]}
      onPress={() => {
        onPress && onPress();
      }}>
      <View style={tw`p-1`}>
        {icon !== "" && <Icon name={icon} size={size * 2} color={"black"} />}
        {children}
      </View>
      <Text
        numberOfLines={2}
        style={[tw`text-base text-center py-0 leading-4 underline font-black`, labelStyle]}>
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
