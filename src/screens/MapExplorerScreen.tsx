import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Card, Searchbar } from "react-native-paper";
import OptionsModal from "../components/OptionsModal";
import SquareButton from "../components/SquareButton";
import {
  DbUser,
  deleteMapWeb,
  MapDocument,
  Pathes,
  togglePrivate,
  Users,
} from "../config/firebase";
import { useForceUpdate } from "../hooks/useForceUpdate";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import {
  deleteMap,
  getURI,
  listAllMaps,
  loadMap,
  zipUploadMapFolder,
} from "../utils/FileSystemManager";
import { getCityAdress, imagePlaceholder } from "../utils/HelperFunctions";
import { HealthPath } from "../utils/interfaces";

//TODO uprościć menu wyboru co chcemy zrobić z mapą do prostego modala

const MapExplorerScreen = ({ navigation, route }) => {
  const [setCurrentMap] = useMapStore((state) => [state.setCurrentMap]);
  const [maps, setMaps] = useState<HealthPath[]>([]);
  const [userMaps, setUserMaps] = useState<MapDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(true);
  const [additionalOptions, setAdditionalOptions] = useState([]);
  const [mapsState, setMapsState] = useState("local");
  const [webDisabled, setWebDisabled] = useState(false);
  const force = useForceUpdate();
  const onChangeSearch = (query: string) => setSearchQuery(query);

  const refreshMaps = async () => {
    const m = await listAllMaps();
    m.forEach((map) => {
      console.log(map.imagePreview);
    });
    setMaps(m);
  };

  const selectedMap = useRef(null);

  const fetchUserMaps = async () => {
    const user = await Users.doc(DbUser()).get();
    console.log(user.data());

    if (user.exists) {
      const maps = user.data().maps;
      const mapsData = await Pathes.where("ownerId", "==", DbUser()).get();

      const mapsDocs = mapsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as MapDocument[];
      console.log(mapsDocs);

      setUserMaps(mapsDocs);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (DbUser() === undefined) {
        setWebDisabled(true);
        setMapsState("local");
        setAdditionalOptions(localOptions());
      } else {
        setWebDisabled(false);
      }
      console.log("aaaaaa");
    }, [])
  );

  useEffect(() => {
    selectedMap.current = null;
    setModalVisible(false);
    refreshMaps();
  }, []);

  const options = [] as { label: string; icon?: string; disabled?: boolean; onPress: () => void }[];

  function localOptions() {
    const isOwner = DbUser() != undefined;
    return [
      {
        label: "Pokaż Mapę",
        icon: "cloud-download",
        onPress: () => {
          setModalVisible(false);
          loadMap(selectedMap.current.name, selectedMap.current.map_id).then((m) => {
            navigation.navigate("PodgladMap", { map: m });
          });
        },
      },
      {
        label: "Edytuj mapę",
        icon: "cloud-upload",
        onPress: async () => {
          setModalVisible(false);
          setCurrentMap(selectedMap.current);
          loadMap(selectedMap.current.name, selectedMap.current.map_id).then((m) => {
            setCurrentMap(m);
            navigation.navigate("Planuj", { isRecording: false, editting: true });
          });
        },
      },
      {
        label: "Prześlij do internetu",
        icon: "minus-circle",
        onPress: async () => {
          if (DbUser() === undefined) {
            setModalVisible(false);
            return;
          }

          Alert.alert("Przesyłanie mapy", "Wybierz prywatność", [
            {
              text: "Publiczna",
              onPress: async () => await zipUploadMapFolder(selectedMap.current.map_id, "public"),
            },
            {
              text: "Prywatna",
              onPress: async () => await zipUploadMapFolder(selectedMap.current.map_id, "private"),
            },
            { text: "Anuluj", onPress: () => console.log("OK Pressed") },
          ]);
          setModalVisible(false);
        },
        disabled: DbUser() === undefined,
      },
      {
        label: "Usuń mapę",
        icon: "cloud-upload",
        onPress: () => {
          deleteMap(selectedMap.current.map_id).then(() => {
            setModalVisible(false);
            refreshMaps();
          });
        },
      },
    ];
  }

  function webOptions(map: MapDocument, isPrivate: boolean) {
    return [
      {
        label: "pokaż",
        icon: "minus-circle",
        onPress: async () => {
          navigation.navigate("MapWebPreviewScreen", { webMap: map });
        },
      },
      {
        label: "ustaw na prywatną",
        icon: "minus-circle",
        onPress: async () => {
          try {
            await togglePrivate(map.id, true);
            map.visibility = "private";
            force();
          } catch (e) {
            console.log(e);
          }
        },
        disabled: isPrivate,
      },
      {
        label: "ustaw na publiczną",
        icon: "minus-circle",
        onPress: async () => {
          try {
            await togglePrivate(map.id, false);
            map.visibility = "public";
            force();
          } catch (e) {
            console.log(e);
          }
        },
        disabled: !isPrivate,
      },
      {
        label: "usuń",
        icon: "minus-circle",
        onPress: async () => {
          await deleteMapWeb(map.id);
          console.log("usunieto");
          setUserMaps(userMaps.filter((m) => m.id !== map.id));
        },
      },
    ];
  }

  function renderMaps() {
    if (maps.length === 0)
      return (
        <View style={tw`h-100 flex items-center justify-center`}>
          <Text style={tw`text-3xl text-center`}>Brak map...</Text>
          <Text style={tw`text-xl w-2/3 text-center`} numberOfLines={2}>
            Możesz jakieś dodać w Sekcji Planuj oraz Nagraj
          </Text>
        </View>
      );

    return maps
      .filter((map) => {
        return (
          map.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          map.location.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
      })
      .map((map) => {
        // if (map.imagePreview) console.log({ aa: getURI(map, map.imagePreview) });

        return (
          <TouchableOpacity
            key={map.map_id}
            style={tw`flex flex-col my-1 mx-2 bg-main-100 px-2 py-2 rounded-xl elevation-3`}
            onPress={() => {
              selectedMap.current = map;
              setModalVisible(true);
              setAdditionalOptions(localOptions());
            }}>
            <View style={tw`flex flex-row pr-24`}>
              <Image
                style={tw`flex-0 h-20 w-20 bg-white border-2 border-black rounded-lg mr-2`}
                source={{
                  uri: map.imageIcon === undefined ? imagePlaceholder : getURI(map, map.imageIcon),
                }}></Image>
              <View style={tw`flex-auto flex flex-col rounded-xl items-stretch`}>
                <Text style={tw`text-xl font-bold`} ellipsizeMode="tail" numberOfLines={1}>
                  {map.name}
                </Text>
                <Text style={tw`flex-auto text-xl`} ellipsizeMode="tail" numberOfLines={1}>
                  {getCityAdress(map.location)}
                </Text>
                {/* <Text style={tw`text-xl`}>{map.map_id}</Text> */}
              </View>
            </View>
          </TouchableOpacity>
        );
      });
  }

  function renderUserMaps() {
    if (userMaps.length === 0)
      return (
        <View style={tw`h-100 flex items-center justify-center`}>
          <Text style={tw`text-3xl text-center`}>Brak map...</Text>
          <Text style={tw`text-xl w-2/3 text-center`} numberOfLines={2}>
            Możesz jakieś dodać w zakładce Lokalne
          </Text>
        </View>
      );

    return userMaps.map((map) => {
      if (map.previewRef) console.log({ aa: map.previewRef });
      return (
        <TouchableOpacity
          key={map.id}
          style={tw`flex flex-col my-1 mx-2 bg-main-100 px-2 py-2 rounded-xl elevation-3`}
          onPress={() => {
            selectedMap.current = map;
            console.log({ map, modalVisible });
            setAdditionalOptions(webOptions(map, map.visibility === "private"));
            setModalVisible(true);
          }}>
          <View style={tw`flex flex-row pr-24`}>
            <Image
              style={tw`flex-0 h-20 w-20 bg-white border-2 border-black rounded-lg mr-2`}
              source={{
                uri: map.iconRef === "" ? imagePlaceholder : map.iconRef,
              }}></Image>

            <View style={tw`flex-auto flex flex-col rounded-xl items-stretch`}>
              <Text style={tw`text-xl font-bold`} ellipsizeMode="tail" numberOfLines={1}>
                {map.name}
              </Text>
              <Text style={tw`flex-auto text-xl`} ellipsizeMode="tail" numberOfLines={1}>
                {getCityAdress(map.location)}
              </Text>
              <Text>{map.visibility === "private" ? "prywatna" : "publiczna"}</Text>
              {/* <Text style={tw`text-xl`} numberOfLines={1}>{map.id}</Text> */}
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  }

  return (
    <View style={tw`h-full`}>
      <OptionsModal
        visible={modalVisible}
        label={"Co chcesz zrobić z mapą?"}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        actions={[...options, ...additionalOptions]}></OptionsModal>
      <View
        style={[
          tw`flex-0 flex flex-row bg-slate-200 mb-2 border-b-2 border-slate-500 justify-center elevation-5`,
          { alignItems: "center" },
        ]}>
        <Text style={tw`text-center text-slate-800 text-4xl mt-2 mb-2 ml-2 font-medium underline`}>
          MOJE TRASY
        </Text>
      </View>
      <View style={tw`flex flex-row`}>
        <SquareButton
          style={tw`flex flex-1 h-10 mx-4 my-2`}
          uberActive={mapsState === "local"}
          label="lokalne"
          onPress={() => {
            setMapsState("local");
          }}
        />
        <SquareButton
          style={tw`flex flex-1 h-10 mx-4 my-2`}
          uberActive={mapsState === "web"}
          label="web"
          disabled={webDisabled}
          onPress={() => {
            fetchUserMaps();
            setMapsState("web");
          }}
        />
      </View>

      {mapsState === "local" && (
        <Searchbar
          placeholder="Wyszukaj ścieżkę"
          style={tw`shadow-md`}
          value={searchQuery}
          onChangeText={onChangeSearch}></Searchbar>
      )}

      <ScrollView>
        {mapsState === "local" && renderMaps()}
        {mapsState === "web" && renderUserMaps()}
      </ScrollView>
    </View>
  );
};

export default MapExplorerScreen;
