import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Worklets } from 'react-native-worklets-core';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONF_THRESHOLD = 0.6;
const CAUTION_THRESHOLD = 0.4; // 40%
const DANGER_THRESHOLD = 0.7; // 70%
const UI_THROTTLE_MS = 200;
const ALERT_HOLD_MS = 800;
const SAFE_TIMEOUT_MS = 1200; // ✅ force reset to safe if nothing for this long

type Box = { left: number; top: number; width: number; height: number; conf: number };
type AlertLevel = 'safe' | 'caution' | 'danger';

export default function App() {
  const device = useCameraDevice('back');
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('safe');
  const [boxes, setBoxes] = useState<Box[]>([]);

  const { model } = useTensorflowModel(require('./assets/models/1.tflite'));
  const { resize } = useResizePlugin();

  const lastBoxes = useRef<Box[]>([]);
  const lastUIUpdate = useRef(0);
  const lastChange = useRef(0);
  const lastDetection = useRef(Date.now());

  useEffect(() => {
    (async () => {
      await Camera.requestCameraPermission();
    })();

    // ✅ watchdog timer: reset to safe if no detections for a while
    const id = setInterval(() => {
      if (Date.now() - lastDetection.current > SAFE_TIMEOUT_MS) {
        if (alertLevel !== 'safe') {
          setAlertLevel('safe');
          Vibration.cancel();
        }
      }
    }, 500);

    return () => clearInterval(id);
  }, [alertLevel]);

  const nearlyEqualBoxes = (a: Box[], b: Box[]) => {
    if (a.length !== b.length) {return false;}
    for (let i = 0; i < a.length; i++) {
      const da =
        Math.abs(a[i].left - b[i].left) +
        Math.abs(a[i].top - b[i].top) +
        Math.abs(a[i].width - b[i].width) +
        Math.abs(a[i].height - b[i].height);
      if (da > 2) {return false;}
    }
    return true;
  };

  const updateAlertLevel = (level: AlertLevel) => {
    const now = Date.now();

    if (level === 'safe') {
      if (alertLevel !== 'safe') {
        setAlertLevel('safe');
        Vibration.cancel();
      }
      return;
    }

    if (level !== alertLevel && now - lastChange.current > ALERT_HOLD_MS) {
      setAlertLevel(level);
      lastChange.current = now;

      if (level === 'danger') {
        Vibration.vibrate([0, 500, 200, 500], true); // stronger buzz
      } else {
        Vibration.cancel();
      }
    }
  };

  const updateBoxes = (bxs: Box[]) => {
    const now = Date.now();
    if (now - lastUIUpdate.current < UI_THROTTLE_MS) {return;}
    if (!nearlyEqualBoxes(lastBoxes.current, bxs)) {
      lastBoxes.current = bxs;
      lastUIUpdate.current = now;
      setBoxes(bxs);
    }
  };

  const setAlertLevelSafe = Worklets.createRunOnJS(updateAlertLevel);
  const updateBoxesSafe = Worklets.createRunOnJS(updateBoxes);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!model) {return;}

      const resized = resize(frame, {
        scale: { width: 192, height: 192 },
        pixelFormat: 'rgb',
        dataType: 'uint8',
      });

      const outputs = model.runSync([resized]);
      const detection_boxes = outputs[0];
      const detection_scores = outputs[2];

      const count = Math.min(
        Number(detection_scores.length ?? 0),
        Math.floor(Number(detection_boxes.length ?? 0) / 4)
      );

      let level: AlertLevel = 'safe';
      const out: Box[] = [];
      const screenArea = SCREEN_WIDTH * SCREEN_HEIGHT;

      for (let i = 0; i < count; i++) {
        const conf = Number(detection_scores[i]);
        if (conf < CONF_THRESHOLD) {continue;}

        const ymin = Number(detection_boxes[i * 4 + 0]);
        const xmin = Number(detection_boxes[i * 4 + 1]);
        const ymax = Number(detection_boxes[i * 4 + 2]);
        const xmax = Number(detection_boxes[i * 4 + 3]);

        const left = Math.max(0, Math.min(SCREEN_WIDTH, xmin * SCREEN_WIDTH));
        const top = Math.max(0, Math.min(SCREEN_HEIGHT, ymin * SCREEN_HEIGHT));
        const right = Math.max(0, Math.min(SCREEN_WIDTH, xmax * SCREEN_WIDTH));
        const bottom = Math.max(0, Math.min(SCREEN_HEIGHT, ymax * SCREEN_HEIGHT));
        const width = Math.max(0, right - left);
        const height = Math.max(0, bottom - top);

        out.push({ left, top, width, height, conf });

        const area = width * height;
        const ratio = area / screenArea;

        if (ratio >= DANGER_THRESHOLD) {
          level = 'danger';
          break;
        } else if (ratio >= CAUTION_THRESHOLD) {
          level = 'caution';
        }
      }

      if (out.length > 0) {
        lastDetection.current = Date.now();
      }

      updateBoxesSafe(out);
      setAlertLevelSafe(level);
    },
    [model]
  );

  if (!device) {return <Text>Loading Camera...</Text>;}

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        pixelFormat="yuv"
        frameProcessor={frameProcessor}
      />

      {boxes.map((b, i) => (
        <View
          key={i}
          style={[
            styles.box,
            {
              left: b.left,
              top: b.top,
              width: b.width,
              height: b.height,
              borderColor: b.conf > 0.8 ? 'red' : 'yellow',
            },
          ]}
        />
      ))}

      {alertLevel !== 'safe' && (
        <View
          style={[
            styles.warningBox,
            {
              backgroundColor:
                alertLevel === 'danger'
                  ? 'rgba(255,0,0,0.85)'
                  : 'rgba(255,255,0,0.85)',
            },
          ]}>
          <Text style={styles.warningText}>
            {alertLevel === 'caution'
              ? '⚠️ Caution: Obstacle Ahead'
              : '🚨 Danger! Too Close'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  box: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 4,
  },
  warningBox: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    padding: 14,
    borderRadius: 10,
  },
  warningText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
