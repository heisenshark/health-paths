import { GoogleSignin, statusCodes, User } from "@react-native-google-signin/google-signin";
import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, Image, ToastAndroid } from "react-native";
import tw from "../lib/tailwind";
import { DbUser } from "./../config/firebase";
import { firebase } from "@react-native-firebase/auth";
import auth from "@react-native-firebase/auth";
import { imagePlaceholder } from "../utils/HelperFunctions";
import TileButton from "../components/TileButton";
import HeaderBar from "../components/HeaderBar";

/**
 * Ekran ustawień aplikacji
 * @category Ekrany
 * @param {*} navigation_prop { navigation, route }
 * @component
 */
const OptionsScreen = ({ navigation, route }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(undefined as User | undefined);

  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    if (DbUser() === undefined) return;
    GoogleSignin.getCurrentUser().then((u) => {
      setUser(u);
      setIsLogged(true);
    });
  }, [route.key, DbUser()]);

  /**
   * Funkcja realizująca logowanie do aplikacji za pomocą konta Google
   * @return {*}
   */
  const logIn = async () => {
    try {
      setInactive(true);
      const elo = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = await auth.GoogleAuthProvider.credential(idToken);
      await GoogleSignin.clearCachedAccessToken(idToken);
      await GoogleSignin.getTokens();
      await auth().signInWithCredential(googleCredential);
      const usr = await GoogleSignin.getCurrentUser();
      setUser(usr);
      setIsLogged(true);
      setInactive(false);
    } catch (e) {
      setInactive(false);
      setIsLogged(false);
      if (e.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (e.code === statusCodes.IN_PROGRESS) return;
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        ToastAndroid.show(
          "Nie masz zainstalowanych Google Play Services, więc nie możesz się zalogować",
          ToastAndroid.LONG
        );
        return;
      }
      ToastAndroid.show("Błąd logowania " + e, ToastAndroid.LONG);
    }
  };
  /**
   * Funkcja realizująca wylogowanie z konta google
   */
  async function logOut() {
    setIsLogged(false);
    await firebase.auth().signOut();
    await GoogleSignin.signOut();
  }
  return (
    <View style={tw`flex`} pointerEvents={inactive ? "none" : "auto"}>
      <HeaderBar label={"OPCJE UŻYTKOWNIKA"} />
      {isLogged ? (
        <>
          {tw.prefixMatch("md") && (
            <Text
              style={tw`text-2xl md:text-3xl text-center mx-16 mt-2 p-2 bg-slate-400 rounded-xl mb-4 elevation-5`}>
              Zalogowano jako
            </Text>
          )}
          <View style={tw`w-full flex justify-center items-center rounded-xl`}>
            <View style={tw`flex items-center bg-main-100 p-4 rounded-3xl elevation-5 `}>
              <Image
                style={tw`h-30 md:h-34 aspect-square rounded-full border-4 border-black border-opacity-50`}
                source={{ uri: user?.user?.photo ?? imagePlaceholder }}
              />
              <Text style={tw`text-xl md:text-3xl text-center`}>{user?.user?.name}</Text>
            </View>
          </View>
          <View style={tw`h-28 md:h-34 my-2`}>
            <TileButton
              style={tw`mx-10`}
              label="Wyloguj"
              icon="door-open"
              onPress={logOut}></TileButton>
          </View>
        </>
      ) : (
        <View style={tw`flex items-center`}>
          <Text
            style={tw`p-6 rounded-lg text-3xl text-center font-bold underline bg-slate-400 elevation-5`}>
            Zaloguj się aby korzystać z funkcji internetowych
          </Text>
        </View>
      )}

      {!isLogged && (
        <View style={tw`h-28 md:h-34 mb-2`}>
          <TileButton
            style={tw`mx-10 mt-2`}
            label="Logowanie Google"
            icon="google"
            onPress={logIn}
          />
        </View>
      )}
      <View style={tw`h-28 md:h-34`}>
        <TileButton
          style={tw`md:h-44 mx-10`}
          label="Inne Ustawienia"
          icon="cog"
          onPress={() => navigation.navigate("Settings")}></TileButton>
      </View>
    </View>
  );
};

export default OptionsScreen;
