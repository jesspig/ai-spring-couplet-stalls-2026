import { getSpringFestivalColors } from '../utils/svg.util';
import type { CoupletParams } from '../utils/svg.util';

interface CoupletProps {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  params: CoupletParams;
  label?: string;
}

export default function Couplet({ text, x, y, width, height, params, label }: CoupletProps) {
  const colors = getSpringFestivalColors();

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* 对联外框 */}
      <rect
        x={-width / 2}
        y={-20}
        width={width}
        height={height}
        fill={colors.red}
        stroke={colors.gold}
        strokeWidth={4}
        rx={8}
        filter="url(#shadow)"
      />
      {/* 对联内框 */}
      <rect
        x={-width / 2 + 8}
        y={-10}
        width={width - 16}
        height={height - 20}
        fill="none"
        stroke={colors.gold}
        strokeWidth={2}
        rx={6}
      />
      {/* 竖排文字 */}
      {text.split('').map((char, index) => (
        <text
          key={index}
          x={0}
          y={params.padding + index * params.lineHeight}
          fontSize={params.fontSize}
          fill={colors.gold}
          fontFamily="Noto Serif SC, serif"
          fontWeight="700"
          textAnchor="middle"
        >
          {char}
        </text>
      ))}
      {/* 标签 */}
      {label && (
        <text
          x={0}
          y={height + 20}
          fontSize={16}
          fill={colors.goldDark}
          fontFamily="Noto Sans SC, sans-serif"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}