import { View, Text } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

/**
 * @property {boolean} visible czy modal jest widoczny
 * @property {boolean} isRecordingMode czy mapa jest w trybie nagrywania
 * @property {number} waypointsLength ilość punktów trasy
 * @property {function(number)} onWaypointAdd funkcja wywoływana po dodaniu punktu trasy
 * @property {function} onStopPointAdd funkcja wywoływana po dodaniu punktu stopu
 * @property {function} hide funkcja wywoływana po ukryciu modala
 * @interface AddPointModalProps
 */
interface AddPointModalProps {
  visible: boolean;
  isRecordingMode: boolean;
  waypointsLength: number;
  onWaypointAdd: (position: number) => void;
  onStopPointAdd: () => void;
  hide: () => void;
}

/**
 * Modal odpowiadający za dodawanie punktów, opcje które oferuje zależą
 * od ilości punktów trasy oraz tego czy mapa jest w trybie edycji
 * @param {AddPointModalProps}
 * @component
 */
const AddPointModal = ({
  visible,
  isRecordingMode,
  waypointsLength,
  onWaypointAdd,
  onStopPointAdd,
  hide,
}: AddPointModalProps) => {
  if (!visible) return null;
  return (
    <View>
      <Modal
        isVisible={visible}
        testID={"modal"}
        onSwipeComplete={hide}
        onBackdropPress={hide}
        swipeThreshold={100}
        swipeDirection={["down"]}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
        style={tw`flex-1 justify-end m-0`}
        backdropOpacity={0.1}
        onBackButtonPress={hide}>
        <View style={tw`bg-white border-t-4 border-slate-400`}>
          <Text style={tw`text-3xl p-5 text-center font-bold`}>Dodaj punkt:</Text>
          {!isRecordingMode && (
            <View style={tw`mx-5 mb-6 flex flex-row justify-around`}>
              <SquareButton
                style={tw`mx-2 `}
                size={25}
                icon="edit"
                label="Na początek"
                onPress={() => {
                  onWaypointAdd(0);
                  hide();
                }}></SquareButton>
              {waypointsLength >= 2 && (
                <SquareButton
                  style={tw`mx-2 `}
                  size={25}
                  icon="edit"
                  label="Jako punkt Trasy"
                  onPress={() => {
                    onWaypointAdd(1);
                    hide();
                  }}></SquareButton>
              )}
              {waypointsLength >= 1 && (
                <SquareButton
                  style={tw`mx-2 `}
                  size={25}
                  icon="edit"
                  label="Na koniec"
                  onPress={() => {
                    onWaypointAdd(waypointsLength);
                    hide();
                  }}></SquareButton>
              )}
            </View>
          )}
          <View style={tw`mx-5 mb-6 flex flex-row justify-around`}>
            <SquareButton
              style={tw`mx-2 border-black `}
              size={25}
              label="Jako Punkt Stopu"
              icon="edit"
              onPress={() => {
                onStopPointAdd();
                hide();
              }}></SquareButton>

            <SquareButton
              style={tw`mx-2 `}
              size={25}
              icon="arrow-left"
              label="Wróć"
              onPress={hide}></SquareButton>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddPointModal;
