import * as ImageManipulator from "expo-image-manipulator";

export const cropImage = async (uri, options = {}) => {
  const { compress = 1, format = ImageManipulator.SaveFormat.JPEG } = options;

  try {
    const { width, height } = await getImageSize(uri);
    const size = Math.min(width, height);

    // Calculate origin points to crop from the center
    const originX = (width - size) / 2;
    const originY = (height - size) / 2;

    const croppedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: { originX, originY, width: size, height: size } }],
      { compress, format }
    );

    return croppedImage.uri;
  } catch (error) {
    console.error("Error cropping image:", error);
    return uri; // Return original image URI in case of an error
  }
};

export const applyFilter = async (uri, filter) => {
  try {
    let actions = [];

    if (filter === "sepia") {
      actions.push({ adjust: { contrast: 1.1, brightness: 0.2 } });
    } else if (filter === "grayscale") {
      actions.push({ adjust: { contrast: 0.8, brightness: -0.1 } });
    }

    const filteredImage = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    console.log(`Filtered image URI: ${filteredImage.uri}`);
    return filteredImage.uri;
  } catch (error) {
    console.error("Filter error:", error);
    return uri;
  }
};

export const rotateImage = async (uri, angle) => {
  try {
    const rotatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: angle }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    return rotatedImage.uri;
  } catch (error) {
    console.error("Rotation error:", error);
    return uri;
  }
};

const getImageSize = async (uri) => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};
