import * as React from "react";
import { Alert, Text, View } from "react-native";
import tw from "../lib/tailwind";

import { makeRedirectUri, startAsync } from "expo-auth-session";
import { useEffect, useState } from "react";
import { Input, Button } from "react-native-elements";

import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useUserStore } from "./../stores/store";

const LogInScreen = ({ navigation }) => {
  const [logIn, logOut, user, checkUser] = useUserStore((state) => [
    state.logIn,
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

  async function signInWithGoogle() {}

  GoogleSignin.configure({
    webClientId: "***REMOVED***-hnrvujupc8dlvnkro5nslrobk7m2bdbk.apps.googleusercontent.com",
  });

  function GoogleSignIn() {
    return (
      <Button
        title="Google Sign-In"
        onPress={() =>
          logIn()
            .then(() => {
              console.log("Signed in with Google!");
            })
            .catch((err) => {
              console.log(err);
            })
        }
      />
    );
  }
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    console.log(idToken);

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  return (
    <View style={tw`flex flex-col h-full justify-around`}>
      <View>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
      <View>
        <Button title="Sign up" onPress={() => signInWithGoogle()} />
        <Button
          title="Sign outta there "
          onPress={() => {
            logOut();
          }}
        />
        {GoogleSignIn()}
        {user && <Text>Logged in as {user.user.name}</Text>}
      </View>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default LogInScreen;
