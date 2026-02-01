import { useRef, useCallback } from 'react';
import type { SpringFestivalData } from '../pages/DisplayPage';
import './SpringFestivalSVG.css';

interface SpringFestivalSVGProps {
  data: SpringFestivalData;
  coupletOrder: string;
  horizontalDirection: string;
  fuOrientation: string;
  topic: string;
}

export default function SpringFestivalSVG({
  data,
  coupletOrder,
  horizontalDirection,
  fuOrientation,
  topic
}: SpringFestivalSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // 下载SVG为PNG图片
  const handleDownload = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // 从SVG获取实际高度
      const actualHeight = parseInt(svg.getAttribute('height') || '1280');
      canvas.width = 1200;
      canvas.height = actualHeight;
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `春联_${topic || '未命名'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = url;
  }, [topic]);

  // 颜色配置
  const colors = {
    red: '#DC2626',
    gold: '#FFD700',
    goldDark: '#B8860B',
    paper: '#FEF3C7'
  };

  // 计算对联字符位置（竖排）
  const renderVerticalText = (text: string, startX: number, startY: number, fontSize: number, lineHeight: number) => {
    return text.split('').map((char, index) => (
      <text
        key={index}
        x={startX}
        y={startY + index * lineHeight}
        fontSize={fontSize}
        fill={colors.gold}
        fontFamily="Noto Serif SC, serif"
        fontWeight="700"
        textAnchor="middle"
      >
        {char}
      </text>
    ));
  };

  // 根据对联字数计算自适应参数
  const getCoupletParams = (text: string) => {
    const charCount = text.length;

    // 根据字数调整
    if (charCount <= 5) {
      // 五言：字体稍大，间距舒适
      const lineHeight = 64;
      const padding = 50;
      return {
        fontSize: 48,
        lineHeight,
        padding,
        height: charCount * lineHeight + padding * 2
      };
    } else if (charCount <= 7) {
      // 七言：标准大小
      const lineHeight = 58;
      const padding = 45;
      return {
        fontSize: 44,
        lineHeight,
        padding,
        height: charCount * lineHeight + padding * 2
      };
    } else if (charCount <= 9) {
      // 九言：稍小字体
      const lineHeight = 52;
      const padding = 40;
      return {
        fontSize: 40,
        lineHeight,
        padding,
        height: charCount * lineHeight + padding * 2
      };
    } else {
      // 更多字数：进一步压缩
      const lineHeight = 46;
      const padding = 35;
      return {
        fontSize: 36,
        lineHeight,
        padding,
        height: charCount * lineHeight + padding * 2
      };
    }
  };

  // 计算横批字符位置
  const renderHorizontalText = (text: string, startX: number, startY: number, fontSize: number) => {
    const chars = horizontalDirection === 'rightToLeft' ? text.split('').reverse() : text.split('');
    const spacing = fontSize * 1.8;
    const totalWidth = (chars.length - 1) * spacing;
    const startPos = startX - totalWidth / 2;

    return chars.map((char, index) => (
      <text
        key={index}
        x={startPos + index * spacing}
        y={startY}
        fontSize={fontSize}
        fill={colors.gold}
        fontFamily="Noto Serif SC, serif"
        fontWeight="700"
        textAnchor="middle"
      >
        {char}
      </text>
    ));
  };

  // 渲染挥春
  const renderSpringScrolls = () => {
    if (!data.springScrolls || data.springScrolls.length === 0) return null;

    const scrollWidth = 80;
    const scrollHeight = 180;
    const gap = 30;
    const totalWidth = data.springScrolls.length * scrollWidth + (data.springScrolls.length - 1) * gap;
    const startX = 600 - totalWidth / 2;

    return data.springScrolls.map((scroll, index) => (
      <g key={index} transform={`translate(${startX + index * (scrollWidth + gap)}, ${scrollsYPosition})`}>
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
            y={40 + charIndex * 35}
            fontSize={24}
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
  };

  // 福字旋转角度
  const fuRotation = fuOrientation === 'inverted' ? 135 : -45;
  const fuCharRotation = fuOrientation === 'inverted' ? 180 : 0;

  // 对联位置（根据顺序调整）
  const isLeftUpper = coupletOrder === 'leftUpper';
  const leftCoupletText = isLeftUpper ? data.upperCouplet : data.lowerCouplet;
  const rightCoupletText = isLeftUpper ? data.lowerCouplet : data.upperCouplet;

  // 计算左右联的自适应参数（取两者最大高度）
  const leftParams = getCoupletParams(leftCoupletText || '');
  const rightParams = getCoupletParams(rightCoupletText || '');
  const coupletHeight = Math.max(leftParams.height, rightParams.height);
  const maxCharCount = Math.max((leftCoupletText || '').length, (rightCoupletText || '').length);

  // 根据对联高度调整福字位置和挥春位置
  const fuYPosition = coupletHeight / 2 - 60;
  const scrollsYPosition = 320 + coupletHeight + 40;
  const topicYPosition = scrollsYPosition + 260;
  const svgHeight = topicYPosition + 100;

  return (
    <div className="svg-container">
      <svg
        ref={svgRef}
        width="1200"
        height={svgHeight}
        viewBox={`0 0 1200 ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <defs>
          {/* 纸张纹理滤镜 */}
          <filter id="paperTexture">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
            <feDiffuseLighting in="noise" lightingColor={colors.paper} surfaceScale="2" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feBlend in="SourceGraphic" in2="light" mode="multiply" />
          </filter>

          {/* 金色渐变 */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.gold} />
            <stop offset="50%" stopColor="#FFF8DC" />
            <stop offset="100%" stopColor={colors.goldDark} />
          </linearGradient>

          {/* 阴影效果 */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 背景 */}
        <rect width="1200" height={svgHeight} fill={colors.paper} />

        {/* 装饰性背景图案 */}
        <g opacity="0.05">
          {[...Array(8)].map((_, i) => (
            <text
              key={i}
              x={150 + (i % 4) * 300}
              y={200 + Math.floor(i / 4) * 900}
              fontSize={200}
              fill={colors.red}
              fontFamily="Noto Serif SC, serif"
              textAnchor="middle"
            >
              福
            </text>
          ))}
        </g>

        {/* 横批区域 */}
        <g transform="translate(600, 120)">
          {/* 横批外框 */}
          <rect
            x={-250}
            y={-50}
            width={500}
            height={100}
            fill={colors.red}
            stroke={colors.gold}
            strokeWidth={4}
            rx={8}
            filter="url(#shadow)"
          />
          {/* 横批内框 */}
          <rect
            x={-240}
            y={-40}
            width={480}
            height={80}
            fill="none"
            stroke={colors.gold}
            strokeWidth={2}
            rx={6}
          />
          {/* 横批文字 */}
          {renderHorizontalText(data.horizontalScroll || '', 0, 15, 48)}
        </g>

        {/* 对联区域 */}
        <g transform="translate(0, 280)">
          {/* 左联 */}
          <g transform="translate(300, 0)">
            {/* 对联外框 */}
            <rect
              x={-50}
              y={-20}
              width={100}
              height={leftParams.height}
              fill={colors.red}
              stroke={colors.gold}
              strokeWidth={4}
              rx={8}
              filter="url(#shadow)"
            />
            {/* 对联内框 */}
            <rect
              x={-40}
              y={-10}
              width={80}
              height={leftParams.height - 20}
              fill="none"
              stroke={colors.gold}
              strokeWidth={2}
              rx={6}
            />
            {/* 左联文字 */}
            {renderVerticalText(leftCoupletText || '', 0, leftParams.padding, leftParams.fontSize, leftParams.lineHeight)}
            {/* 标签 */}
            <text
              x={0}
              y={leftParams.height + 20}
              fontSize={16}
              fill={colors.goldDark}
              fontFamily="Noto Sans SC, sans-serif"
              textAnchor="middle"
            >
              {isLeftUpper ? '上联' : '下联'}
            </text>
          </g>

          {/* 右联 */}
          <g transform="translate(900, 0)">
            {/* 对联外框 */}
            <rect
              x={-50}
              y={-20}
              width={100}
              height={rightParams.height}
              fill={colors.red}
              stroke={colors.gold}
              strokeWidth={4}
              rx={8}
              filter="url(#shadow)"
            />
            {/* 对联内框 */}
            <rect
              x={-40}
              y={-10}
              width={80}
              height={rightParams.height - 20}
              fill="none"
              stroke={colors.gold}
              strokeWidth={2}
              rx={6}
            />
            {/* 右联文字 */}
            {renderVerticalText(rightCoupletText || '', 0, rightParams.padding, rightParams.fontSize, rightParams.lineHeight)}
            {/* 标签 */}
            <text
              x={0}
              y={rightParams.height + 20}
              fontSize={16}
              fill={colors.goldDark}
              fontFamily="Noto Sans SC, sans-serif"
              textAnchor="middle"
            >
              {isLeftUpper ? '下联' : '上联'}
            </text>
          </g>

          {/* 福字区域（中间） */}
          <g transform={`translate(600, ${fuYPosition})`}>
            {/* 第一个福字 */}
            <g transform={`translate(-80, 0) rotate(${fuRotation})`}>
              <rect
                x={-50}
                y={-50}
                width={100}
                height={100}
                fill={colors.red}
                stroke={colors.gold}
                strokeWidth={4}
                filter="url(#shadow)"
              />
              <rect
                x={-42}
                y={-42}
                width={84}
                height={84}
                fill="none"
                stroke={colors.gold}
                strokeWidth={2}
              />
              <text
                x={0}
                y={20}
                fontSize={72}
                fill={colors.gold}
                fontFamily="Noto Serif SC, serif"
                fontWeight="700"
                textAnchor="middle"
                transform={`rotate(${fuCharRotation - fuRotation})`}
              >
                福
              </text>
            </g>
            {/* 第二个福字 */}
            <g transform={`translate(80, 0) rotate(${fuRotation})`}>
              <rect
                x={-50}
                y={-50}
                width={100}
                height={100}
                fill={colors.red}
                stroke={colors.gold}
                strokeWidth={4}
                filter="url(#shadow)"
              />
              <rect
                x={-42}
                y={-42}
                width={84}
                height={84}
                fill="none"
                stroke={colors.gold}
                strokeWidth={2}
              />
              <text
                x={0}
                y={20}
                fontSize={72}
                fill={colors.gold}
                fontFamily="Noto Serif SC, serif"
                fontWeight="700"
                textAnchor="middle"
                transform={`rotate(${fuCharRotation - fuRotation})`}
              >
                福
              </text>
            </g>
          </g>
        </g>

        {/* 挥春区域 */}
        {renderSpringScrolls()}

        {/* 主题标签 */}
        <g transform={`translate(600, ${topicYPosition})`}>
          <text
            x={0}
            y={6}
            fontSize={16}
            fill={colors.goldDark}
            fontFamily="Noto Sans SC, sans-serif"
            textAnchor="middle"
          >
            主题：{topic || '未命名'}
          </text>
        </g>
      </svg>

      <button className="download-btn" onClick={handleDownload}>
        保存图片
      </button>
    </div>
  );
}
