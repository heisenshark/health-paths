/* eslint-disable @typescript-eslint/no-unused-vars */
import { firebase } from "@react-native-firebase/auth";
import React, { useEffect, useState } from "react";
import { Text, View, Button, FlatList, BackHandler } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AppText from "../components/AppText";
import PaletteTest from "../components/PaletteTest";
import SquareButton from "../components/SquareButton";
import TileButton from "../components/TileButton";
import { DbUser } from "../config/firebase";
import tw from "../lib/tailwind";
import { HealthPath } from "../utils/interfaces";
import { useMapStore } from "./../stores/store";
import LogInScreen from "./LogInScreen";

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
      onPress: () => navigation.navigate("LogIn"),
    },
    {
      id: 4,
      label: "Wyjdź",
      icon: "door-open",
      onPress: () => BackHandler.exitApp()
      ,
    },
  ];

  const renderItem = ({ label, onPress, icon }) => {
    return <TileButton label={label} icon={icon} onPress={onPress}></TileButton>;
  };

  return (
    <View style={tw`flex bg-slate-100 h-full`}>
      <View
        style={[
          tw`flex-0 flex flex-row bg-slate-200 mb-8 border-b-2 border-slate-500 justify-center elevation-5`,
          { alignItems: "center" },
        ]}>
        <Text
          style={tw`text-center text-slate-800 text-4xl mt-2 mb-2 ml-2 font-medium underline`}>
            EKRAN GŁÓWNY
        </Text>
      </View>
      {data.map((item) => (
        <TileButton {...item} style={tw`mx-10 mb-4`} key={item.id} />
      ))}
    </View>
  );
};

export default HomeScreen;
