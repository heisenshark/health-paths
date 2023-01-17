import { View, Text } from "react-native";
import * as React from "react";
import Modal from "react-native-modal";
import tw from "../lib/tailwind";
type Props = {};

const StopPointPopUp = (props: Props) => {
  return (
    <View>
      <Modal isVisible={true}
              testID={'modal'}
              onSwipeComplete={() => {console.log('swipe')}}
              swipeDirection={['up', 'left', 'right', 'down']}
              onBackdropPress={() => {console.log('backdrop')}}
      >
        <View style={tw`flex-1 bg-red-400 justify-end m-0 w-full`}>
          <Text style={tw`text-3xl`}>StopPointPopUp</Text>
        </View>
      </Modal>
    </View>
  );
};

export default StopPointPopUp;
