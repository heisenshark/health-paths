import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Image, TextInput } from "react-native";
import { Card } from "react-native-paper";
import HeaderBar from "../components/HeaderBar"
import MapCard from "../components/MapCard";
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
//[x] zrobić obsługę manadżera pobrań

const limit = 10;

const MapWebExplorerScreen = ({ navigation, route }) => {
  const [maps, setMaps] = useState<MapDocument[]>([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const track = useRef(null);
  const listMaps = () => {
    let query = Pathes.where("visibility", "==", "public")
      // .orderBy("createdAt", "desc")
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

  return (
    <View style={tw`h-full`}>
      <HeaderBar label={"PUBLICZNE TRASY"} useBack removeMargin />

      <ScrollView>
        {maps.length === 0 && (
          <View style={tw`h-100 flex justify-center items-center`}>
            <Text style={tw`text-center text-3xl font-bold`}>Nie znaleziono ścieżek</Text>
          </View>
        )}

        {maps.map((map) => {
          return (
            <MapCard
              key={map.id}
              name={map.name}
              id={map.id}
              icon={map.iconRef}
              location={map.location}
              onPress={() => {
                console.log(map);
                navigation.navigate("MapWebPreviewScreen", { webMap: map });
              }}
            />
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
