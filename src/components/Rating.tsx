import * as React from "react";
import { useState } from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import TileButton from "./TileButton";

/**
 * @property {boolean} disabled czy komponent wyłączony
 * @property {Style} style dodatkowy styl
 * @property {number} size rozmiar ikon
 * @property {function} onSubmit funkcja wywoływana po zatwierdzeniu oceny
 * @property {function(number)} onRatingChange funkcja wywoływana po zmianie oceny
 * @interface RatingProps
 */
interface RatingProps {
  disabled?: boolean;
  style?: Style;
  size?: number;
  onSubmit?: () => void;
  onRatingChange?: (rating: number) => void;
}
/**
 * Komponent służący do oceniania ścieżek
 * @param {RatingProps} { onRatingChange, onSubmit, size = 50, style, disabled = false }
 * @component
 */
const Rating = ({ onRatingChange, onSubmit, size = 50, style, disabled = false }: RatingProps) => {
  const [number, setNumber] = useState(1);
  return (
    <View style={tw`flex flex-col bg-slate-400 p-4 m-2 rounded-3xl`}>
      <View style={[tw`flex flex-row`, style]}>
        {[1, 2, 3, 4, 5].map((index) => {
          return (
            <Icon
              key={index}
              style={tw`${disabled ? "text-main-600 " : "text-main-400"} flex elevation-5`}
              name={"star"}
              size={size}
              solid={index > number || disabled ? false : true}
              onPress={() => {
                if (disabled) return;
                let n = number;
                if (number !== index) n = index;
                else n = index - 1;
                setNumber(n);
                onRatingChange && onRatingChange(n);
              }}></Icon>
          );
        })}
      </View>
      <View style={tw`h-24 md:h-30 flex mx-4`}>
        <TileButton style={tw``} label="oceń!" icon="star" onPress={() => onSubmit()} />
      </View>
    </View>
  );
};

export default Rating;
