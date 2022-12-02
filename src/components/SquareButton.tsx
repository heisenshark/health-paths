import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "../lib/tailwind";

type SquareButtonProps = {
  children: any;
  label: string;
  size?: number;
  uberActive: boolean;
  addStyle?: string;
  onPress?: () => any;
};

const SquareButton = ({
    children,
    label,
    size,
    uberActive,
    addStyle,
    onPress,
}: SquareButtonProps) => {
    const uberplus = uberActive ? 1 : 0;
    return (
        <TouchableOpacity
            style={[
                tw`w-[${size}] h-[${size}]  aspect-square flex items-center justify-center rounded-2xl border-4 bg-main-${
                    uberActive ? "2" : "1"
                } ${addStyle}`,
                { transform: [{ scale: 1 + uberplus / 10 }] },
            ]}
            onPress={() => {
                onPress && onPress();
            }}>
            <View>{children}</View>
            <Text numberOfLines={1} style={tw`text-base py-0 leading-4 underline font-black`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};
SquareButton.defaultProps = {
    size: 20,
    uberActive: false,
};

export default SquareButton;
