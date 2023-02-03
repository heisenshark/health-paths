import * as React from "react";
import { useState } from "react";
import { View, Text } from "react-native";
import Modal from "react-native-modal/dist/modal";
import { Title } from "react-native-paper";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

/**
 * @property {boolean} visible Czy modal jest widoczny
 * @property {string} label Tekst wyświetlany w nagłówku modala
 * @property {boolean} hideCancel Czy ukryć przycisk anuluj
 * @property {string[]} titles etykiety wyświetlane na przyciskach
 * @property {string[]} buttonIcons Ikony wyświetlane na przyciskach
 * @property {function} actionLeft Funkcja wywoływana po naciśnięciu lewego przycisku
 * @property {function} actionRight Funkcja wywoływana po naciśnięciu prawego przycisku
 * @property {function} onRequestClose Funkcja wywoływana w celu zamknięcia modala
 * @interface ModalChoiceProps
 */
interface ModalChoiceProps {
  visible: boolean;
  label: string;
  hideCancel?: boolean;
  titles: string[];
  buttonIcons?: string[];
  actionLeft: () => void;
  actionRight: () => void;
  onRequestClose: () => void;
}
/**
 * Modal z dwoma przyciskami, wykorzystywany do wyboru opcji.
 * @export
 * @param {ModalChoiceProps} {
 *   visible,
 *   label,
 *   hideCancel,
 *   titles,
 *   buttonIcons,
 *   actionLeft,
 *   actionRight,
 *   onRequestClose,
 * }
 * @component
 */
export function ModalChoice({
  visible,
  label,
  hideCancel,
  titles,
  buttonIcons,
  actionLeft,
  actionRight,
  onRequestClose,
}: ModalChoiceProps) {
  const useIcons = buttonIcons && buttonIcons.length >= 2;
  return (
    <Modal
      isVisible={visible}
      testID={"modal"}
      swipeThreshold={100}
      animationIn={"zoomIn"}
      animationOut={"zoomOut"}
      style={tw`flex flex-1 justify-center items-center m-0 `}
      backdropOpacity={0.5}>
      <View style={tw` bg-slate-100 elevation-5 mx-10 p-4`}>
        <Text style={tw`text-center text-2xl md:text-3xl font-bold py-3`}>{label}</Text>
        <View style={tw`flex flex-row w-full justify-evenly mb-4`}>
          <SquareButton
            style={tw`mx-4`}
            size={30}
            label={titles[0]}
            icon={useIcons && buttonIcons[0]}
            onPress={actionLeft}></SquareButton>
          <SquareButton
            style={tw`mr-4`}
            label={titles[1]}
            icon={useIcons && buttonIcons[1]}
            size={30}
            onPress={actionRight}></SquareButton>
        </View>
        {!hideCancel && (
          <View style={tw`w-full p-4 pt-0 flex flex-row justify-center items-center`}>
            <SquareButton
              label={"Anuluj"}
              size={20}
              onPress={onRequestClose}
              icon="arrow-left"></SquareButton>
          </View>
        )}
      </View>
    </Modal>
  );
}
/**
 * Typ zwrotny hooka do wyświetlania modala z dwoma przyciskami
 */
type useAlertModalType = [
  ModalChoiceProps,
  (
    label: string,
    args: {
      text: string;
      icon?: string;
      onPress?: () => any;
    }[],
    hideCancel?: boolean
  ) => void,
  (ModalChoiceProps) => void
];

/**
 * Hook do wyświetlania modala z dwoma przyciskami
 */
export function useAlertModal(): useAlertModalType {
  const [state, setState] = useState<ModalChoiceProps>({
    visible: false,
    label: "Modal",
    titles: ["", ""],
    buttonIcons: [],
    hideCancel: false,
    actionLeft: () => {},
    actionRight: () => {},
    onRequestClose: () => {},
  });

  function alert(
    label: string,
    args: {
      text: string;
      icon?: string;
      onPress?: () => any;
    }[],
    hideCancel: boolean = false
  ) {
    let newState = {
      visible: true,
      label: label,
      titles: [args[0].text, args[1].text],
      hideCancel: hideCancel,
      buttonIcons: [args[0].icon, args[1].icon],
    } as ModalChoiceProps;
    newState = {
      ...newState,
      actionLeft: () => {
        setState({ ...newState, visible: false });
        args[0].onPress && args[0].onPress();
      },
      actionRight: () => {
        setState({ ...newState, visible: false });
        args[1].onPress && args[1].onPress();
      },
      onRequestClose: () => setState({ ...newState, visible: false }),
    } as ModalChoiceProps;
    setState(newState);
  }

  return [state, alert, setState];
}
