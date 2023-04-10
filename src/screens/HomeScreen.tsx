/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { View, BackHandler } from "react-native";
import HeaderBar from "../components/HeaderBar";
import TileButton from "../components/TileButton";
import tw from "../lib/tailwind";

/**
 *
 * Ekran główny aplikacji - wyświetla przyciski do przejścia do innych ekranów
 * @category Ekrany
 * @param {*}  navigation_prop { navigation }
 * @component
 */
const HomeScreen = ({ navigation }) => {
  const data = [
    {
      id: 1,
      label: "Moje Ścieżki",
      icon: "home",
      onPress: () => navigation.navigate("PrzegladanieMap"),
    },
    {
      id: 2,
      label: "Przeglądaj Ścieżki",
      icon: "map",
      onPress: () => navigation.navigate("PrzegladanieWebMap"),
    },
    {
      id: 3,
      label: "Pomoc",
      icon: "question",
      onPress: () => navigation.navigate("Pomoc"),
    },
    {
      id: 4,
      label: "Wyjdź",
      icon: "door-open",
      onPress: () => BackHandler.exitApp(),
    },
  ];

  return (
    <View style={tw`flex h-full`}>
      <HeaderBar label={"EKRAN GŁÓWNY"} />
      {data.map((item) => (
        <TileButton {...item} style={tw`mx-10 mb-2`} key={item.id} />
      ))}
    </View>
  );
};

export default HomeScreen;
