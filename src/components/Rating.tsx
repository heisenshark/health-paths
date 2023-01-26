import * as React from "react";
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";
import TileButton from "./TileButton";

interface RatingProps {
  disabled?: boolean;
  style?: Style;
  size?: number;
  onSubmit?: () => void;
  onRatingChange?: (rating: number) => void;
}

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
      <View style={tw`h-20 flex mx-10`}>
        <TileButton style={tw``} size={40} label="oceń!" icon="star" onPress={() => onSubmit()} />
      </View>
    </View>
  );
};

export default Rating;
