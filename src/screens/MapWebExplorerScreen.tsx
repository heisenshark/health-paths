import { useFocusEffect } from "@react-navigation/native"
import * as React from "react";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Card } from "react-native-paper";
import SquareButton from "../components/SquareButton";
import { db, Pathes, MapDocument, togglePrivate } from "../config/firebase";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import { downloadMap } from "../utils/FileSystemManager";
import { getCityAdress } from "../utils/HelperFunctions";
import LogInScreen from "./LogInScreen";

//[x] przemyśleć czy na serio chcę robić to w zipkach z całymi mapkami czy nie lepiej byłoby to załatwić jeszcze dodając jakieś szajsy, ale w sumie to zawsze można zrobić pobieranie mapy, ew tylko robię image preview i wyjebane elo
//[x] jak dodawać lokację do bazy w suuumie XD
//[x] zrobić pobieranie i odzipowanie
//TODO zrobić obsługę manadżera pobrań
const MapWebExplorerScreen = ({ navigation, route }) => {
  const [currentMap, setCurrentMap] = useMapStore((state) => [
    state.currentMap,
    state.setCurrentMap,
  ]);
  const [maps, setMaps] = useState<MapDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const listAllMaps = () => {
    db.collection("Pathes")
      .where("visibility", "==", "public")
      .get()
      .then((querySnapshot) => {
        let maps = [];
        querySnapshot.forEach((doc) => {
          const d = doc.data() as MapDocument;
          d.id = doc.id;
          maps.push(d);
        });
        setMaps(maps);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  };

  useEffect(() => {
    console.log("elo");
    listAllMaps();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      console.log("On Focus, fetching the maps");
      listAllMaps();
    }, [])
  );

  return (
    <View style={tw`h-full`}>
      <View style={tw`bg-main-1 flex justify-center shadow-md`}>
        <Text style={tw`text-4xl font-bold m-0 pt-2 pl-4 shadow-md`}>
          <Text>LOKALNE ŚCIEŻKI</Text>
        </Text>
      </View>
      {/* <Searchbar
        placeholder="Wyszukaj ścieżkę"
        style={tw`shadow-md`}
        value={searchQuery}
        onChangeText={onChangeSearch}></Searchbar> */}
      <ScrollView>
        {maps
          // .filter((map) => {
          //   return (
          //     map.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          //     map.location.toLowerCase().includes(searchQuery.toLowerCase().trim())
          //   );
          // })
          .map((map) => {
            return (
              <Card key={map.id} style={tw`flex flex-row my-1 mx-2`}>
                <Card.Content style={tw`flex flex-row`}>
                  {/* <Image style={tw`flex-0 h-20 w-20 bg-black mr-2`}></Image> */}

                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xl font-bold pr-2`} numberOfLines={1}>
                      {map.name}
                    </Text>
                    {/* <Text style={tw`font-bold pr-2`} numberOfLines={1}>
                      {map.id}
                    </Text> */}
                    <Text style={tw`text-xl`}>{getCityAdress(map.location)}</Text>
                  </View>
                  <SquareButton
                    label="Download"
                    style={tw`ml-auto flex-1`}
                    size={10}
                    disabled={false}
                    onPress={() => {
                      console.log("map.visibility === \"public\"", map.visibility === "public");
                      downloadMap(map);
                      // togglePrivate(map.id, map.visibility === "public").then(() => {
                      //   listAllMaps();
                      //   console.log("end");
                      // });
                    }}></SquareButton>
                  <SquareButton
                    label="Go to Preview"
                    style={tw`ml-auto flex-1`}
                    size={10}
                    disabled={false}
                    onPress={() => {
                      console.log(map);
                      navigation.navigate("MapWebPreviewScreen", { webMap: map });
                      // togglePrivate(map.id, map.visibility === "public").then(() => {
                      //   listAllMaps();
                      //   console.log("end");
                      // });
                    }}></SquareButton>
                  {/* <SquareButton
                    label="togglePrivate"
                    style={tw`ml-auto flex-1`}
                    size={10}
                    disabled={false}
                    onPress={() => {
                      console.log("map.visibility === \"public\"", map.visibility === "public");
                      console.log(map);

                      togglePrivate(map.id, map.visibility === "public").then(() => {
                        listAllMaps();
                        console.log("end");
                      });
                    }}></SquareButton> */}
                </Card.Content>
              </Card>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default MapWebExplorerScreen;
