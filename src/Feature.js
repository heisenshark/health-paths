import React, { useState } from 'react'
import { Text, View, Button } from 'react-native'
import { Colors, TextInput } from 'react-native-paper'
import { RoundedButton } from './components/RoundedButton'
const Feature = ({
    addSubject
}) => {
    const arr = [1, 2, 3, 4]

    const [focusThing, setFocusThing] = useState('')

    return <View className="border-red-200  flex-1 justify-start items-center border-2">

        <View className=" flex-row justify-center items-center w-full border-2 pt-7">
            <TextInput className="bg-slate-100 my-4 w-2/3" label={'What would you like to focus on?'} onChangeText={(val) => { setFocusThing(val) }}></TextInput>
            <RoundedButton title="+" size={20} onPress={()=>addSubject(focusThing)}>AAA</RoundedButton>

        </View>
        <View className="flex-row justify-center items-center mt-2">
            <RoundedButton title="5">AAA</RoundedButton>
            <RoundedButton title="10">AAA</RoundedButton>
            <RoundedButton title="20">AAA</RoundedButton>
        </View>
    </View>
}

export default Feature
