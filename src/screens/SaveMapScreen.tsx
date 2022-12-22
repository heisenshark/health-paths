import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import tw from "../lib/tailwind";
import SquareButton from "./../components/SquareButton";
import { useMapStore } from "./../stores/store";

interface SaveMapScreenProps {}

const SaveMapScreen = (props: SaveMapScreenProps) => {
  const [currentMap] = useMapStore((state) => [state.currentMap]);
  const saveMapEvent = () => {
    let xd = {
      ...currentMap,
      waypoints: [...waypoints],
      stops: [...stopPoints],
      path: [...fullPath],
    };
    console.log("log1", currentMap);
    addMap(xd);
    setCurrentMap(xd);
    console.log("log2", currentMap);

    saveMap(xd);
  };

  return (
    <View style={styles.container}>
      <Text>Zapisz Swoją Mapę</Text>
      <TextInput label="Nazwa" style={tw``} />
      <Text>Zdjęcie okładkowe</Text>
      <SquareButton
        label="wybierz Zdjęcie"
        onPress={() => {
          console.log("wybierz Zdjęcie");
        }}></SquareButton>
      <SquareButton
        label="Zapisz"
        onPress={() => {
          console.log("Zapisz");
        }}></SquareButton>
    </View>
  );
};

export default SaveMapScreen;

const styles = StyleSheet.create({
  container: {},
});
