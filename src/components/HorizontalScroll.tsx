import { getSpringFestivalColors } from '../utils/svg.util';

interface HorizontalScrollProps {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'leftToRight' | 'rightToLeft';
}

export default function HorizontalScroll({ text, x, y, width, height, direction }: HorizontalScrollProps) {
  const colors = getSpringFestivalColors();
  const fontSize = 60;
  const spacing = fontSize * 1.8;
  const chars = direction === 'rightToLeft' ? text.split('').reverse() : text.split('');
  const totalWidth = (chars.length - 1) * spacing;
  const startPos = -totalWidth / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* 横批外框 */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={colors.red}
        stroke={colors.gold}
        strokeWidth={4}
        rx={8}
        filter="url(#shadow)"
      />
      {/* 横批内框 */}
      <rect
        x={-width / 2 + 8}
        y={-height / 2 + 8}
        width={width - 16}
        height={height - 16}
        fill="none"
        stroke={colors.gold}
        strokeWidth={2}
        rx={6}
      />
      {/* 横批文字 */}
      {chars.map((char, index) => (
        <text
          key={index}
          x={startPos + index * spacing}
          y={fontSize / 3}
          fontSize={fontSize}
          fill={colors.gold}
          fontFamily="Noto Serif SC, serif"
          fontWeight="700"
          textAnchor="middle"
        >
          {char}
        </text>
      ))}
      {/* 横批标签 */}
      <text
        x={0}
        y={height / 2 + 25}
        fontSize={16}
        fill={colors.goldDark}
        fontFamily="Noto Sans SC, sans-serif"
        textAnchor="middle"
      >
        横批
      </text>
    </g>
  );
}