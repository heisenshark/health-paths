import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "../lib/tailwind";

type SquareButtonProps = {
  children: any;
  label: string;
  onPress?: () => any;
};

const SquareButton = ({ children, label, onPress }: SquareButtonProps) => (
    <TouchableOpacity
        className=""
        style={tw`w-20 h-20 aspect-square flex items-center justify-center rounded-2xl border-4 bg-main`}
        onPress={() => {
            onPress && onPress();
        }}>
        <View>{children}</View>
        <Text numberOfLines={1} style={tw`text-base py-0 leading-4 underline font-black`}>
            {label}
        </Text>
    </TouchableOpacity>
);

export default SquareButton;
