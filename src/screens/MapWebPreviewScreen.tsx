import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, ScrollView, Button, Image } from "react-native";
import tw from "../lib/tailwind";
import { db, DbUser, MapDocument } from "./../config/firebase";
import SquareButton from "./../components/SquareButton";
import { FirebaseStorageTypes } from "@react-native-firebase/storage";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { formatDistance, getCityAdress, imagePlaceholder } from "./../utils/HelperFunctions";
import { map } from "@firebase/util";
import { firebase } from "@react-native-firebase/auth";
import { Card } from "react-native-paper";
import Rating from "../components/Rating";
import { Pathes } from "../config/firebase";
import {
  deleteMap,
  downloadMap,
  DownloadTrackerRecord,
  getdownloadTrackerKey,
  loadMap,
} from "../utils/FileSystemManager";
import { useMapStore } from "../stores/store";
//[x] make this screen work
//TODO maybe add some button disable stuff so user cant make two requests at once
const MapWebPreview = ({ navigation, route }) => {
  const [setCurrentMap] = useMapStore((state) => [state.setCurrentMap]);

  const [mapa, setMapa] = useState<MapDocument>({});
  const [optionsState, setOptionsState] = useState("download");
  const rate = useRef<number>(0);
  console.log(mapa);
  const formatTime = (time: number) => {
    if (time === undefined) return "";
    return format(time * 1000, "do LLLL yyyy", { locale: pl });
  };

  const fetchMap = async () => {
    const newMap = await Pathes.doc(mapa.id).get();
    console.log("aaaaaa", newMap.data());
    setMapa({ id: mapa.id, ...newMap.data() } as MapDocument);
  };

  //jakie są stany
  //1. mapa nie istnieje na dysku(download)
  //2. mapa istnieje na dysku ale jest nieaktualna(update, usuń)
  //3. mapa istnieje na dysku i jest aktualna (pokaż, usuń)
  const compareInfo = (map: MapDocument, record: DownloadTrackerRecord): string => {
    // const downloadDate = new Date(record.downloadDate.seconds * 1000);
    // const uploadDate = new Date(map.createdAt.seconds * 1000);
    console.log(map.createdAt, record.downloadDate);

    if (record === undefined) return "download";
    if (record.downloadDate.seconds + 10 < map.createdAt.seconds) return "update";
    else return "delete";
  };

  useEffect(() => {
    const m = route.params.webMap;
    setMapa(m as MapDocument);
    console.log(m);
    const date = new Date(m.createdAt.seconds * 1000);
    const dateString = format(m.createdAt.seconds * 1000, "do LLLL yyyy", { locale: pl });
    console.log(dateString, "");

    getdownloadTrackerKey(m.id).then((key) => {
      console.log("key", key);
      if (key !== undefined) {
        const state = compareInfo(m, key);
        console.log("state", state);
        setOptionsState(state);
      }
    });
  }, []);

  function renderOptions() {
    switch (optionsState) {
    case "download":
      return (
        <SquareButton
          style={tw`flex-1 ml-4 h-10`}
          label={"pobierz"}
          onPress={async () => {
            await downloadMap(mapa);
            setOptionsState("delete");
          }}></SquareButton>
      );
    case "update":
      return (
        <>
          <SquareButton
            style={tw`flex-1 ml-4 h-10`}
            label={"zaktualizuj"}
            onPress={async () => {
              await downloadMap(mapa);
              setOptionsState("delete");
            }}></SquareButton>
          <SquareButton
            style={tw`flex-1 ml-4 h-10`}
            label={"usuń"}
            onPress={async () => {
              const info = await getdownloadTrackerKey(mapa.id);
              await deleteMap(info.mapId);
              setOptionsState("download");
            }}></SquareButton>
        </>
      );
    case "delete":
      return (
        <>
          <SquareButton
            style={tw`flex-1 ml-4 h-10`}
            label={"pokaż"}
            onPress={async () => {
              const info = await getdownloadTrackerKey(mapa.id);
              const m = await loadMap("", info.mapId);
              setCurrentMap(m);
              navigation.navigate("PodgladMap");
            }}></SquareButton>
          <SquareButton
            style={tw`flex-1 ml-4 h-10`}
            label={"usuń"}
            onPress={async () => {
              const info = await getdownloadTrackerKey(mapa.id);
              await deleteMap(info.mapId);
              setOptionsState("download");
            }}></SquareButton>
        </>
      );
    }
  }

  return (
    <>
      <View style={tw`bg-slate-300`}>
        <SquareButton
          style={tw`m-2`}
          size={18}
          label="wróć"
          icon={"arrow-left"}
          onPress={() => {
            navigation.goBack();
          }}></SquareButton>
      </View>
      <ScrollView style={tw`pt-3 flex-col bg-slate-200`}>
        <View style={tw` flex flex-row mx-4 mt-4`}>
          <Image
            style={tw`flex-0 h-30 w-30 bg-white mr-2 rounded-md`}
            source={{ uri: mapa.iconRef !== "" ? mapa.iconRef : imagePlaceholder }}></Image>
          <View>
            <Text style={tw`text-2xl mt-2 flex-1`} numberOfLines={2}>
              {mapa.name}
            </Text>
            <Text style={tw`text-lg bg-black text-white rounded-lg p-2 px-4 mr-auto`}>
              Dystans: {formatDistance(mapa?.distance)}
            </Text>
            <Text style={tw`text-lg text-right`}>
              Data dodania: {formatTime(mapa?.createdAt?.seconds)}
            </Text>
          </View>
        </View>
        <Text style={tw`ml-4 text-left text-xl underline`}>
          Lokacja startowa: {getCityAdress(mapa.location)}
        </Text>
        <View
          style={tw`flex flex-row px-4 mt-2 pb-1 justify-center items-center border-b-2 border-slate-300 `}>
          {renderOptions()}
        </View>

        <View style={tw`flex flex-col items-center`}>
          <Image
            style={tw`flex-0 aspect-square w-10/12 bg-white mr-2 items-center justify-center`}
            source={{ uri: mapa?.previewRef }}></Image>
          <Text style={tw`text-xl font-bold self-start ml-4`}>Opis: {mapa.description}</Text>
        </View>
        {mapa.ownerId !== DbUser() ? (
          <Text style={tw`text-lg text-center`}>Mapa utworzona przez {mapa.ownerName}</Text>
        ) : (
          <>
            <Text style={tw`text-lg text-left ml-4`}>Jesteś właścicielem tej mapy</Text>
          </>
        )}
        <View style={tw`ml-4 mt-4 mb-10`}>
          <Text style={tw`text-2xl`}>Opinie użytkowników </Text>
          {mapa.ratingCount > 0 ? (
            <Text style={tw`text-3xl`}>
              {(mapa.rating / mapa.ratingCount).toFixed(2)} ({mapa.ratingCount})
            </Text>
          ) : (
            <Text style={tw`text-2xl`}>Brak ocen</Text>
          )}
        </View>

        {DbUser() !== undefined && (
          <View style={tw`flex flex-col justify-center items-center`}>
            <Text style={tw`text-3xl text-center`}>Oceń mape</Text>
            <Rating
              style={tw`w-full justify-around mb-4`}
              onRatingChange={(rating) => {
                rate.current = rating;
              }}></Rating>
            <View style={tw`flex-row`}>
              <SquareButton
                style={tw`flex-1 mx-4 h-10 mb-10`}
                label={"Zrób cokolwiek"}
                onPress={async () => {
                  // console.log("rate", rate.current);
                  const r = rate.current as number;

                  const prevValue = await db
                    .collection("Ratings")
                    .doc(mapa.id + DbUser())
                    .get();

                  const dta = prevValue.data();

                  const elo = await db
                    .collection("Ratings")
                    .doc(mapa.id + DbUser())
                    .set({
                      mapId: mapa.id,
                      userId: DbUser(),
                      rating: r,
                    });
                  console.log("ssss");

                  let ratingSum = rate.current;
                  if (dta && dta.rating) ratingSum -= dta.rating;
                  const addition = dta ? 0 : 1;
                  console.log("ratingSum", ratingSum, mapa.id);
                  await Pathes.doc(mapa.id).update({
                    rating: firebase.firestore.FieldValue.increment(ratingSum),
                    ratingCount: firebase.firestore.FieldValue.increment(addition),
                  });
                  fetchMap();
                }}></SquareButton>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default MapWebPreview;
