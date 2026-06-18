import { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Line, Rect } from 'react-native-svg';

const AnimatedLine = Animated.createAnimatedComponent(Line);

export function ScanExplainerIllustration({ color }: { color: string }) {
  const sweepY = useSharedValue(100);

  useEffect(() => {
    sweepY.value = withRepeat(
      withSequence(withTiming(145, { duration: 850 }), withTiming(100, { duration: 850 })),
      -1,
      true,
    );
  }, [sweepY]);

  const sweepProps = useAnimatedProps(() => ({
    y1: sweepY.value,
    y2: sweepY.value,
  }));

  return (
    <Svg width={170} height={170} viewBox="0 0 170 170">
      {/* product box */}
      <Rect x="35" y="15" width="100" height="140" rx="8" stroke={color} strokeWidth={3} fill="none" />

      {/* product label line */}
      <Line x1="50" y1="40" x2="120" y2="40" stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
      <Line x1="50" y1="55" x2="100" y2="55" stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.4} />

      {/* barcode bars */}
      <G stroke={color} strokeWidth={3}>
        <Line x1="50" y1="95" x2="50" y2="150" />
        <Line x1="58" y1="95" x2="58" y2="150" />
        <Line x1="68" y1="95" x2="68" y2="150" />
        <Line x1="73" y1="95" x2="73" y2="150" />
        <Line x1="83" y1="95" x2="83" y2="150" />
        <Line x1="91" y1="95" x2="91" y2="150" />
        <Line x1="100" y1="95" x2="100" y2="150" />
        <Line x1="110" y1="95" x2="110" y2="150" />
        <Line x1="120" y1="95" x2="120" y2="150" />
      </G>

      {/* scanning sweep line */}
      <AnimatedLine x1="44" x2="126" stroke={color} strokeWidth={2} opacity={0.6} animatedProps={sweepProps} />

      {/* viewfinder corner brackets over the barcode */}
      <G stroke={color} strokeWidth={4} fill="none" strokeLinecap="round">
        <Line x1="40" y1="102" x2="40" y2="88" />
        <Line x1="40" y1="88" x2="54" y2="88" />

        <Line x1="130" y1="102" x2="130" y2="88" />
        <Line x1="130" y1="88" x2="116" y2="88" />

        <Line x1="40" y1="138" x2="40" y2="152" />
        <Line x1="40" y1="152" x2="54" y2="152" />

        <Line x1="130" y1="138" x2="130" y2="152" />
        <Line x1="130" y1="152" x2="116" y2="152" />
      </G>
    </Svg>
  );
}
