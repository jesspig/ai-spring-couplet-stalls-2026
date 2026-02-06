import { getSpringFestivalColors } from '../utils/svg.util';

interface SpringScrollsProps {
  texts: string[];
  x: number;
  y: number;
}

export default function SpringScrolls({ texts, x, y }: SpringScrollsProps) {
  const colors = getSpringFestivalColors();
  const scrollWidth = 100;
  const scrollHeight = 220;
  const gap = 40;
  const totalWidth = texts.length * scrollWidth + (texts.length - 1) * gap;
  const startX = x - totalWidth / 2;

  return texts.map((scroll, index) => (
    <g key={index} transform={`translate(${startX + index * (scrollWidth + gap)}, ${y})`}>
      {/* 挥春背景 */}
      <rect
        x={0}
        y={0}
        width={scrollWidth}
        height={scrollHeight}
        fill={colors.red}
        stroke={colors.gold}
        strokeWidth={3}
        rx={4}
      />
      {/* 内边框 */}
      <rect
        x={6}
        y={6}
        width={scrollWidth - 12}
        height={scrollHeight - 12}
        fill="none"
        stroke={colors.gold}
        strokeWidth={1}
        rx={2}
      />
      {/* 挥春文字（竖排） */}
      {scroll.split('').map((char, charIndex) => (
        <text
          key={charIndex}
          x={scrollWidth / 2}
          y={55 + charIndex * 45}
          fontSize={32}
          fill={colors.gold}
          fontFamily="Noto Serif SC, serif"
          fontWeight="600"
          textAnchor="middle"
        >
          {char}
        </text>
      ))}
    </g>
  ));
}