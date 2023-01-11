/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import tw from "../lib/tailwind";

import { makeRedirectUri, startAsync } from "expo-auth-session";
import { useEffect, useState } from "react";
import { Input, Button } from "react-native-elements";

import auth from "@react-native-firebase/auth";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useUserStore } from "./../stores/store";
import { DbUser } from "./../config/firebase";
import SquareButton from "../components/SquareButton";

const LogInScreen = ({ navigation }) => {
  const [logOut, user, checkUser] = useUserStore((state) => [
    state.logOut,
    state.user,
    state.checkLogged,
  ]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    checkUser().then((res) => {
      setIsLogged(res);
    });
  }, []);
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
    } catch (e) {
      console.log("err");
      console.log(e);
    }
  };

  return (
    <View style={tw`flex flex-col h-full items-center justify-around`}>
      {DbUser() && <Text>Zalogowano</Text>}
      <TouchableOpacity
        style={tw`w-10/12 h-2/12 bg-red-100 flex items-center justify-center border-4 rounded-2xl`}
        onPress={() =>
          logIn()
            .then(() => {
              console.log("Signed in with Google!");
              navigation.goBack();
            })
            .catch((err) => {
              console.log(err);
            })
        }>
        <Text style={tw`text-xl text-center p-6`}>Zaloguj się przez google</Text>
      </TouchableOpacity>
      <Button title="Wróć" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default LogInScreen;
