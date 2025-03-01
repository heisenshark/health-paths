import * as React from "react";
import { Text, View } from "react-native";
import Modal from "react-native-modal/dist/modal";
import { TouchableRipple } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "../lib/tailwind";

/**
 * @property {string} label etykieta
 * @property {string} icon nazwa ikony
 * @property {function} onPress funkcja wywoływana po naciśnięciu
 * @property {boolean} disabled czy opcja jest wyłączona
 * @interface ModalOption
 */
interface ModalOption {
  label: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * @property {boolean} visible
 * @property {string} label
 * @property {Array<ModalOption>} actions
 * @property {function} onRequestClose
 * @interface OptionsModalProps
 */
interface OptionsModalProps {
  visible: boolean;
  label?: string;
  actions: ModalOption[];
  onRequestClose: () => void | Promise<void>;
}
/**
 * Komponent wyświetlający modal z listą opcji
 * @param {OptionsModalProps} { onRequestClose, actions, visible, label }
 * @component
 */
const OptionsModal = ({ onRequestClose, actions, visible, label }: OptionsModalProps) => {
  return (
    <Modal
      style={tw`w-full m-0 flex-1 justify-end flex-col`}
      animationIn={"slideInUp"}
      animationOut={"slideOutDown"}
      isVisible={visible}
      swipeDirection={["down"]}
      swipeThreshold={100}
      onBackdropPress={onRequestClose}
      onSwipeComplete={onRequestClose}
      onBackButtonPress={onRequestClose}>
      <View style={tw`bg-slate-100 border-slate-300 w-full`}>
        <View style={tw`bg-white w-full`}>
          <View style={tw`h-1  bg-gray-300 rounded-full`}></View>
          <View style={tw`flex flex-row items-center w-full h-12`}>
            <Text style={tw`text-gray-700 text-2xl mx-4 font-bold`}>{label}</Text>
          </View>
          <View style={tw`h-[0.5] bg-gray-300 rounded-full`}></View>
          {actions.map((action, index) => {
            if (action.disabled === true) return null;
            return (
              <View key={index}>
                <TouchableRipple
                  key={index}
                  style={tw`bg-white h-20`}
                  onPress={() => {
                    action.onPress();
                    onRequestClose();
                  }}
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
      </View>
    </Modal>
  );
};

export default OptionsModal;
