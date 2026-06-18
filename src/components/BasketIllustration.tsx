import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

export function BasketIllustration({ color }: { color: string }) {
  const drop = useSharedValue(0);

  useEffect(() => {
    drop.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 300 }),
      ),
      -1,
      false,
    );
  }, [drop]);

  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drop.value * 50 }],
    opacity: 1 - drop.value * 0.6,
  }));

  return (
    <View style={{ width: 120, height: 110, alignItems: 'center' }}>
      <Animated.View style={[{ position: 'absolute', top: 0 }, itemStyle]}>
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Path d="M2 2 L26 2 L26 26 L2 26 Z" stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round" />
        </Svg>
      </Animated.View>

      <Svg width={120} height={70} viewBox="0 0 120 70" style={{ marginTop: 40 }}>
        <Path d="M30 18 C30 4 90 4 90 18" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M10 20 L110 20 L96 64 L24 64 Z" stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round" />
        <Line x1="22" y1="34" x2="98" y2="34" stroke={color} strokeWidth={2} opacity={0.4} />
        <Line x1="26" y1="49" x2="94" y2="49" stroke={color} strokeWidth={2} opacity={0.4} />
      </Svg>
    </View>
  );
}
