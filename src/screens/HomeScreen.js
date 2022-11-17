import React from 'react'
import { Text, View, Button } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import SquareButton from '../components/SquareButton'

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
        <View className="flex-row flex-wrap">

        <SquareButton label="Gotowe">
            <Icon name="check" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Przybliż">
            <Icon name="search-plus" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Oddal">
            <Icon name="search-minus" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Dodaj">
            <Icon name="plus" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Edytuj">
            <Icon name="edit" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Zapisz">
            <Icon name="save" size={40} color="black" className="flex-1" />
        </SquareButton>
        </View>
        <Button
            title="Go to map screen"
            onPress={() =>
                navigation.navigate('Map', { name: 'Jane' })
            }>
        </Button>

    </View>
)

export default HomeScreen
