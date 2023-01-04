import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, Image, ScrollView } from "react-native";
import { Card, Searchbar } from "react-native-paper";
import SquareButton from "../components/SquareButton";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import {
  cloudCheck,
  deleteMap,
  listAllMaps,
  loadMap,
  moveMap,
  zipUploadMapFolder,
} from "../utils/FileSystemManager";
import { getCityAdress } from "../utils/HelperFunctions";
import { HealthPath } from "../utils/interfaces";

interface MapExplorerScreenProps {}

//TODO uprościć menu wyboru co chcemy zrobić z mapą do prostego modala

const MapExplorerScreen = ({ navigation, route }) => {
  const [currentMap, setCurrentMap] = useMapStore((state) => [
    state.currentMap,
    state.setCurrentMap,
  ]);
  const [maps, setMaps] = useState<HealthPath[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const refreshMaps = async () => {
    const m = await listAllMaps();
    setMaps(m);
  };
  useEffect(() => {
    console.log("elo");
    refreshMaps();
  }, []);

  return (
    <View style={tw`h-full`}>
      <View style={tw`bg-main-1 flex justify-center shadow-md`}>
        <Text style={tw`text-4xl font-bold m-0 pt-2 pl-4 shadow-md`}>
          <Text>LOKALNE </Text>
          <Text> WEB</Text>
        </Text>
      </View>
      <Searchbar
        placeholder="Wyszukaj ścieżkę"
        style={tw`shadow-md`}
        value={searchQuery}
        onChangeText={onChangeSearch}></Searchbar>
      <ScrollView>
        {maps
          .filter((map) => {
            return (
              map.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
              map.location.toLowerCase().includes(searchQuery.toLowerCase().trim())
            );
          })
          .map((map) => {
            return (
              <Card key={map.map_id} style={tw`flex flex-row my-1 mx-2`}>
                <Card.Content style={tw`flex flex-row`}>
                  {/* <Image style={tw`flex-0 h-20 w-20 bg-black mr-2`}></Image> */}

                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xl font-bold pr-2`} numberOfLines={1}>
                      {map.name}
                    </Text>
                    <Text style={tw`font-bold pr-2`} numberOfLines={1}>
                      {map.map_id}
                    </Text>
                    <Text style={tw`text-xl`}>{getCityAdress(map.location)}</Text>
                  </View>
                  <SquareButton
                    label="Pokaż"
                    style={tw`ml-auto`}
                    size={10}
                    onPress={() => {
                      loadMap(map.name, map.map_id).then((m) => {
                        setCurrentMap(m);
                        navigation.navigate("PodgladMap");
                      });
                    }}></SquareButton>
                  <SquareButton
                    label="print"
                    style={tw`ml-auto`}
                    size={10}
                    onPress={() => {
                      loadMap(map.name, map.map_id).then((m) => {
                        console.log(m.path);
                      });
                      // console.log(map);
                      // console.log(map.waypoints);
                    }}></SquareButton>
                  <SquareButton
                    label="ZIP"
                    style={tw`ml-auto`}
                    size={12}
                    disabled={false}
                    onPress={() => {
                      zipUploadMapFolder(map.map_id);
                    }}></SquareButton>
                  <SquareButton
                    label="Delete"
                    style={tw`ml-auto`}
                    size={12}
                    disabled={false}
                    onPress={async () => {
                      await deleteMap(map.map_id);
                      refreshMaps();
                    }}></SquareButton>
                  <SquareButton
                    label="edit"
                    style={tw`ml-auto`}
                    size={12}
                    disabled={false}
                    onPress={() => {
                      setCurrentMap(map);
                      loadMap(map.name, map.map_id).then((m) => {
                        setCurrentMap(m);
                        navigation.navigate("Nagraj", { isRecording: false, editting: true });
                      });
                    }}></SquareButton>
                  <SquareButton
                    label="move"
                    style={tw`ml-auto`}
                    size={12}
                    disabled={false}
                    onPress={async () => {
                      await moveMap(map.map_id, "test");
                    }}></SquareButton>
                </Card.Content>
              </Card>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default MapExplorerScreen;
