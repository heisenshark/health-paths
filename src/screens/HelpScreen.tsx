import { View, Text, BackHandler } from "react-native";
import React, { ReactNode, useEffect, useState } from "react";
import tw from "../lib/tailwind";
import SquareButton from "../components/SquareButton";
import HomeScreen from "./HomeScreen";
import { Tile } from "react-native-elements";
import TileButton from "../components/TileButton";
import HeaderBar from "../components/HeaderBar";

type Props = {};
type pages = (string | JSX.Element)[];
const content: (string | JSX.Element)[] = [];

const HelpScreen = ({ route, navigation }) => {
  const [currentState, setCurrentState] = useState("Select");
  const [forward, back, setMaxPages, pageNumber, maxPages] = usePagination(
    // contentObject[currentState].arr.length
    2
  );

  function renderButtons() {
    const elo = [];
    for (const [key, value] of Object.entries(contentObject)) {
      elo.push(
        <TileButton
          key={key}
          style={tw`m-2 mx-8`}
          label={value.label}
          icon={value.icon}
          onPress={() => {
            setCurrentState(key);
            setMaxPages(contentObject[key].arr.length);
          }}
        />
      );
    }
    return elo;
  }

  useEffect(() => {
    const backAction = () => {
      if (currentState === "Select") return false;
      else setCurrentState("Select");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [navigation, currentState]);

  // setMaxPages(contentObject[currentState].length);
  return (
    <View style={tw`flex bg-slate-100 h-full`}>
      <HeaderBar label="POMOC" useBack />
      {currentState === "Select" ? (
        <>
          <Text style={tw`py-6 text-4xl text-center font-bold underline`}>Wybierz poradnik</Text>
          <View style={tw`flex flex-col flex-initial justify-center pb-6`}>{renderButtons()}</View>
        </>
      ) : (
        <>
          <View style={tw`flex flex-row flex-initial justify-center`}>
            <SquareButton
              size={tw.prefixMatch("md") ? 20 : 15}
              label="wstecz"
              icon="arrow-left"
              onPress={back}
              disabled={pageNumber === 1}
            />
            <Text
              style={[
                tw`text-center text-3xl bg-main-500 text-slate-900 border-main-900 border-2 rounded-lg px-4 mx-4 my-2`,
                {
                  textAlignVertical: "center",
                },
              ]}>
              {pageNumber} / {maxPages}
            </Text>
            <SquareButton
              size={tw.prefixMatch("md") ? 20 : 15}
              label="dalej"
              icon="arrow-right"
              onPress={forward}
              disabled={pageNumber === maxPages}
            />
          </View>
          <View style={tw`flex-1 flex flex-col justify-center items-center`}>
            {renderPage(contentObject[currentState].arr[pageNumber - 1])}
          </View>
        </>
      )}
    </View>
  );
};

export default HelpScreen;

function usePagination(max: number): [() => void, () => void, (c: number) => void, number, number] {
  const [pageNumber, setPageNumber] = useState(1);
  const [maxPages, setMaxPages] = useState(max);
  function nav(dir: boolean) {
    if (dir && pageNumber === maxPages) return;
    if (!dir && pageNumber === 1) return;
    setPageNumber(pageNumber + (dir ? 1 : -1));
  }
  return [
    () => nav(true),
    () => nav(false),
    (c) => {
      setPageNumber(1);
      setMaxPages(c);
    },
    pageNumber,
    maxPages,
  ];
}

const contentObject: { [index: string]: { icon: string; label: string; arr: pages } } = {
  Screens: {
    icon: "book",
    label: "Ekrany aplikacji",
    arr: [
      "Wybierz mapę, którą chcesz edytować. Jeśli nie masz żadnej mapy, wybierz opcję 'Nowa mapa'.",
      "aaaaaaaaaaaaa",
      "asssdfsdfsdf",
      "sdfsdfsdddddddd",
    ],
  },
  Edit: {
    icon: "map",
    label: "Edycja ścieżek",
    arr: [
      "Wybierz mapę, którą chcesz edytować. Jeśli nie masz żadnej mapy, wybierz opcję 'Nowa mapa'.",
      "aaaaaaaaaaaaa",
      "asssdfsdfsdf",
      "sdfsdfsdddddddd",
    ],
  },
  Web: {
    icon: "cloud",
    label: "Funkcje Sieciowe",
    arr: [
      "Wybierz mapę, którą chcesz edytować. Jeśli nie masz żadnej mapy, wybierz opcję 'Nowa mapa'.",
      "aaaaaaaaaaaaa",
      "asssdfsdfsdf",
      "sdfsdfsdddddddd",
    ],
  },
};
const renderPage = (page: string | JSX.Element) =>
  typeof page === "string" ? <Text>{page}</Text> : page;
