import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const SquareButton = ({
    params,
    children,
    label,
    onPress
}) => (
    <TouchableOpacity
        className="w-20 h-20 aspect-square flex items-center justify-center rounded-2xl border-4 "
        style={{ backgroundColor: "#FFFF00" }}
        onPress={() => { onPress && onPress() }}>
        <View>
            {children}
        </View>
        <Text numberOfLines={1} className="text-base py-0 leading-4 underline font-black">{label}</Text>
    </TouchableOpacity>
)

export default SquareButton
