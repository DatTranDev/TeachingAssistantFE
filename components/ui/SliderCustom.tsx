import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface SliderCustomProps {
  minValue?: number;
  maxValue?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  readonly?: boolean;
  style?: string;
}

const SliderCustom = ({
  minValue = 0,
  maxValue = 100,
  initialValue = 50,
  onValueChange,
  readonly = false,
  style = "",
}: SliderCustomProps) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const position = useSharedValue(0);
  const startPosition = useSharedValue(0);
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    setCurrentValue(initialValue);
    if (sliderWidth > 0) {
      const boundedValue = Math.min(Math.max(initialValue, minValue), maxValue);
      const newPosition = (sliderWidth * (boundedValue - minValue)) / (maxValue - minValue);
      position.value = withSpring(newPosition);
    }
  }, [initialValue, minValue, maxValue]);

  const calculateInitialPosition = (width: number) => {
    const boundedValue = Math.min(Math.max(currentValue, minValue), maxValue);
    const initialPosition = (width * (boundedValue - minValue)) / (maxValue - minValue);
    position.value = withSpring(initialPosition);
  };

  const updateValue = (positionX: number) => {
    const newValue = Math.round(
      (positionX / sliderWidth) * (maxValue - minValue) + minValue
    );
    setCurrentValue(newValue);
    onValueChange?.(newValue);
  };

  const panGesture = Gesture.Pan()
    .enabled(!readonly)
    .onStart(() => {
      startPosition.value = position.value;
    })
    .onUpdate((event) => {
      let newPosition = startPosition.value + event.translationX;
      // Giới hạn trong phạm vi của thanh trượt
      newPosition = Math.min(Math.max(newPosition, 0), sliderWidth);
      position.value = newPosition;
      runOnJS(updateValue)(newPosition);
    })
    .onEnd(() => {
      position.value = withSpring(position.value);
    });

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: position.value,
    opacity: 1,
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <View className={`w-32 ${style}`}>
      <View
        className="h-2 bg-gray-200 rounded-full"
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          setSliderWidth(width);
          calculateInitialPosition(width);
        }}
      >
        <Animated.View 
          className="absolute h-full bg-blue_primary rounded-full"
          style={fillAnimatedStyle}
        />
      {!readonly && (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="absolute w-6 h-6 -top-[8px] -ml-3 rounded-full bg-white border border-gray-300 shadow-sm"
            style={thumbAnimatedStyle}
            />
          </GestureDetector>
        )}
      </View>
      
      {/* <Text className="mt-4 text-center text-gray-700">
        {currentValue}
      </Text> */}
    </View>
  );
};

export default SliderCustom;