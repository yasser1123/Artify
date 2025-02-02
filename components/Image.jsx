import React from "react";
import { Image, View, StyleSheet } from "react-native";

const ImageView = ({ editedImageUri, width, height }) => {
  if (!editedImageUri) {
    return null;
  }

  return (
    <View style={{ width, height }} className="justify-center items-center">
      <Image
        source={{ uri: editedImageUri }}
        style={{ width, height }}
        className="rounded-lg"
        resizeMode="contain"
      />
    </View>
  );
};

export default ImageView;
