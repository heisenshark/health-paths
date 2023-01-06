import * as React from "react";
import { Text, View, StyleSheet, Modal } from "react-native";
import { TouchableRipple } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "../lib/tailwind";

interface OptionsModalProps {
  visible: boolean;
  label?: string;
  actions: { label: string; icon?: string; onPress: () => void }[];
  onRequestClose: () => void | Promise<void>;
}

//TODO przejżeć dokumentację react-native-vector-icons i zrobić lepszy build czy coś xD

const OptionsModal = ({ onRequestClose, actions, visible, label }: OptionsModalProps) => {
  return (
    <Modal
      animationType={"fade"}
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={tw`bg-transparent w-full h-full flex flex-col-reverse`}>
        <View style={tw`bg-white w-full`}>
          <View style={tw`h-[1]  bg-gray-300 rounded-full`}></View>
          <View style={tw`flex flex-row items-center w-full h-12`}>
            <Text style={tw`text-gray-700 text-3xl mx-4`}>{label}</Text>
          </View>

          <View style={tw`h-[0.5] bg-gray-300 rounded-full`}></View>

          {actions.map((action, index) => {
            return (
              <View key={index}>
                <TouchableRipple
                  key={index}
                  style={tw`bg-white h-20`}
                  onPress={() => action.onPress()}
                  rippleColor="rgba(0, 0, 0, .32)">
                  <View style={tw`flex flex-row items-center w-full h-full`}>
                    {action.icon !== undefined && (
                      <Icon style={tw`w-16 ml-4`} name={action.icon} size={50} color={"#333"} />
                    )}
                    <Text style={tw`text-gray-700 text-3xl`}>{action.label}</Text>
                  </View>
                </TouchableRipple>
                <View style={tw`h-[0.5] mx-10 bg-gray-300 rounded-full`}></View>
              </View>
            );
          })}
        </View>

        <View
          style={tw`flex-1 bg-black bg-opacity-50`}
          onStartShouldSetResponder={() => {
            onRequestClose();
            return true;
          }}
        />
      </View>
    </Modal>
  );
};

export default OptionsModal;
