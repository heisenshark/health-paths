import { View, Text } from "react-native";
import * as React from "react";
import Modal from "react-native-modal";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";
import { Waypoint } from "../utils/interfaces";
type Props = {
  visible: boolean;
  stopPoint: Waypoint;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
  hide: () => void;
};

const StopPointPopUp = ({ visible, onEdit, onDelete, onMove, hide }: Props) => {
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
        style={tw`flex-1 justify-end m-0`}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating={false}>
        <View style={tw`bg-white border-t-4 border-slate-400`}>
          <Text style={tw`text-3xl p-5 text-center font-bold`}>Punkt Stopu</Text>
          <View style={tw`mx-5 mb-6 flex flex-row justify-around`}>
            <SquareButton
              style={tw`mx-2 border-black `}
              size={25}
              label="Usuń"
              icon="trash"
              onPress={() => {
                hide();
                onDelete();
              }}></SquareButton>
            <SquareButton
              style={tw`mx-2 `}
              size={25}
              icon="edit"
              label="Edytuj"
              onPress={() => {
                onEdit();
                hide();
              }}></SquareButton>
            <SquareButton
              style={tw`mx-2 `}
              size={25}
              icon="map-pin"
              label="Przenieś"
              onPress={() => {
                onMove();
                hide();
              }}></SquareButton>
          </View>
          <View style={tw`mx-5 mb-6 flex flex-row justify-around`}>
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

export default StopPointPopUp;
