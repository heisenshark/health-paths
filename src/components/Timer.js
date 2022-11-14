import React, { useState } from 'react'
import { Text, View } from 'react-native'
import { Colors, ProgressBar } from 'react-native-paper'
import { Countdown } from './CountDown'
import { RoundedButton } from './RoundedButton'
const Timer = ({
    params,
    focusSubject,
    onTimerEnd,
    clearSubject
}) => {
    const [isStarted, setIsStarted] = useState(false)

    return (
        <View className="flex-[1_1_100%] mt-20 items-center justify-start flex-col">
            <Countdown isPaused={!isStarted} onProgress={() => { }} onEnd={() => { onTimerEnd() }}></Countdown>
            <Text className="text-xl font-black"> Currently focusing on:</Text>
            <Text>{focusSubject}</Text>
            <View className="pt-10 px-2 flex-1 w-full">
                <ProgressBar className="h-10 w-full" progress={0.5} color={Colors.amber900}>

                </ProgressBar>
            </View>
            
            <View className="flex-row mt-auto mb-20">
                {!isStarted && <RoundedButton title="start" size="24" onPress={() => { setIsStarted(true) }} />}
                {isStarted && <RoundedButton title="paus" size="24" onPress={() => { setIsStarted(false) }} />}
            </View>
        </View>
    )
}

export default Timer
