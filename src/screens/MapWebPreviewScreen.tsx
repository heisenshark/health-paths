import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Button,
  Image,
  ToastAndroid,
  Share,
  Alert,
} from "react-native";
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
import TileButton from "../components/TileButton";
//[x] make this screen work
//[x] maybe add some button disable stuff so user cant make two requests at once
const MapWebPreview = ({ navigation, route }) => {
  const [mapa, setMapa] = useState<MapDocument>(null);
  const [optionsState, setOptionsState] = useState("download");
  const [disabled, setDisabled] = useState(false);
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
    console.log(
      map.createdAt,
      record.downloadDate,
      record.downloadDate.seconds + 10 < map.createdAt.seconds
    );

    if (record === undefined) return "download";
    if (record.downloadDate.seconds + 10 < map.createdAt.seconds) return "update";
    else return "delete";
  };

  useEffect(() => {
    const m = route.params.webMap;
    if (!m) {
      console.log(route.params.id);
      if (!route.params.id) navigation.goBack();
      Pathes.doc(route.params.id)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            ToastAndroid.show("Mapa nie istnieje", ToastAndroid.SHORT);
            navigation.goBack();
          } else {
            console.log("Document data:", doc.data());
            setUpMap({ id: doc.id, ...doc.data() } as MapDocument);
          }
        });
      return;
    }
    setUpMap(m);
  }, []);

  function setUpMap(m: MapDocument) {
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
  }

  async function ratingAdd() {
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
    ToastAndroid.show("Oceniono", ToastAndroid.SHORT);
    fetchMap();
  }

  const onShare = async () => {
    try {
      const message =
        `Zapraszam do pobrania trasy ${mapa.name} w aplikacji Ścieżki Zdrowia. ` +
        `https://healthpaths.page.link/?link=https://example.com/pathes?id%3D${mapa.id}&apn=com.heisenshark.healthpaths`;
      const result = await Share.share({
        message: message,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  async function onDownload() {
    setDisabled(true);
    try {
      await downloadMap(mapa);
    } catch (e) {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    }
    setOptionsState("delete");
    setDisabled(false);
  }

  async function onDelete() {
    setDisabled(true);
    try {
      const info = await getdownloadTrackerKey(mapa.id);
      await deleteMap(info.mapId);
    } catch (e) {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    }
    setOptionsState("download");
    setDisabled(false);
  }

  async function onShow() {
    setDisabled(true);
    try {
      const info = await getdownloadTrackerKey(mapa.id);
      const m = await loadMap("", info.mapId);
      setDisabled(false);
      navigation.navigate("PodgladMap", { map: m });
    } catch (e) {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    }
  }

  function renderOptions() {
    switch (optionsState) {
    case "download":
      return <SquareButton style={tw`flex-1 ml-4 h-10`} label={"pobierz"} onPress={onDownload} />;
    case "update":
      return (
        <>
          <SquareButton style={tw`flex-1 ml-4 h-10`} label={"zaktualizuj"} onPress={onDownload} />
          <SquareButton style={tw`flex-1 ml-4 h-10`} label={"usuń"} onPress={onDelete} />
        </>
      );
    case "delete":
      return (
        <>
          <SquareButton style={tw`flex-1 ml-4 h-10`} label={"pokaż"} onPress={onShow} />
          <SquareButton style={tw`flex-1 ml-4 h-10`} label={"usuń"} onPress={onDelete} />
        </>
      );
    }
  }

  if (!mapa) return <Text style={tw`text-3xl`}>Ładowanie...</Text>;
  return (
    <>
      <View style={tw`bg-slate-300 border-b-2 border-slate-500 flex flex-row items-center`}>
        <SquareButton
          style={tw`m-2`}
          size={18}
          label="wróć"
          icon={"arrow-left"}
          onPress={() => navigation.goBack()}
        />
        <Text style={tw`text-3xl font-bold`}>TRASA</Text>
      </View>

      <ScrollView style={tw`pt-3 flex-col bg-slate-200 h-full`}>
        <View>
          <Text style={tw`mx-4 font-bold text-2xl flex-auto`} ellipsizeMode="tail">
            {mapa.name}
          </Text>
          <View style={tw`w-full flex flex-row mx-4 mt-4`}>
            <Image
              style={tw`flex-0 h-30 w-30 bg-white mr-2 rounded-md border-2 border-black`}
              source={{ uri: mapa.iconRef !== "" ? mapa.iconRef : imagePlaceholder }}></Image>
            <View style={tw`flex-initial flex flex-col items-start justify-center`}>
              <Text
                style={tw`text-left text-lg font-bold underline flex-initial`}
                numberOfLines={2}>
                Lokacja: {getCityAdress(mapa.location) || "Brak"}
              </Text>
              <Text style={tw`text-lg text-right`}>
                Dodano: {formatTime(mapa?.createdAt?.seconds)}
              </Text>
              <Text style={tw`text-lg bg-black text-white rounded-lg p-2 px-4 mr-auto`}>
                Dystans: {formatDistance(mapa?.distance)}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={tw`flex flex-row px-4 mt-2 pb-1 justify-center items-center border-b-2 border-slate-300`}
          pointerEvents={disabled ? "none" : "auto"}>
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
        <View style={tw`mt-4 mb-2 mx-14 p-4 rounded-xl bg-slate-300 `}>
          <Text style={tw`text-2xl text-center`}>
            Ocena:{" "}
            {mapa.ratingCount > 0 ? (
              <Text style={tw`text-3xl`}>
                {(mapa.rating / mapa.ratingCount).toFixed(2)} ({mapa.ratingCount})
              </Text>
            ) : (
              <Text style={tw`text-2xl`}>Brak ocen</Text>
            )}
          </Text>
        </View>

        {DbUser() !== undefined && (
          <View style={tw`flex flex-col justify-center items-center`}>
            <Rating
              style={tw`w-10/12 justify-around mb-4`}
              onRatingChange={(rating) => {
                rate.current = rating;
              }}
              onSubmit={ratingAdd}></Rating>
          </View>
        )}

        {mapa.visibility === "public" && (
          <View style={tw`flex flex-initial mx-10 mb-10`}>
            <TileButton style={tw``} size={40} label="Udostępnij!" icon="share" onPress={onShare} />
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default MapWebPreview;
