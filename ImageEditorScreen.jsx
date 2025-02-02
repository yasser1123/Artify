import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Text,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { cropImage, applyFilter, rotateImage } from "./imageUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import {
  Crop,
  RotateCcw,
  Image as ImageIcon,
  Save,
  Sliders,
  Sun,
  Contrast,
  CloudSnow,
  Droplet,
  Sunset,
  Coffee,
  Moon,
  ArrowLeft,
  Download,
  Undo,
  Redo,
} from "lucide-react-native";
import {
  Canvas,
  Image,
  useImage,
  Rect,
  useCanvasRef,
} from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window"); // Get screen dimensions
const imageWidth = width; // Width of the image as displayed
const imageHeight = height - 300; // Height of the image as displayed

const ImageEditorScreen = ({ navigation }) => {
  const route = useRoute();
  const imageUri = route?.params?.imageUri;
  const [editedImageUri, setEditedImageUri] = useState(
    useImage("../assets/LandingBg.jpg")
  );
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isCrop, setIsCrop] = useState(false);

  const editedImage = useImage(imageUri);

  const canvasRef = useCanvasRef();

  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,
    width: imageWidth,
    height: imageHeight,
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      setCropBox((prev) => {
        const newX = Math.max(
          0,
          Math.min(prev.x + gestureState.dx, imageWidth - prev.width)
        );
        const newY = Math.max(
          0,
          Math.min(prev.y + gestureState.dy, imageHeight - prev.height)
        );
        return { ...prev, x: newX, y: newY };
      });
    },
  });

  const resizePanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      setCropBox((prev) => {
        const newWidth = Math.max(
          50,
          Math.min(prev.width + gestureState.dx, imageWidth - prev.x)
        );
        const newHeight = Math.max(
          50,
          Math.min(prev.height + gestureState.dy, imageHeight - prev.y)
        );
        return { ...prev, width: newWidth, height: newHeight };
      });
    },
  });

  const tools = [
    {
      id: "crop",
      name: "Crop",
      icon: Crop,
      action: async () => {
        setIsCrop(true);
        // const croppedUri = await cropImage(editedImageUri);
        // setEditedImageUri(croppedUri);
      },
    },
    {
      id: "rotate",
      name: "Rotate",
      icon: RotateCcw,
      action: async () => {
        const rotatedUri = await rotateImage(editedImageUri, 90);
        setEditedImageUri(rotatedUri);
      },
    },
    {
      id: "original",
      name: "Original",
      icon: ImageIcon,
      action: () => setEditedImageUri(imageUri),
    },
    {
      id: "brightness",
      name: "Brightness",
      icon: Sun,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "brightness");
        setEditedImageUri(filteredUri);
      },
    },
    {
      id: "contrast",
      name: "Contrast",
      icon: Contrast,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "contrast");
        setEditedImageUri(filteredUri);
      },
    },
    {
      id: "grayscale",
      name: "Grayscale",
      icon: Sliders,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "grayscale");
        setEditedImageUri(filteredUri);
      },
    },
    {
      id: "sepia",
      name: "Sepia",
      icon: Coffee,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "sepia");
        setEditedImageUri(filteredUri);
      },
    },
    {
      id: "cool",
      name: "Cool",
      icon: CloudSnow,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "cool");
        setEditedImageUri(filteredUri);
      },
    },
    {
      id: "warm",
      name: "Warm",
      icon: Sunset,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "warm");
        setEditedImageUri(filteredUri);
      },
    },
    {
      id: "vintage",
      name: "Vintage",
      icon: Moon,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "vintage");
        setEditedImageUri(filteredUri);
      },
    },
    {
      id: "saturation",
      name: "Saturation",
      icon: Droplet,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, "saturate");
        setEditedImageUri(filteredUri);
      },
    },
  ];

  useEffect(() => {
    const requestPermission = async () => {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Gallery access is needed to save images."
        );
      }
    };
    requestPermission();
  }, []);

  const saveImage = async () => {
    if (!hasPermission) {
      Alert.alert(
        "Error",
        "You need to allow gallery access to save the image."
      );
      return;
    }

    try {
      await MediaLibrary.createAssetAsync(editedImageUri);
      Alert.alert("Success", "Image saved to your gallery!");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save the image.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" backgroundColor="#000000" />
      <View className="h-20 flex-row justify-between items-center px-5 bg-neutral-900 rounded-b-3xl">
        <ArrowLeft size="24" color="#fff" />
        <View className="flex-row gap-5 items-center">
          <Undo size="24" color="#fff" />
          <Redo size="24" color="#fff" />
          <Download size="24" color="#fff" />
        </View>
      </View>
      {editedImage ? (
        <>
          <View className="flex-1 justify-center items-center bg-black">
            <Canvas ref={canvasRef} style={{ width, height: height - 300 }}>
              <Image
                image={editedImage}
                x={0}
                y={0}
                width={imageWidth}
                height={imageHeight}
                fit="contain"
              />
              {isCrop && (
                <Rect
                  x={cropBox.x}
                  y={cropBox.y}
                  width={cropBox.width}
                  height={cropBox.height}
                  color="rgba(255, 255, 255, 0.3)"
                  strokeWidth={2}
                  stroke="white"
                />
              )}
            </Canvas>
          </View>
          {isCrop && (
            <>
              <View
                style={{
                  position: "absolute",
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.width,
                  height: cropBox.height,
                  borderColor: "white",
                  borderWidth: 2,
                }}
                {...panResponder.panHandlers}
              />
              <View
                style={{
                  position: "absolute",
                  right: imageWidth - cropBox.x - cropBox.width,
                  bottom: imageHeight - cropBox.y - cropBox.height,
                  width: 30,
                  height: 30,
                  backgroundColor: "white",
                }}
                {...resizePanResponder.panHandlers}
              />
            </>
          )}

          <View className="pt-2 pb-4 bg-neutral-900 rounded-t-xl">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-grow-0"
              contentContainerStyle=""
            >
              {tools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  className={`flex items-center w-24 justify-center py-5 p-3 mx-1 rounded-xl ${
                    selectedTool === tool.id ? "bg-primary" : ""
                  }`}
                  onPress={() => {
                    setSelectedTool(tool.id);
                    tool.action();
                  }}
                >
                  <tool.icon size={24} color="#ffffff" />
                  <Text
                    className={`mt-1 text-xs text-center 
                      text-white
                    `}
                  >
                    {tool.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      ) : (
        <Text className="text-lg text-gray-600 text-center">
          No image selected.
        </Text>
      )}
    </SafeAreaView>
  );
};

export default ImageEditorScreen;
