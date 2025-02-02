# 🎨 Artify Image Editor

Artify is a **powerful and intuitive image editing application** built with **React Native**. It allows users to apply real-time transformations such as **brightness, contrast, saturation, sharpness, and filters**. The app leverages **OpenCV.js** via a WebView for advanced image processing, ensuring a seamless and performant editing experience.

---

## ✨ Features

✅ **Real-Time Image Editing** – Adjust brightness, contrast, saturation, and sharpness with sliders.
✅ **Filters** – Apply grayscale, sepia, cool, warm, and vintage filters.
✅ **Advanced Transformations** – Use OpenCV.js for thresholding, blurring, and intensity adjustments.
✅ **Rotate Images** – Rotate images in 90-degree increments.
✅ **Save to Gallery** – Save edited images directly to your device.
✅ **Responsive UI** – Clean and modern design with a user-friendly interface.
✅ **WebView Integration** – Seamlessly integrates OpenCV.js for advanced image processing.

---

## 🛠 Technologies Used

- **Frontend:** React Native, Expo
- **Image Processing:** OpenCV.js (via WebView)
- **State Management:** React Hooks (useState, useEffect)
- **UI Components:** Tailwind CSS (via nativewind), Lucide Icons
- **Permissions:** Expo Media Library, Expo Image Picker
- **Build Tools:** Vite, Babel

---

## 🌐 WebView Integration

The app uses a **WebView** to load and run OpenCV.js for advanced image transformations.

🔹 The WebView is styled to be invisible (`opacity: 0`, `height: 0`, `width: 0`) while still processing image data in the background.
🔹 Image data is passed to the WebView as a **base64 string**.
🔹 OpenCV.js processes the image (e.g., applying filters, transformations).
🔹 The processed image is returned to the React Native app as a **base64 string** and displayed.

---

## 📌 Setup Instructions

### **Prerequisites**
- **Node.js** (v16 or higher)
- **Expo CLI** (`npm install -g expo-cli`)
- **Android/iOS simulator** or a physical device

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yasser1123/Artify.git
cd Artify

# Install dependencies
npm install
```

### **Run the App**

```bash
# Start the development server
npm start

# Run on Android
tnpm run android

# Run on iOS (MacOS required)
npm run ios
```

---

## 📸 Usage

1. **Open the App** – Launch Artify on your device.
2. **Choose an Image** – Select an image from your gallery or take a new photo using the camera.
3. **Edit the Image** – Use the sliders and tools to adjust brightness, contrast, saturation, sharpness, and apply filters.
4. **Save the Image** – Save the edited image to your device's gallery.

---

## 📂 Code Structure

```
artify-image-editor/  
├── assets/                 # Static assets (images, icons)  
├── components/             # Reusable UI components  
├── screens/                # App screens (e.g., ImageEditorScreen)  
├── utils/                  # Utility functions (e.g., image processing)  
├── App.js                  # Main application entry point  
├── README.md               # Project documentation  
└── package.json            # Dependencies and scripts  
```

---

## 🎨 Screenshots
*(Add screenshots of the app here)*

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository.
2. **Create a new branch** (`git checkout -b feature/your-feature`).
3. **Commit your changes** (`git commit -m 'Add some feature'`).
4. **Push to the branch** (`git push origin feature/your-feature`).
5. **Open a pull request**.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgments

💡 **OpenCV.js** – Powerful image processing capabilities.

💡 **Expo** – Simplifying React Native development.

💡 **Lucide Icons** – Beautiful and customizable icons.

Enjoy editing your images with **Artify**! 🎨🚀
