import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { Button } from "react-native-elements";
import tw from "../lib/tailwind";
import { useUserStore } from "../stores/store";
import firestore from "@react-native-firebase/firestore";
import { db, DbUser, deleteQueryBatch, Pathes, RatingDocument } from "./../config/firebase";
import { firebase } from "@react-native-firebase/auth";
import auth from "@react-native-firebase/auth";
import { imagePlaceholder } from "../utils/HelperFunctions";
import TileButton from "../components/TileButton";

const OptionsScreen = ({ navigation, route }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(undefined as User | undefined);
  const [pathes, setPathes] = useState([]);

  useEffect(() => {
    console.log("navchange options");
    if (DbUser() === undefined) return;
    GoogleSignin.getCurrentUser().then((u) => {
      setUser(u);
    });
  }, [route.key]);

  const addPath = async () => {
    const data = {
      ownerId: DbUser(),
      description: "opis",
      name: "mapka",
      age: 12,
      rating: 0,
      ratingCount: 0,
      distance: 2137,
      visibility: "public",
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    console.log(data);
    Pathes.add(data);
  };
  const logPaths = async () => {
    const users = await Pathes.get();
    users.forEach((n) => console.log(n));
    return users;
  };

  const logIn = async () => {
    try {
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
    } catch (e) {
      console.log("err");
      console.log(e);
    }
  };

  async function logOut() {
    await firebase.auth().signOut();
    // console.log(DbUser());
    GoogleSignin.signOut();
    setIsLogged(false);
    // logOut();
  }
  return DbUser() !== undefined ? (
    <ScrollView style={tw`flex`} contentContainerStyle={""}>
      <View
        style={[
          tw`flex-0 flex flex-row bg-slate-200 mb-2 border-b-2 border-slate-500 justify-center elevation-5`,
          { alignItems: "center" },
        ]}>
        <Text style={tw`text-center text-slate-800 text-4xl mt-2 mb-2 ml-2 font-medium underline`}>
          OPCJE UŻYTKOWNIKA
        </Text>
      </View>

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

      <TileButton
        style={tw`mx-10 my-8`}
        label="Wyloguj"
        icon="door-open"
        onPress={logOut}></TileButton>
      <TileButton style={tw`mx-10 mb-8`} label="Inne Ustawienia" icon="cog"></TileButton>
    </ScrollView>
  ) : (
    <View style={tw`flex items-center`}>
      <Text style={tw`text-3xl p-10 pb-2`}>Opcje Użytkownika</Text>
      <Text style={tw`text-3xl pb-10`}>Zaloguj się aby korzystać z opcji</Text>
      {/* <Button
        title="Zaloguj"
        onPress={() => {
          navigation.navigate("LogIn");
        }}
      /> */}
      <TouchableOpacity
        style={tw`w-10/12 h-4/12 bg-red-100 flex items-center justify-center border-4 rounded-2xl`}
        onPress={() =>
          logIn()
            .then(() => {
              console.log("Signed in with Google!");
              setIsLogged(true);
            })
            .catch((err) => {
              console.log(err);
            })
        }>
        <Text style={tw`text-xl text-center p-6`}>Zaloguj się przez google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OptionsScreen;
