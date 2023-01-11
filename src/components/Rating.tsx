import * as React from "react";
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind";

interface RatingProps {
  disabled?: boolean;
  style?: Style;
  size?: number;
  onRatingChange?: (rating: number) => void;
}

const Rating = ({ onRatingChange, size = 50, style, disabled = false }: RatingProps) => {
  const [number, setNumber] = useState(1);
  return (
    <View style={[tw`flex flex-row`, style]}>
      {[1, 2, 3, 4, 5].map((index) => {
        return (
          <Icon
            style={tw`${disabled ? "text-main-9 " : "text-main-6"} flex`}
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
  );
};

export default Rating;
