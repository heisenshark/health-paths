/* eslint-disable @typescript-eslint/no-unused-vars */
import { firebase } from "@react-native-firebase/auth";
import React, { useEffect, useState } from "react";
import { Text, View, Button, FlatList } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import PaletteTest from "../components/PaletteTest";
import SquareButton from "../components/SquareButton";
import { DbUser } from "../config/firebase";
import tw from "../lib/tailwind";
import { HealthPath } from "../utils/interfaces";
import { useMapStore } from "./../stores/store";
import LogInScreen from "./LogInScreen";

const HomeScreen = ({ navigation }) =>
//TODO przycisk podłóżny
{
  useEffect(() => {
    // navigation.navigate("NagrywanieAudio");
  }, []);

  const [lol, setLol] = useState(1);
  //generate random number

  const data = [
    {
      id: 1,
      label: "Lokalne mapy",
      onPress: () => navigation.navigate("PrzegladanieMap"),
    },
    {
      id: 2,
      label: "Przeglądaj",
      onPress: () => navigation.navigate("PrzegladanieWebMap"),
    },
    {
      id: 3,
      label: "Zaloguj się",
      onPress: () => navigation.navigate("LogIn"),
    },
  ];

  const renderItem = ({ label, onPress }) => {
    return (
      <SquareButton
        style={tw`flex border-2 mx-1 my-1`}
        size={30}
        label={label}
        icon="check"
        onPress={onPress}></SquareButton>
    );
  };

  return (
    <View>
      {/* <View className="flex-row flex-wrap">
        <SquareButton label="Gotowe" icon="check"></SquareButton>
        <SquareButton label="Przybliż" icon="search-plus"></SquareButton>
        <SquareButton label="Oddal" icon="search-minus"></SquareButton>
        <SquareButton label="Dodaj" icon="plus"></SquareButton>
        <SquareButton label="Edytuj" icon="edit"></SquareButton>
        <SquareButton label="Zapisz" icon="save"></SquareButton>
        <SquareButton label="Zapisz" icon="save"></SquareButton>
      </View> */}
      <Text style={tw`text-center p-5 text-3xl pt-5 pb-2 mb-3 font-bold bg-main-5 `}>
          EKRAN GŁÓWNY
      </Text>
      <View style={tw`flex flex-col justify-center`}>
        <FlatList
          style={tw`flex `}
          columnWrapperStyle={tw`flex flex-row justify-center`}
          numColumns={2}
          data={data}
          renderItem={({ item }) => renderItem(item)}
          keyExtractor={(item) => item.id}></FlatList>
      </View>
      {/* <Button
        title="Go to map screen"
        onPress={() => navigation.navigate("Nagraj")}
      />
      <Button
        title="Go to AudioRecord"
        onPress={() => navigation.navigate("NagrywanieAudio", { RecordedAudioUri: "" })}
      />
      <Button title="Go to MapView" onPress={() => navigation.navigate("PodgladMap")} />
      <Button title="Go to MapExplore" onPress={() => navigation.navigate("PrzegladanieMap")} />
      <Button
        title="Go to MapWebExplore"
        onPress={() => navigation.navigate("PrzegladanieWebMap")}
      />
      <Button title="Go to LogIn" onPress={() => navigation.navigate("LogIn")} />
      <Button
        title="clearCurrentMap"
        onPress={() => {
          useMapStore.getState().clearMap();
        }}
      /> */}
      {/* <Button title="signout" onPress={() => firebase.auth().signOut()} /> */}
      <Button title="printuser" onPress={() => console.log(DbUser())} />
    </View>
  );
};

export default HomeScreen;
