import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Image, TextInput } from "react-native";
import { Card } from "react-native-paper";
import SquareButton from "../components/SquareButton";
import { db, Pathes, MapDocument, togglePrivate, DbUser } from "../config/firebase";
import { useForceUpdate } from "../hooks/useForceUpdate";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import { downloadMap } from "../utils/FileSystemManager";
import { getCityAdress, imagePlaceholder } from "../utils/HelperFunctions";
import LogInScreen from "./LogInScreen";

//[x] przemyśleć czy na serio chcę robić to w zipkach z całymi mapkami czy nie lepiej byłoby to załatwić jeszcze dodając jakieś szajsy, ale w sumie to zawsze można zrobić pobieranie mapy, ew tylko robię image preview i wyjebane elo
//[x] jak dodawać lokację do bazy w suuumie XD
//[x] zrobić pobieranie i odzipowanie
//TODO zrobić obsługę manadżera pobrań

const limit = 3;

const MapWebExplorerScreen = ({ navigation, route }) => {
  const [currentMap, setCurrentMap] = useMapStore((state) => [
    state.currentMap,
    state.setCurrentMap,
  ]);
  const [maps, setMaps] = useState<MapDocument[]>([]);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const track = useRef(null);
  const force = useForceUpdate();
  const listMaps = () => {
    let query = db
      .collection("Pathes")
      .where("visibility", "==", "public")
      .orderBy("createdAt", "desc")
      .limit(limit);
    if (track.current !== null) query = query.startAfter(track.current);
    query
      .get()
      .then((querySnapshot) => {
        let m = [];
        querySnapshot.forEach((doc) => {
          const d = doc.data() as MapDocument;
          d.id = doc.id;
          m.push(d);
        });
        setMaps((prev) => [...prev, ...m]);

        track.current = querySnapshot.docs[querySnapshot.docs.length - 1];
        setShowLoadMore(!querySnapshot.empty && querySnapshot.size === limit);
        if (querySnapshot.empty) track.current = 0;
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  };

  useEffect(() => {
    console.log("elo");
    listMaps();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      console.log("On Focus, fetching the maps");
      // listMaps();
    }, [])
  );

  return (
    <View style={tw`h-full`}>
      <View
        style={[
          tw`flex-0 flex flex-row bg-slate-200 mb-2 border-b-2 border-slate-500 justify-center elevation-5`,
          { alignItems: "center" },
        ]}>
        <Text style={tw`text-center text-slate-800 text-4xl mt-2 mb-2 ml-2 font-medium underline`}>
          PUBLICZNE ŚCIEŻKI
        </Text>
      </View>

      <ScrollView>
        {maps.length === 0 && (
          <View style={tw`h-100 flex justify-center items-center`}>
            <Text style={tw`text-center text-3xl font-bold`}>Nie znaleziono ścieżek</Text>
          </View>
        )}

        {maps.map((map) => {
          return (
            <TouchableOpacity
              key={map.id}
              style={tw`flex flex-col my-1 mx-2 bg-main-100 px-2 py-2 rounded-xl elevation-3`}
              onPress={() => {
                console.log(map);
                navigation.navigate("MapWebPreviewScreen", { webMap: map });
              }}>
              <View style={tw`flex flex-row pr-24`}>
                <Image
                  style={tw`flex-0 h-20 w-20 bg-white mr-2`}
                  source={{
                    uri: map.iconRef === "" ? imagePlaceholder : map.iconRef,
                  }}></Image>

                <View style={tw`flex-1`}>
                  <Text style={tw`text-xl font-bold pr-2`} numberOfLines={1}>
                    {map.name}
                  </Text>
                  <Text style={tw`font-bold pr-2`} numberOfLines={1}>
                    {map.id}
                  </Text>
                  <Text style={tw`text-xl`}>{getCityAdress(map.location)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {showLoadMore && (
          <View style={tw`w-full flex items-center`}>
            <SquareButton
              label="Załaduj więcej"
              size={30}
              icon="arrow-down"
              onPress={() => {
                if (track.current !== 0) listMaps();
              }}></SquareButton>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MapWebExplorerScreen;
