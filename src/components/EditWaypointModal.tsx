import { View, Text } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

type Props = {
  visible: boolean;
  onMove: () => void;
  onDelete: () => void;
  hide: () => void;
};

const EditWaypointModal = ({ visible, hide, onDelete, onMove }: Props) => {
  if (!visible) return null; //tak, to jest potrzebne, inaczej laguje cały ekran
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
          <Text style={tw`text-3xl p-5 text-center font-bold`}>Edytuj Punkt:</Text>
          <View style={tw`mx-5 mb-6 flex flex-row justify-around`}>
            <SquareButton
              style={tw`mx-2 border-black`}
              size={30}
              label="Usuń"
              icon="trash"
              onPress={() => {
                onDelete();
                hide();
              }}></SquareButton>

            <SquareButton
              style={tw`mx-2`}
              size={30}
              icon="edit"
              label="przenieś"
              onPress={() => {
                onMove();
                hide();
              }}></SquareButton>

            <SquareButton
              style={tw`mx-2`}
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

export default EditWaypointModal;
