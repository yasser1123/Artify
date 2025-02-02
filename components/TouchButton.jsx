import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Correct import for Ionicons

const TouchButton = ({ text, icon, func }) => {
  return (
    <TouchableOpacity
      className="bg-primary py-2 px-6 rounded-lg flex-row items-center font-plight"
      onPress={func}
    >
      <Ionicons name={icon} size={24} color="white" />
      <Text className="text-secondary text-lg ml-2 font-pregular">{text}</Text>
      
    </TouchableOpacity>
  );
};

export default TouchButton;
