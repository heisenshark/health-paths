import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Card, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome5";
import MapCard from "../components/MapCard";
import { ModalChoice, useAlertModal } from "../components/ModalChoice";
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

//[x] uprościć menu wyboru co chcemy zrobić z mapą do prostego modala
//[x] dodać lepsze prompty do usuwania mapy i innych
const MapExplorerScreen = ({ navigation, route }) => {
  const [setCurrentMap] = useMapStore((state) => [state.setCurrentMap]);
  const [maps, setMaps] = useState<HealthPath[]>([]);
  const [userMaps, setUserMaps] = useState<MapDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(true);
  const [additionalOptions, setAdditionalOptions] = useState([]);
  const [mapsState, setMapsState] = useState("local");
  const [webDisabled, setWebDisabled] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [alertState, showAlert] = useAlertModal();

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

          showAlert("Przesyłanie mapy, wybierz prywatność", [
            {
              text: "Publiczna",
              icon: "eye",
              onPress: async () => {
                setDisabled(true);
                await zipUploadMapFolder(selectedMap.current.map_id, "public");
                setDisabled(false);
                refreshMaps();
              },
            },
            {
              text: "Prywatna",
              icon: "eye-slash",
              onPress: async () => {
                setDisabled(true);
                await zipUploadMapFolder(selectedMap.current.map_id, "private");
                setDisabled(false);
                refreshMaps();
              },
            },
          ]);
          setModalVisible(false);
        },
        disabled: DbUser() === undefined,
      },
      {
        label: "Usuń mapę",
        icon: "cloud-upload",
        onPress: () => {
          showAlert(
            "Czy na pewno chcesz usunąć mapę z pamięci?",
            [
              {
                text: "Tak",
                icon: "trash",
                onPress: async () => {
                  await deleteMap(selectedMap.current.map_id);
                  setModalVisible(false);
                  refreshMaps();
                },
              },
              { text: "Anuluj", icon: "arrow-left", onPress: () => console.log("Anulowano") },
            ],
            true
          );
          setModalVisible(false);
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
        onPress: () => {
          showAlert(
            "Czy na pewno chcesz usunąć mapę z internetu?",
            [
              {
                text: "Tak",
                icon: "trash",
                onPress: async () => {
                  await deleteMapWeb(map.id);
                  console.log("usunieto");
                  setUserMaps(userMaps.filter((m) => m.id !== map.id));
                  refreshMaps();
                },
              },
              { text: "Anuluj", icon: "arrow-left", onPress: () => console.log("Anulowano") },
            ],
            true
          );
          setModalVisible(false);
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
      .map((map) => (
        <MapCard
          key={map.map_id}
          name={map.name}
          location={map.location}
          icon={map.imageIcon === undefined ? "" : getURI(map, map.imageIcon)}
          onPress={() => {
            selectedMap.current = map;
            setModalVisible(true);
            setAdditionalOptions(localOptions());
          }}
        />
      ));
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

    return userMaps.map((map) => (
      <MapCard
        key={map.id}
        icon={map.iconRef}
        name={map.name}
        location={map.location}
        visibility={map.visibility}
        onPress={() => {
          selectedMap.current = map;
          console.log({ map, modalVisible });
          setAdditionalOptions(webOptions(map, map.visibility === "private"));
          setModalVisible(true);
        }}
      />
    ));
  }

  return (
    <View style={tw`h-full`} pointerEvents={disabled ? "none" : "auto"}>
      <ModalChoice {...alertState} />
      <OptionsModal
        visible={modalVisible}
        label={"Co chcesz zrobić z mapą?"}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        actions={[...options, ...additionalOptions]}></OptionsModal>
      <View
        style={[
          tw`flex-0 flex flex-row bg-slate-200 border-b-2 border-slate-700  justify-start elevation-5`,
          { alignItems: "center" },
        ]}>
        <SquareButton
          style={tw`m-2 self-start`}
          size={18}
          label="wróć"
          icon={"arrow-left"}
          onPress={() => navigation.goBack()}
        />

        <Text style={tw`text-center text-slate-800 text-4xl mt-2 mb-2 ml-2 font-medium underline`}>
          MOJE TRASY
        </Text>
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
      <View style={tw`flex flex-row border-b-2 border-slate-700`}>
        <SquareButton
          style={tw`flex flex-1 h-14 rounded-none border-b-0 border-r-0 border-main-700 rounded-tl-3xl`}
          uberActive={mapsState === "local"}
          label="lokalne"
          labelStyle={tw`text-3xl`}
          onPress={() => {
            setMapsState("local");
          }}
        />
        <View style={tw`border-l-2 border-main-700`}></View>
        <SquareButton
          style={tw`flex flex-1 h-14 rounded-none border-b-0 border-l-0 border-main-700 rounded-tr-3xl `}
          uberActive={mapsState === "web"}
          label="w chmurze"
          labelStyle={tw`text-3xl`}
          disabled={webDisabled}
          onPress={() => {
            fetchUserMaps();
            setMapsState("web");
          }}
        />
      </View>
    </View>
  );
};

export default MapExplorerScreen;
