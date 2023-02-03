import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import tw from "../lib/tailwind";

/**
 * @property {string} tipMessage wiadomość do wyświetlenia
 * @property {number} currentStops aktualna liczba przystanków
 * @property {number} currentPoints aktualna liczba punktów
 * @property {number} maxStops maksymalna liczba przystanków
 * @property {number} maxPoints maksymalna liczba punktów
 * @property {boolean} [hideWaypoints] Czy ukryć liczniki punktów i przystanków
 * @interface Props
 */
interface Props {
  tipMessage: string;
  currentStops: number;
  currentPoints: number;
  maxStops: number;
  maxPoints: number;
  hideWaypoints?: boolean;
}
/**
 * Komponent wyświetlający podpowiedzi oraz aktualną liczbę punktów i punktów stopu
 * @param {Props} {
 *   tipMessage,
 *   currentStops,
 *   currentPoints,
 *   maxStops,
 *   maxPoints,
 *   hideWaypoints,
 * }
 * @component
 */
const TipDisplay = ({
  tipMessage,
  currentStops,
  currentPoints,
  maxStops,
  maxPoints,
  hideWaypoints,
}: Props) => {
  return (
    <>
      <Animated.View
        style={[tw`absolute left-0 right-0`]}
        pointerEvents="none"
        entering={FadeInUp}
        exiting={FadeOutUp}>
        <View style={tw`bg-black bg-opacity-70 w-full`}>
          <Text style={tw`text-white text-lg md:text-3xl text-center p-2 py-4`}>{tipMessage}</Text>
        </View>
      </Animated.View>
      <Animated.View
        style={[tw`absolute right-2 bottom-2 p-2 md:py-3 rounded-lg bg-black bg-opacity-70`]}
        pointerEvents="none"
        entering={FadeInDown}
        exiting={FadeOutDown}>
        <View style={tw`w-auto`}>
          <Text style={tw`text-lg md:text-xl font-bold text-white text-right`}>
            Punkty Stopu: {String(currentStops).padStart(2, "0")}/{maxStops}
          </Text>
          {!hideWaypoints && (
            <Text style={tw`text-lg md:text-xl font-bold text-white text-right`}>
              Punkty Trasy: {String(currentPoints).padStart(2, "0")}/{maxPoints}
            </Text>
          )}
        </View>
      </Animated.View>
    </>
  );
};

export default TipDisplay;
