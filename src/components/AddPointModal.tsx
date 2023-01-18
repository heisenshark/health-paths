import { View, Text } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

type Props = {
  visible: boolean;
  onWaypointEdit: (position: number) => void;
  onStopPointEdit: () => void;
  hide: () => void;
  waypointsLength: number;
};

const AddPointModal = ({
  visible,
  onWaypointEdit,
  onStopPointEdit,
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
        swipeThreshold={100}
        swipeDirection={["down"]}
        onBackdropPress={hide}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
        style={tw`flex-1 justify-end m-0`}>
        <View style={tw`bg-white border-t-4 border-slate-400`}>
          <Text style={tw`text-3xl p-5 text-center font-bold`}>Dodaj punkt:</Text>
          <View style={tw`mx-5 mb-6 flex flex-row justify-around`}>
            <SquareButton
              style={tw`mx-2 border-[2]`}
              size={30}
              icon="edit"
              label="Na początek"
              onPress={() => {
                onWaypointEdit(0);
                hide();
              }}></SquareButton>
            {waypointsLength >= 2 && (
              <SquareButton
                style={tw`mx-2 border-[2]`}
                size={30}
                icon="edit"
                label="Jako punkt Trasy"
                onPress={() => {
                  onWaypointEdit(1);
                  hide();
                }}></SquareButton>
            )}
            {waypointsLength >= 1 && (
              <SquareButton
                style={tw`mx-2 border-[2]`}
                size={30}
                icon="edit"
                label="Na koniec"
                onPress={() => {
                  onWaypointEdit(waypointsLength);
                  hide();
                }}></SquareButton>
            )}
          </View>
          <View style={tw`mx-5 mb-6 flex flex-row justify-around`}>
            <SquareButton
              style={tw`mx-2 border-black border-[2]`}
              size={30}
              label="Jako Punkt Stopu"
              icon="edit"
              onPress={() => {
                onStopPointEdit();
                hide();
              }}></SquareButton>

            <SquareButton
              style={tw`mx-2 border-[2]`}
              size={30}
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
