import { View, Text, BackHandler, ScrollView, Image } from "react-native";
import React, { ReactNode, useEffect, useState } from "react";
import tw from "../lib/tailwind";
import SquareButton from "../components/SquareButton";
import HomeScreen from "./HomeScreen";
import { Tile } from "react-native-elements";
import TileButton from "../components/TileButton";
import HeaderBar from "../components/HeaderBar";

/**
 * Ekran pomocy
 * @category Ekrany
 * @param {*} props { route, navigation }
 * @component
 */
const HelpScreen = ({ route, navigation }) => {
  const [currentState, setCurrentState] = useState("Select");
  const [forward, back, setMaxPages, pageNumber, maxPages] = usePagination(2);

  /**
   * Funkcja renderująca przyciski na początku ekranu w zależności od tego, co znajduje się w contentObject
   */
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

  return (
    <View style={tw`flex bg-slate-100 h-full`}>
      <HeaderBar
        label="POMOC"
        useBack
        onPress={
          currentState === "Select" ? () => navigation.goBack() : () => setCurrentState("Select")
        }
      />
      {currentState === "Select" ? (
        <>
          <Text style={tw`py-6 text-4xl text-center font-bold underline`}>Wybierz poradnik</Text>
          <View style={tw`flex flex-col flex-initial justify-center pb-6`}>{renderButtons()}</View>
        </>
      ) : (
        <>
          <View style={tw`flex flex-row flex-initial justify-center mb-2`}>
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
          <ScrollView style={tw`flex-1 flex flex-col p-2`}>
            {contentObject[currentState].arr[pageNumber - 1]}
            <View style={tw`h-10`} />
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default HelpScreen;
/**
 * Hook do przełączania stron w ekranie pomocy
 * @param {number} max liczba stron
 * @return {*}  {[() => void, () => void, (c: number) => void, number, number]} funkcje do nawigacji w naprzód i wstecz, funkcja ustawiająca maksymalną ilość stron, numer aktualnej strony, liczba stron
 */
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
/**
 * Obiekt zawierający wszystkie poradniki
 */
const contentObject: { [index: string]: { icon: string; label: string; arr: JSX.Element[] } } = {
  Screens: {
    icon: "book",
    label: "Ekrany aplikacji",
    arr: [
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Ekran główny</Text>
        <Text style={tw`text-base`}>
          Ekran w którym użytkownik może przejść do wyboru własnych ścieżek, przeglądać publiczne
          ścieżki, wyjść z aplikacji oraz skorzystać z pomocy.
        </Text>
        <Text style={tw`text-2xl font-bold mb-2`}>Moje ścieżki</Text>
        <Text style={tw`text-base`}>
          Ekran który wyświetla własne ścieżki i pozwala na zarządzanie nimi(usuwanie, edycja,
          podgląd, przesłanie do internetu, zmiana prywatności)
        </Text>
      </>,
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Przeglądaj trasy</Text>
        <Text style={tw`text-base  mb-4`}>
          Ekran który wyświetla publicznie ścieżki i pozwala na ich podgląd
        </Text>
        <Text style={tw`text-2xl font-bold mb-2`}>Pomoc</Text>
        <Text style={tw`text-base mb-4`}>
          Ekran w którym wyświetlana jest pomoc dla użytkownika
        </Text>
        <Text style={tw`text-2xl font-bold mb-2`}>Profil</Text>
        <Text style={tw`text-base mb-4`}>
          Ekran w którym użytkownik może się zalogować oraz inne opcje
        </Text>
      </>,
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Nagraj</Text>
        <Text style={tw`text-base  mb-4`}>
          Ekran pozwalający na tworzenie ścieżki poprzez nagrywanie lokacji użytkownika
        </Text>
        <Text style={tw`text-2xl font-bold mb-2`}>Planuj</Text>
        <Text style={tw`text-base mb-4`}>
          Ekran pozwalający na tworzenie ścieżki poprzez dodawanie punktów na mapie
        </Text>
      </>,
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Podgląd ścieżki</Text>
        <Text style={tw`text-base mb-4`}>
          Ekran pozwalający na podgląd ścieżki z pamięci lokalnej bez edytowania{" "}
        </Text>
        <Text style={tw`text-2xl font-bold mb-2`}>Podgląd ścieżki Web</Text>
        <Text style={tw`text-base  mb-4`}>
          Ekran pozwalający na podgląd ścieżki z bazy, pobranie jej, usunięcie z pamięci oraz
          aktualizację oraz udostępnianie, zalogowany użytkownik może ją oceniać
        </Text>
      </>,
    ],
  },
  Edit: {
    icon: "map",
    label: "Edycja ścieżek",
    arr: [
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Edycja przez nagrywanie</Text>
        <Text style={tw`text-base`}>
          Przejdź na ekran nagraj{"\n"}Kliknij rozpocznij nagrywanie{"\n"}Aplikacja automatycznie
          będzie nagrywać twoją lokalizację i tworzyć trasę
        </Text>
        <Image
          style={tw`h-40 w-auto aspect-square self-center border-2 border-black`}
          source={{
            uri: "https://cdn.discordapp.com/attachments/1070704516854464522/1070704613814181908/tutorial1.png",
          }}
        />
        <Text style={tw`text-base`}>Przyciski po prawej stronie ekranu:{"\n"}</Text>
        <View style={tw`flex flex-row`}>
          <Image
            style={[
              tw`h-60 w-14 self-center border-2 border-black`,
              {
                resizeMode: "contain",
              },
            ]}
            source={{
              uri: "https://media.discordapp.net/attachments/1070704516854464522/1070711956580868126/image.png",
            }}
          />

          <Text style={tw`ml-2 flex-initial text-base`}>
            <Text style={tw`font-bold`}>pauza/wznów</Text>: zatrzymuje/wznawia nagrywanie{"\n"}
            <Text style={tw`font-bold`}>zapisz</Text>: Otwiera opkienko zapisu mapy{"\n"}
            <Text style={tw`font-bold`}>centruj</Text>: Wyśrodkowywuje mapę na aktualnej lokacji
            telefonu{"\n"}
            <Text style={tw`font-bold`}>czyść</Text>: Czyści trasę(nie usuwa punktów stopu){"\n"}
            <Text style={tw`font-bold`}>ukryj/pokaż</Text>: ukrywa/pokazuje markery{"\n"}
          </Text>
        </View>
        <Text style={tw`text-base`}>
          Podczas nagrywania możesz dotknąć mapy co pokaże okienko które umożliwi dodanie punktu
          stopu w wybranym przez ciebie miejscu
        </Text>
        <Image
          style={[
            tw`w-60 h-40 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://cdn.discordapp.com/attachments/1070704516854464522/1070714496148058243/image.png",
          }}
        />
        <Text style={tw`text-base`}>
          Podczas nagrywania możesz dotknąć mapy co pokaże okienko które umożliwi dodanie punktu
          stopu w wybranym przez ciebie miejscu
        </Text>
        <Text style={tw`text-base`}>
          {"\n\n"}Jeśli zapauzujesz nagrywanie i oddalisz się zbyt bardzo od swojej ostatniej
          lokalizacji możesz wypełnić swoją trasę korzystając z directions api po naciśnięciu
          wypełnij trasę
        </Text>
      </>,
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Edycja przez planowanie</Text>
        <Text style={tw`text-base`}>
          Przejdź do zakładki planuj{"\n"}
          dotknij mapę aby dodać punkt, ukaże ci się okienko dodawania punktu, możesz dodać w nim
          punkt stopu lub trasy.{"\n"}Punkty trasy definiują trasę ścieżki przez co możesz lepiej
          zaplanować swoją wyprawę.
        </Text>
        <Image
          style={[
            tw`w-60 h-40 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://media.discordapp.net/attachments/1070704516854464522/1070721141024505916/image.png",
          }}
        />

        <Text style={tw`text-base`}>
          Punkt trasy możemy dodać na początek koniec lub w środku trasy
        </Text>
        <Text style={tw`text-base`}>
          Punkty możemy przemieszczać poprzez dotknięcie w ich miejsce co wywołuje kolejne okienko w
          którym możemy usunąć dany punkt, przenieść lub edytować informacje jeśli jest to punkt
          stopu
        </Text>
        <Image
          style={[
            tw`w-60 h-80 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://media.discordapp.net/attachments/1070704516854464522/1070723986540986368/image.png",
          }}
        />
      </>,
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Edycja punktów stopu</Text>
        <Text style={tw`text-base`}>
          Każdy punkt stopu składa się z dwóch nagrań dźwiękowych, ikony, nazwy i opisu.{"\n"}
          można je edytować wywołując ekran edycji punktu, wywołuje się on też automatycznie po
          dodaniu
        </Text>

        <Text style={tw`text-base`}>
          Każdy punkt stopu składa się z dwóch nagrań dźwiękowych, ikony, nazwy i opisu.{"\n"}
          można je edytować wywołując ekran edycji punktu, wywołuje się on też automatycznie po
          dodaniu
        </Text>

        <Image
          style={[
            tw`w-60 h-120 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://cdn.discordapp.com/attachments/1070704516854464522/1070731715175252058/image.png",
          }}
        />

        <Text style={tw`text-base`}>
          Oprócz tego można też nagrywać audio przechodząc do ekranu nagrywania klikajcąc
          dodaj(edytuj) przy pliku audio i wybierając opcję nagraj
        </Text>
        <Image
          style={[
            tw`w-60 h-80 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://media.discordapp.net/attachments/1070704516854464522/1070732354412359781/image.png",
          }}
        />
      </>,
    ],
  },
  Web: {
    icon: "cloud",
    label: "Funkcje Sieciowe",
    arr: [
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Funkcje Sieciowe</Text>
        <Text style={tw`text-base`}>
          W ekranie Przeglądaj ścieżki możesz przeglądać i pobierać publiczne ścieżki z internetu
          {"\n"}
          Przesyłanie ścieżek do internetu odbywa się za pomocą Ekranu Moje ścieżki, jednak przedtem
          należy się zalogować korzystając z konta google w Pzechodząc do ekranu Opcje i klikając
          Logowanie Google a następnie wybierając swoje konto
        </Text>

        <Image
          style={[
            tw`w-60 h-40 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://media.discordapp.net/attachments/1070704516854464522/1070734122072416336/image.png",
          }}
        />
        <Text style={tw`text-base`}>
          Aby udostępnić ścieżkę należy przejsc do ekranu Moje ścieżki(w zakładce "lokalne"), wybrać
          ścieżkę klikając na nią i a następnie kliknąć w opcję prześlij do internetu
        </Text>
        <Image
          style={[
            tw`w-60 h-100 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://cdn.discordapp.com/attachments/1070704516854464522/1070735742755684483/image.png",
          }}
        />
      </>,
      <>
        <Text style={tw`text-2xl font-bold mb-2`}>Przeglądanie ścieżek</Text>
        <Text style={tw`text-base`}>
          W ekranie Przeglądaj ścieżki możesz przeglądać i pobierać publiczne ścieżki z internetu
          klikając na jedną z nich możesz obejrzeć jej szczegóły i stan.
        </Text>
        <Text style={tw`text-2xl font-bold mb-2`}>Ocenianie ścieżek</Text>
        <Text style={tw`text-base`}>
          W ekranie szczegółów ścieżki możesz ocenić ją klikając na gwiazdkę, ocena jest zapisywana
          po kliknięciu w przycisk "Oceń!"
        </Text>
        <Image
          style={[
            tw`w-60 h-80 self-center border-2 border-black`,
            {
              resizeMode: "contain",
            },
          ]}
          source={{
            uri: "https://media.discordapp.net/attachments/1070704516854464522/1070736715611918356/image.png",
          }}
        />
        <Text style={tw`text-2xl font-bold mb-2`}>Udostępnianie ścieżek</Text>
        <Text style={tw`text-base`}>
          Oprócz tego mozę sz też udostępniać ścieżki, klikając w przycisk "Udostępnij" na ekranie,
          możesz udostępniać tylko publiczne ścieżki klikając w przycisk możesz podzielić się
          linkiem do ścieżki przez dowolny komunikator tekstowy
        </Text>
      </>,
    ],
  },
};
