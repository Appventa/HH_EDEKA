import Svg, { Rect } from 'react-native-svg';

import { encodeCode128 } from '@/utils/code128';

export function Barcode({
  value,
  height = 48,
  barWidth,
  targetWidth,
  color = '#1A1A1A',
}: {
  value: string;
  height?: number;
  /** Fixed width per module. Ignored if targetWidth is set. */
  barWidth?: number;
  /** If set, the barcode scales to fill this width. */
  targetWidth?: number;
  color?: string;
}) {
  const segments = encodeCode128(value);
  const totalModules = segments.reduce((sum, segment) => sum + segment.width, 0);
  const resolvedBarWidth = targetWidth ? targetWidth / totalModules : (barWidth ?? 1.6);
  const totalWidth = totalModules * resolvedBarWidth;

  let x = 0;
  return (
    <Svg width={totalWidth} height={height}>
      {segments.map((segment, index) => {
        const width = segment.width * resolvedBarWidth;
        const rect = segment.bar ? (
          <Rect key={index} x={x} y={0} width={width} height={height} fill={color} />
        ) : null;
        x += width;
        return rect;
      })}
    </Svg>
  );
}
