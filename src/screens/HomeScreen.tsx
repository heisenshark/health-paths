import React, { useEffect, useState } from "react";
import { Text, View, Button } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import PaletteTest from "../components/PaletteTest";
import SquareButton from "../components/SquareButton";
import tw from "../lib/tailwind";
import { HealthPath } from "../utils/interfaces";
import { useMapStore } from "./../stores/store";

const HomeScreen = ({ navigation }) =>
//TODO przycisk podłóżny
{
  useEffect(() => {
    // navigation.navigate("NagrywanieAudio");
  }, []);

  const [lol, setLol] = useState(1);
  //generate random number
  return (
    <View>
      <Icon name="rocket" size={30} color="#900" />
      <View className="flex-row flex-wrap">
        <SquareButton label="Gotowe" icon="check"></SquareButton>
        <SquareButton label="Przybliż" icon="search-plus"></SquareButton>
        <SquareButton label="Oddal" icon="search-minus"></SquareButton>
        <SquareButton label="Dodaj" icon="plus"></SquareButton>
        <SquareButton label="Edytuj" icon="edit"></SquareButton>
        <SquareButton label="Zapisz" icon="save"></SquareButton>
        <SquareButton label="Zapisz" icon="save"></SquareButton>
      </View>
      <Button
        title="Go to map screen"
        onPress={() => navigation.navigate("Nagraj", { name: "Jane" })}
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
      />
      <Button title="lol" onPress={() => setLol(lol + 1)} />

      <Text style={tw`bg-slate-${lol * 100}`}></Text>
      <PaletteTest paletteName={"main"} />
      <PaletteTest paletteName={"secondary"} />
      <PaletteTest paletteName={"main"} />
      <PaletteTest paletteName={"secondary"} />
    </View>
  );
};

export default HomeScreen;
