# SafeVision 🚦👀

ProximityAlert is a **React Native app** that uses [Vision Camera](https://github.com/mrousavy/react-native-vision-camera) and [react-native-fast-tflite](https://github.com/mrousavy/react-native-fast-tflite) with **TensorFlow Lite** to detect obstacles in real time.  
It draws bounding boxes around detected objects and warns the user when objects are too close with **visual alerts** and **vibrations**.

---

## 📱 Demo


https://github.com/user-attachments/assets/c3bfe61c-8b46-43a3-b54b-e688cc335896



---

## ✨ Features
- Real-time **object detection** using [Google’s Mobile Object Localizer v1](https://www.kaggle.com/models/google/mobile-object-localizer-v1) TensorFlow Lite model.
- **Bounding boxes** drawn on top of the camera feed.
- **Proximity-based alerts**:
  - ⚠️ **Caution** when object covers ~40% of the screen.
  - 🚨 **Danger** when object covers ~70% of the screen.
- **Haptic feedback (vibration)** in danger mode.
- Optimized with **frame processors & worklets** for smooth performance.
- Can experiment with **other Kaggle TFLite models** → [Kaggle Models Hub](https://www.kaggle.com/models).

---

## 🔧 Installation

```bash
# Clone repo
git clone https://github.com/your-username/react-native-proximity-alert.git
cd Proximity-Alert

# Install dependencies
yarn install
# or
npm install

# iOS setup
cd ios && pod install && cd ..

# Run app
yarn ios
# or
yarn android
```
---

## 💡 Use Cases

- 👩‍🦯 **Assistive app for visually impaired users** – warns before bumping into obstacles.  
- 🚶 **Pedestrian safety** – heads-up when walking distracted.  
- 🚗 **Prototype driver assistance** – detect objects too close to the car.  
- 🧪 **Computer vision research** – experiment with real-time detection in React Native.  

---

## ⚠️ Limitations

- Works best in **good lighting conditions**.  
- Currently uses **screen area thresholding**, not full depth estimation.  
- Performance depends on **device hardware**.  

---

## 🙌 Acknowledgements

- [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)  
- [react-native-fast-tflite](https://github.com/mrousavy/react-native-fast-tflite)  
- [Google Mobile Object Localizer v1](https://www.kaggle.com/models/google/mobile-object-localizer-v1) (TFLite model)  
- [Kaggle Models](https://www.kaggle.com/models) for exploring other pretrained models

---

## 💡 About the Author

👨‍💻 **Munish Vira**  
Senior Software Engineer | React Native Specialist | 4+ years experience  

- 💼 4+ years experience in **React Native, React, Next.js**  
- 🚀 Scaled apps to **1,000+ concurrent users** with **40% performance boost**  
- 📱 Expert in **animations, in-app purchases, analytics, and cross-platform scaling**  

📧 Email: [munishvira1999@gmail.com](mailto:munishvira1999@gmail.com)  
🔗 LinkedIn: [linkedin.com/in/munish-vira](https://www.linkedin.com/in/munish-vira)  
💻 GitHub: [github.com/munishvira](https://github.com/munishvira)  
🌐 Portfolio: [munishvira.github.io](https://munishvira.github.io)  

## ⚡ Feel free to fork, improve, or use this as a starter for your own reels-like project!

---
