import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import HeaderBar from "../components/HeaderBar";
import MapCard from "../components/MapCard";
import SquareButton from "../components/SquareButton";
import { Pathes, MapDocument } from "../config/firebase";
import tw from "../lib/tailwind";

const limit = 10;
/**
 * Komponent ekranu przeglądania map z chmury, wyświetla listę map
 * @category Ekrany
 * @param {*} navigation_props { navigation, route }
 * @component
 */
const MapWebExplorerScreen = ({ navigation }) => {
  const [maps, setMaps] = useState<MapDocument[]>([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const track = useRef(null);
  /**
   * Funkcja pobierająca listę map z bazy danych i dodająca ją do stanu komponentu
   */
  function listMaps() {
    let query = Pathes.where("visibility", "==", "public").limit(limit);
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
      .catch(() => {});
  }

  useEffect(() => {
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
