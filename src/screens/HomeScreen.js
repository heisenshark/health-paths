import React from 'react'
import { Text, View, Button } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({
    navigation
}) => (
    <View>
        <Text className="bg-red-300">HomeScreen</Text>
        <Text className="bg-yellow-300">HomeScreen</Text>
        <Text className="bg-green-300">HomeScreen</Text>
        <Text>HomeScreen</Text>
        <Text>HomeScreen</Text>
        <Text>HomeScreen</Text>
        <Icon name="rocket" size={30} color="#900" />

        <Button
            title="Go to map screen"
            onPress={() =>
                navigation.navigate('Map', { name: 'Jane' })
            }
        />

    </View>
)

export default HomeScreen
