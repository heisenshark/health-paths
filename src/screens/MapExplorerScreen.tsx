import * as React from "react";
import { useState } from "react";
import { Text, View, Image, ScrollView } from "react-native";
import { Card, Searchbar } from "react-native-paper";
import SquareButton from "../components/SquareButton";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";

interface MapExplorerScreenProps {}

const MapExplorerScreen = ({ navigation, route }) => {
  const maps = useMapStore((state) => state.maps);
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <View style={tw`h-full`}>
      <View style={tw` bg-main-1 flex justify-center shadow-md`}>
        <Text style={tw`text-4xl font-bold m-0 pt-2 pl-4 shadow-md`}>LOKALNE ŚCIEŻKI</Text>
      </View>
      <Searchbar
        placeholder="Wyszukaj ścieżkę"
        style={tw`shadow-md`}
        value={searchQuery}
        onChangeText={onChangeSearch}></Searchbar>
      <ScrollView>
        {Object.keys(maps)
          .map((value) => maps[value])
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
                  <Image style={tw`flex-0 h-20 w-20 bg-black mr-2`}></Image>

                  <View style={tw`flex-1`}>
                    <Text style={tw`text-3xl font-bold pr-2`} numberOfLines={1}>
                      {map.name}
                    </Text>
                    <Text style={tw`text-3xl font-bold pr-2`} numberOfLines={1}>
                      {map.map_id}
                    </Text>
                    <Text style={tw`text-2xl`}>{map.location}</Text>
                  </View>
                  <SquareButton
                    label="Pokaż"
                    style={tw`ml-auto`}
                    onPress={() => {
                      navigation.navigate("PodgladMap", { mapToPreview: map });
                    }}></SquareButton>
                  <SquareButton
                    label="print"
                    style={tw`ml-auto`}
                    onPress={() => {
                      console.log(map);
                      console.log(map.waypoints);
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
