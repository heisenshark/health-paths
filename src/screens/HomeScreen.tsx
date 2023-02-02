/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Text, View, Button, FlatList, BackHandler } from "react-native";
import HeaderBar from "../components/HeaderBar";
import TileButton from "../components/TileButton";
import tw from "../lib/tailwind";

const HomeScreen = ({ navigation }) =>
//[x] przycisk podłóżny
{
  useEffect(() => {
    // navigation.navigate("NagrywanieAudio");
  }, []);

  const [lol, setLol] = useState(1);
  //generate random number

  const data = [
    {
      id: 1,
      label: "Moje Trasy",
      icon: "home",
      onPress: () => navigation.navigate("PrzegladanieMap"),
    },
    {
      id: 2,
      label: "Przeglądaj Trasy",
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

  const renderItem = ({ label, onPress, icon }) => {
    return <TileButton label={label} icon={icon} onPress={onPress}></TileButton>;
  };

  return (
    <View style={tw`flex sm:bg-slate-500 h-full`}>
      <HeaderBar label={"EKRAN GŁÓWNY"}/>
      {data.map((item) => (
        <TileButton {...item} style={tw`mx-4 mb-2`} key={item.id} />
      ))}
    </View>
  );
};

export default HomeScreen;
