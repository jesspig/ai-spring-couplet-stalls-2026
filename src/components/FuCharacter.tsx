import { getSpringFestivalColors, getFuRotation } from '../utils/svg.util';

interface FuCharacterProps {
  x: number;
  y: number;
  orientation: 'upright' | 'inverted';
  parentRotation?: number;
}

export default function FuCharacter({ x, y, orientation, parentRotation }: FuCharacterProps) {
  const colors = getSpringFestivalColors();
  const { rotation, charRotation } = getFuRotation(orientation);
  const effectiveRotation = parentRotation !== undefined ? rotation : 0;
  const size = 88;
  const paperSize = 120;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${effectiveRotation})`}>
      {/* 福字背景 */}
      <rect
        x={-paperSize / 2}
        y={-paperSize / 2}
        width={paperSize}
        height={paperSize}
        fill={colors.red}
        stroke={colors.gold}
        strokeWidth={4}
        filter="url(#shadow)"
      />
      {/* 内边框 */}
      <rect
        x={-paperSize / 2 + 10}
        y={-paperSize / 2 + 10}
        width={paperSize - 20}
        height={paperSize - 20}
        fill="none"
        stroke={colors.gold}
        strokeWidth={2}
        rx={2}
      />
      {/* 福字 */}
      <text
        x={0}
        y={size / 3}
        fontSize={size}
        fill={colors.gold}
        fontFamily="Noto Serif SC, serif"
        fontWeight="700"
        textAnchor="middle"
        transform={`rotate(${parentRotation !== undefined ? charRotation - effectiveRotation : charRotation})`}
      >
        福
      </text>
    </g>
  );
}