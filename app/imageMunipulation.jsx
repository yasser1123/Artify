import * as FileSystem from "expo-file-system";

let injectJavaScript;
let base64Image;

// Function to convert image URI to base64
const getImageBase64 = async (uri) => {
  try {
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

// Function to apply multiple image transformations at once
const applyImageTransformations = async (
  editedImageUri,
  brightnessValue = 2,
  contrastValue = 1.0,
  saturationValue = 1.0,
  sharpnessValue = 1.0,
  filterType = "",
  thresholdValue = 128,
  intensityValue = 1.0, // New intensity parameter
  blurValue = 2,
  rotateValue = 0,
  queue = []
) => {
  // Get base64 image
  if (!base64Image) {
    base64Image = await getImageBase64(editedImageUri);
    if (!base64Image) {
      console.error("Base64 conversion failed");
      return; // Handle error if base64 conversion fails
    }
  }

  let startInjectJavaScript = `(function() {
    if (typeof cv === 'undefined') {
      console.error("OpenCV.js is not loaded");
      window.ReactNativeWebView.postMessage('Error: OpenCV.js is not loaded');
      return;
    }

    let img = new Image();
    img.src = "${base64Image}";

    img.onload = function() {
      if (img.width === 0 || img.height === 0) {
        console.error("Error: Image width or height is zero.");
        window.ReactNativeWebView.postMessage("Error: Image width or height is zero");
        return;
      }

      try {
        let src = cv.imread(img);
        let dst = new cv.Mat();
`;

  let lastInjectJavaScript = `
        let canvas = document.createElement("canvas");
        canvas.width = dst.cols || img.width;
        canvas.height = dst.rows || img.height;

        let ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error("Error: Canvas context is null.");
          window.ReactNativeWebView.postMessage("Error: Canvas context is null");
          return;
        }

        let imageData = ctx.createImageData(canvas.width, canvas.height);
        let data = imageData.data;
        let dstData = dst.data;

        for (let i = 0; i < dstData.length; i++) {
          data[i] = dstData[i];
        }

        ctx.putImageData(imageData, 0, 0);
        let base64ProcessedImage = canvas.toDataURL('image/png');
        window.ReactNativeWebView.postMessage(base64ProcessedImage);

        src.delete();
        dst.delete();
      } catch (error) {
        console.error("Processing error:", error);
        window.ReactNativeWebView.postMessage("Error: " + error.message);
      }
    };

    img.onerror = function() {
      console.error("Error: Image loading failed.");
      window.ReactNativeWebView.postMessage("Error: Image loading failed");
    };
  })();
  true;`;

  // Handle transformations using switch statement
  injectJavaScript = startInjectJavaScript;

  if (queue.length > 0) {
    queue.forEach((transformation) => {
      console.log("transformation", transformation);

      switch (transformation) {
        case "filter":
          injectJavaScript += `
            if ("${filterType}" === "grayscale") {
              cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
              cv.cvtColor(src, src, cv.COLOR_GRAY2RGBA);
            } else {
              src = src.clone(); // No filter applied
            }
          `;
          break;

        case "contrastAndBrightness":
          injectJavaScript += `
            src.convertTo(dst, -1, ${contrastValue}, ${brightnessValue});
          `;
          break;

        case "saturation":
          injectJavaScript += `
    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB); // Convert RGBA to RGB
    cv.cvtColor(src, src, cv.COLOR_RGB2HSV); // Convert RGB to HSV

    if (${saturationValue} !== 1.0) {
      let channels = new cv.MatVector();
      cv.split(src, channels); // Split into H, S, V channels

      // Scale the saturation channel
      let saturationChannel = channels.get(1); // S channel
      saturationChannel.convertTo(saturationChannel, -1, ${saturationValue}, 0);
      channels.set(1, saturationChannel); // Update the S channel

      // Merge channels back into the HSV image
      cv.merge(channels, src);
      channels.delete();
      saturationChannel.delete();
    }

    cv.cvtColor(src, src, cv.COLOR_HSV2RGB); // Convert back to RGB
    cv.cvtColor(src, dst, cv.COLOR_RGB2RGBA); // Convert back to RGBA
  `;
          break;

        case "threshold":
          injectJavaScript += `
    // Ensure the image is in grayscale format before thresholding
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);  // Convert RGBA to grayscale

    // Prepare the destination matrix for thresholded output
    let dst = new cv.Mat();
    
    // Apply Otsu's thresholding method
   
    let _ ; 
    window.ReactNativeWebView.postMessage("pp: threshold");
    _, dst = cv.threshold(src, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
 window.ReactNativeWebView.postMessage("pp: done");
    // Convert the thresholded image back to RGBA format
    cv.cvtColor(dst, src, cv.COLOR_GRAY2RGBA);

    // Clean up temporary matrices used in Otsu's thresholding
    
    dst.delete();
  `;
          break;

        case "sharpness":
          injectJavaScript += `
    if (${sharpnessValue} > 0) {
  let sharpenKernel = cv.matFromArray(3, 3, cv.CV_32F, [
    -1, -1, -1,
    -1, 8.0 + ${sharpnessValue}, -1,
    -1, -1, -1
  ]);

  // Optionally normalize the kernel to prevent overflow
  const normalizeKernel = false; // Set to true if normalization is desired
  if (normalizeKernel) {
    let kernelSum = 0;
    for (let i = 0; i < sharpenKernel.rows; i++) {
      for (let j = 0; j < sharpenKernel.cols; j++) {
        kernelSum += sharpenKernel.floatAt(i, j);
      }
    }
    if (kernelSum !== 0) {
      sharpenKernel.convertTo(sharpenKernel, -1, 1.0 / kernelSum, 0);
    }
  }

  // Apply the sharpening filter
  cv.filter2D(src, dst, src.depth(), sharpenKernel);

  // Cleanup
  sharpenKernel.delete();
}
  `;
          break;

        case "blur":
          injectJavaScript += `
            if (${blurValue} > 0) {
              cv.GaussianBlur(src, src, new cv.Size(${blurValue}, ${blurValue}), 0, 0, cv.BORDER_DEFAULT);
            }
          `;
          break;

        case "rotate":
          injectJavaScript += `
            if (${rotateValue} !== 0) {
              let center = new cv.Point(src.cols / 2, src.rows / 2);
              let rotationMatrix = cv.getRotationMatrix2D(center, ${rotateValue}, 1);
              cv.warpAffine(src, src, rotationMatrix, src.size(), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 0));
            }
          `;
          break;

        case "intensity":
          injectJavaScript += `
            if (${intensityValue} !== 1.0) {
              // Apply intensity adjustment by multiplying each pixel by a scalar
              let scalar = new cv.Mat(src.rows, src.cols, src.type(), [${intensityValue}, ${intensityValue}, ${intensityValue}, 1.0]);
              cv.multiply(src, scalar, src);
              scalar.delete();
            }
          `;
          break;

        default:
          console.warn(`Unknown transformation: ${transformation}`);
      }
    });

    injectJavaScript += lastInjectJavaScript;
  } else {
    injectJavaScript += lastInjectJavaScript;
  }

  return injectJavaScript;
};

export { applyImageTransformations };
