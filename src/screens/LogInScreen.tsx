import * as React from "react";
import { Alert, Text, View } from "react-native";
import tw from "../lib/tailwind";

import { makeRedirectUri, startAsync } from "expo-auth-session";
import { useState } from "react";
import { Input, Button } from "react-native-elements";
const LogInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {}

  return (
    <View>
      <View>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View>
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
      </View>
    </View>
  );
};

export default LogInScreen;
