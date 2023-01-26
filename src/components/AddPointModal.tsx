import { View, Text } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

type Props = {
  visible: boolean;
  isRecordingMode: boolean;
  onWaypointAdd: (position: number) => void;
  onStopPointAdd: () => void;
  hide: () => void;
  waypointsLength: number;
};

const AddPointModal = ({
  visible,
  isRecordingMode,
  onWaypointAdd: onWaypointEdit,
  onStopPointAdd: onStopPointEdit,
  hide,
  waypointsLength,
}: Props) => {
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
                  onWaypointEdit(0);
                  hide();
                }}></SquareButton>
              {waypointsLength >= 2 && (
                <SquareButton
                  style={tw`mx-2 `}
                  size={25}
                  icon="edit"
                  label="Jako punkt Trasy"
                  onPress={() => {
                    onWaypointEdit(1);
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
                    onWaypointEdit(waypointsLength);
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
                onStopPointEdit();
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
