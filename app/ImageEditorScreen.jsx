import React, { useState, useEffect, useRef } from "react";
import Slider from "@react-native-community/slider";
import ImageView from "../components/Image";
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";
import WebView from "react-native-webview";
import * as MediaLibrary from "expo-media-library";
import { cropImage, applyFilter, rotateImage } from "./imageUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  Download,
  Undo,
  Redo,
  RotateCcw,
  Image as ImageIcon,
  Save,
  Sun,
  Contrast,
  Droplet,
  Filter,
  Circle,
  Radar,
  Grip,
} from "lucide-react-native";
import { useImage } from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { applyImageTransformations } from "./imageMunipulation";

const { width, height } = Dimensions.get("window");
const imageWidth = width;
const imageHeight = height - 400;

const ImageEditorScreen = ({}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const imageUri = route?.params?.imageUri;
  const webviewRef = useRef(null);

  const [editedImageUri, setEditedImageUri] = useState(imageUri);
  const [hasPermission, setHasPermission] = useState(false);
  const editedImage = useImage(editedImageUri);

  const [selectedTool, setSelectedTool] = useState(null);
  const [brightnessValue, setBrightnessValue] = useState(1);
  const [contrastValue, setContrastValue] = useState(1);
  const [saturationValue, setSaturationValue] = useState(1);
  const [sharpnessValue, setSharpnessValue] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [thresholdValue, setThresholdValue] = useState(254);
  const [intensityValue, setIntensityValue] = useState(1.6);
  const [blurValue, setBlurValue] = useState(254);
  const [rotateValue, setRotateValue] = useState(0);
  const [isBrightnessVisible, setIsBrightnessVisible] = useState();
  const [isContrastVisible, setIsContrastVisible] = useState();
  const [isSaturationVisible, setIsSaturationVisible] = useState();
  const [isSharpnessVisible, setIsSharpnessVisible] = useState();
  const [thresholdVisible, setThresholdVisible] = useState(false);
  const [intensityVisible, setIntensityVisible] = useState(false);
  const [selectedBlurTool, setSelectedBlurTool] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [newUri, setNewUri] = useState(false);
  const [lastUri, setLastUri] = useState("");
  queue = [];

  useEffect(() => {
    if (lastUri !== editedImageUri) {
      setNewUri(true);
      setLastUri(editedImageUri);
    }
  }, [editedImageUri]);

  const filters = [
    { id: "grayscale", name: "Grayscale" },
    { id: "sepia", name: "Sepia" },
    { id: "cool", name: "Cool" },
    { id: "warm", name: "Warm" },
    { id: "vintage", name: "Vintage" },
  ];
  const BlurTools = [
    { id: "Gaussian", name: "Gaussian" },
    { id: "Bilateral", name: "Bilateral" },
  ];

  const tools = [
    {
      id: "brightness",
      name: "Brightness",
      icon: Sun,
      action: () => handleToolSelect("brightness"),
    },
    {
      id: "contrast",
      name: "Contrast",
      icon: Contrast,
      action: () => handleToolSelect("contrast"),
    },
    {
      id: "saturation",
      name: "Saturation",
      icon: Droplet,
      action: () => handleToolSelect("saturation"),
    },
    {
      id: "sharpness",
      name: "Sharpness",
      icon: Droplet,
      action: () => handleToolSelect("sharpness"),
    },
    {
      id: "filters",
      name: "Filters",
      icon: Filter,
      action: () => handleToolSelect("filters"),
    },
    {
      id: "Intensitytransformation",
      name: "Intensity",
      icon: Circle,
      action: () => handleTransformation("intensity"),
    },
    // {
    //   id: "Histogram equalization",
    //   name: "Histogram",
    //   icon: SwitchCamera,
    //   action: () => handleToolSelect("Histogram equalization"),
    // },
    {
      id: "Threshold",
      name: "Threshold",
      icon: Radar,
      action: () => handleTransformation("threshold"),
    },
    {
      id: "Blur",
      name: "Blur",
      icon: Grip,
      action: () => handleToolSelect("Blur"),
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
  ];

  const handleAdjustment = async () => {
    const adjustedUri = await applyFilter(
      imageUri,
      "adjust",
      brightnessValue,
      contrastValue,
      saturationValue,
      sharpnessValue
    );
    setEditedImageUri(adjustedUri);
  };

  const handleFilterClick = (filter) => {
    if (selectedFilter === filter) {
      // Deselect the filter if already selected
      setSelectedFilter(null);
    } else {
      // Select the new filter
      setSelectedFilter(filter);
    }
  };

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

  const handleToolSelect = (toolId) => {
    if (selectedTool === toolId) {
      setSelectedTool(null);
      setIsBrightnessVisible(false);
      setIsContrastVisible(false);
      setIsSaturationVisible(false);
      setShowFilters(false);
      setIntensityVisible(null);
      setThresholdVisible(false);
    } else {
      setSelectedTool(toolId);
      setIsBrightnessVisible(toolId === "brightness");
      setIsContrastVisible(toolId === "contrast");
      setIsSaturationVisible(toolId === "saturation");
      setIsSharpnessVisible(toolId === "sharpness");
      setShowFilters(toolId === "filters");
      setIntensityVisible(toolId === "Intensitytransformation");
      setThresholdVisible(toolId === "Threshold");
    }
  };

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
  const handleTransformation = async (name) => {
    queue.push(name);
    const result = await applyImageTransformations(
      editedImageUri,
      brightnessValue,
      contrastValue,
      saturationValue,
      sharpnessValue,
      filterType,
      thresholdValue,
      intensityValue,
      blurValue,
      rotateValue,
      queue
    );
    setNewUri(false);
    webviewRef.current.injectJavaScript(result);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" backgroundColor="#000000" />
      <View className="h-20 flex-row justify-between items-center px-5 bg-neutral-900 rounded-b-3xl">
        <TouchableOpacity onPress={() => navigation.navigate("index")}>
          <ArrowLeft size="24" color="#fff" />
        </TouchableOpacity>

        <View className="flex-row gap-5 items-center">
          <Undo size="24" color="#fff" />
          <Redo size="24" color="#fff" />

          <TouchableOpacity onPress={saveImage}>
            <Download size="24" color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 justify-center items-center bg-black">
        {editedImage ? (
          <ImageView
            editedImageUri={editedImageUri}
            width={imageWidth}
            height={imageHeight}
          />
        ) : (
          <Text className="text-lg text-gray-600 text-center">
            No image selected.
          </Text>
        )}
      </View>

      <View className=" bg-neutral-900">
        {isBrightnessVisible && (
          <View className="px-5 pb-4">
            <Text className="text-white text-center mb-2">Brightness</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={-100}
              maximumValue={100}
              step={1}
              value={brightnessValue}
              onValueChange={(value) => {
                setBrightnessValue(value);
              }}
              onSlidingComplete={async (value) => {
                setBrightnessValue(value);

                handleAdjustment("brightness");
                handleTransformation("contrastAndBrightness");
              }}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#0000FF"
            />
            <Text className="text-white text-center mt-2">
              Value: {brightnessValue}
            </Text>
          </View>
        )}

        {isContrastVisible && (
          <View className="px-5 pb-4">
            <Text className="text-white text-center mb-2">Contrast</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1} // Minimum value for contrast, cannot go lower than 1
              maximumValue={2} // Maximum contrast level
              step={0.2} // Step of 1 for smooth adjustment
              value={contrastValue} // Controlled value based on the state
              onValueChange={(value) => {
                console.log("Contrast Value on Change:", value); // Log current contrast value
                setContrastValue(value); // Update the contrast value
              }}
              onSlidingComplete={async (value) => {
                if (typeof value !== "number" || isNaN(value)) {
                  console.error("Invalid contrast value:", value);
                  return;
                }
                setContrastValue(value);
                console.log("Contrast Value:", value); // Check the value here
                handleTransformation("contrastAndBrightness");
              }}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#0000FF"
            />

            <Text className="text-white text-center mt-2">
              Value: {contrastValue}
            </Text>
          </View>
        )}

        {isSaturationVisible && (
          <View className="px-5 pb-4">
            <Text className="text-white text-center mb-2">Saturation</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0.1}
              maximumValue={2}
              step={0.1}
              value={saturationValue}
              onValueChange={(value) => {
                console.log("saturation Value: ", value); // Log value to ensure it's a number
                setSaturationValue(value);
              }}
              onSlidingComplete={async (value) => {
                if (typeof value !== "number") {
                  console.error("Invalid saturation value:", value);
                  return;
                }

                setIsSaturationVisible(value);
                handleTransformation("saturation");
              }}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#0000FF"
            />

            <Text className="text-white text-center mt-2">
              Value: {saturationValue}
            </Text>
          </View>
        )}

        {isSharpnessVisible && (
          <View className="px-5 pb-4">
            <Text className="text-white text-center mb-2">Sharpness</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={2}
              step={0.1}
              saturation
              value={sharpnessValue}
              onValueChange={(value) => {
                // You can still update the value dynamically, but don't call the async function yet.
                setSharpnessValue(value);
              }}
              onSlidingComplete={async (value) => {
                setSharpnessValue(value);
                // After the slider has finished sliding, perform the actual adjustment
                handleTransformation("sharpness");

                // Now call the handle adjustment after the completion of the slider action
                handleAdjustment("saturation");
              }}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#0000FF"
            />
            <Text className="text-white text-center mt-2">
              Value: {sharpnessValue}
            </Text>
          </View>
        )}
        {selectedTool === "Blur" && (
          <View className="px-5 pb-4 pt-2 flex items-center border-slate-300 border-b-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-grow-0"
            >
              {BlurTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => setSelectedBlurTool(tool.id)}
                  className={`flex items-center justify-center w-28 py-5 mx-6 rounded-md ${
                    selectedBlurTool === tool.id
                      ? "bg-primary"
                      : "bg-neutral-700"
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selectedBlurTool === tool.id ? "#1E90FF" : "#333",
                  }}
                >
                  <Text
                    className={`text-xs text-center ${
                      selectedBlurTool === tool.id
                        ? "text-white"
                        : "text-gray-200"
                    }`}
                  >
                    {tool.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10, paddingHorizontal: 5 }}
            className="flex-grow-0"
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={async () => {
                  setFilterType(filter.id);
                  handleTransformation("filter");
                }}
                className={`flex items-center justify-center w-24 py-5 mx-1 rounded-md ${
                  selectedTool === filter.id ? "bg-primary" : "bg-neutral-700"
                }`}
                style={{
                  borderWidth: 1,
                  borderColor: selectedTool === filter.id ? "#1E90FF" : "#333",
                }}
              >
                <Text
                  className={`text-xs text-center ${
                    selectedTool === filter.id ? "text-white" : "text-gray-200"
                  }`}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {/* Tools Bar Section */}
        <View className="pt-2 pb-4 bg-neutral-900 rounded-t-xl">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-grow-0"
          >
            {tools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                className={`flex items-center w-24 justify-center py-5 p-3 mx-1 rounded-xl ${
                  selectedTool === tool.id ? "bg-primary" : ""
                }`}
                onPress={tool.action}
              >
                <tool.icon size={24} color="#ffffff" />
                <Text className="mt-2 text-xs text-center text-white">
                  {tool.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <View>
        <WebView
          ref={webviewRef}
          source={{
            html: `
      <!DOCTYPE html>
      <html>
        <head>
          <script async src="https://docs.opencv.org/4.5.0/opencv.js" type="text/javascript"></script>
        </head>
        <body>
          <script>
            
            function checkOpenCVInitialization() {
              if (typeof cv !== 'undefined' && cv.onRuntimeInitialized) {
               
                console.log("OpenCV initialized");
                window.ReactNativeWebView.postMessage('POP101');
              } else {
                
                console.log("OpenCV not initialized, retrying...");
                setTimeout(checkOpenCVInitialization, 1000);
              }
            }

           
            checkOpenCVInitialization();
          </script>
        </body>
      </html>
    `,
          }}
          onMessage={(event) => {
            const message = event.nativeEvent.data;
            if (message.startsWith("data:image/png;base64,")) {
              const uri = `data:image/png;base64,${message.split(",")[1]}`;

              setEditedImageUri(uri); // Update the state with the new image
            } else {
              console.log("WebView message:", message);
            }
          }}
          javaScriptEnabled={true} // Enable JavaScript in WebView
          style={{ opacity: 0, height: 0, width: 0, position: "absolute" }} // Invisible WebView
        />
      </View>
    </SafeAreaView>
  );
};

export default ImageEditorScreen;
