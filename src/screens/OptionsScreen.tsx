import { GoogleSignin, statusCodes, User } from "@react-native-google-signin/google-signin";
import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity, ToastAndroid } from "react-native";
import { Button } from "react-native-elements";
import tw from "../lib/tailwind";
import firestore from "@react-native-firebase/firestore";
import { db, DbUser, deleteQueryBatch, Pathes, RatingDocument } from "./../config/firebase";
import { firebase } from "@react-native-firebase/auth";
import auth from "@react-native-firebase/auth";
import { imagePlaceholder } from "../utils/HelperFunctions";
import TileButton from "../components/TileButton";
import HeaderBar from "../components/HeaderBar";

const OptionsScreen = ({ navigation, route }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(undefined as User | undefined);
  const [pathes, setPathes] = useState([]);

  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    console.log("navchange options");
    if (DbUser() === undefined) return;
    GoogleSignin.getCurrentUser().then((u) => {
      setUser(u);
      setIsLogged(true);
    });
  }, [route.key, DbUser()]);

  const logIn = async () => {
    try {
      setInactive(true);
      const elo = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      // Create a Google credential with the token
      const googleCredential = await auth.GoogleAuthProvider.credential(idToken);
      await GoogleSignin.clearCachedAccessToken(idToken);
      await GoogleSignin.getTokens();
      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);
      const usr = await GoogleSignin.getCurrentUser();
      setUser(usr);
      setIsLogged(true);
      setInactive(false);
      console.log("logged");
    } catch (e) {
      console.log("kecz");

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

  async function logOut() {
    setIsLogged(false);
    await firebase.auth().signOut();
    await GoogleSignin.signOut();
  }
  return (
    <View style={tw`flex`} pointerEvents={inactive ? "none" : "auto"}>
      <HeaderBar label={"OPCJE UŻYTKOWNIKA"} navigation={navigation} removeMargin />
      {isLogged ? (
        <>
          <Text
            style={tw`text-3xl text-center mx-16 mt-2 p-2 bg-slate-200 rounded-xl mb-4 elevation-5`}>
            Zalogowano jako
          </Text>
          <View style={tw`w-full flex justify-center items-center rounded-xl`}>
            <View style={tw`flex items-center bg-main-100 p-4 rounded-3xl elevation-5 `}>
              <Image
                style={tw`h-40 aspect-square rounded-full border-4 border-black border-opacity-50`}
                source={{ uri: user?.user?.photo ?? imagePlaceholder }}
              />
              <Text style={tw`text-3xl text-center`}>{user?.user?.name}</Text>
            </View>
          </View>
          <View style={tw`h-40`}>
            <TileButton
              style={tw`mx-10 my-4`}
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
          <View style={tw`flex h-44 w-78`}>
            <TileButton style={tw`my-4`} label="Logowanie Google" icon="google" onPress={logIn} />
          </View>
        </View>
      )}
      <View style={tw`h-40`}>
        <TileButton
          style={tw`mx-10 mb-4`}
          label="Inne Ustawienia"
          icon="cog"
          onPress={() => navigation.navigate("Settings")}></TileButton>
      </View>
    </View>
  );
};

export default OptionsScreen;
