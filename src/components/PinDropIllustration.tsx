import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

export function PinDropIllustration({ color }: { color: string }) {
  const bounce = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(-12, { duration: 500 }), withTiming(0, { duration: 450 })),
      -1,
      true,
    );
    ring.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 0 })),
      -1,
      false,
    );
  }, [bounce, ring]);

  const pinStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - ring.value,
    transform: [{ scaleX: 0.6 + ring.value * 0.8 }],
  }));

  return (
    <View style={{ width: 100, height: 110, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 8,
            width: 56,
            height: 14,
            borderRadius: 30,
            borderWidth: 3,
            borderColor: color,
          },
          ringStyle,
        ]}
      />

      <Animated.View style={[{ marginBottom: 14 }, pinStyle]}>
        <Svg width={56} height={76} viewBox="0 0 56 76">
          <Path
            d="M28 4 C13 4 4 15 4 28 C4 47 28 72 28 72 C28 72 52 47 52 28 C52 15 43 4 28 4 Z"
            stroke={color}
            strokeWidth={3}
            fill="none"
            strokeLinejoin="round"
          />
          <Circle cx="28" cy="28" r="8" stroke={color} strokeWidth={3} fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}
