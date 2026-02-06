import { useRef, useCallback } from 'react';
import type { SpringFestivalData } from '../types/spring.types';
import Couplet from './Couplet';
import HorizontalScroll from './HorizontalScroll';
import SpringScrolls from './SpringScrolls';
import FuCharacter from './FuCharacter';
import { getSpringFestivalColors, getCoupletParams } from '../utils/svg.util';


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

  // 固定 SVG 高度为 1600 (1200 * 4/3 = 1600)，保持 3:4 比例
  const svgHeight = 1600;
  // 福字在对联区域偏上位置
  const fuYPosition = coupletHeight / 4;
  // 挥春位置根据对联高度动态调整
  const scrollsYPosition = 320 + coupletHeight + 60;
  // 主题位置固定在底部，稍微上移
  const topicYPosition = 1420;

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

        {/* 装饰性背景图案 - 铺满背景 */}
        <g opacity="0.04">
          {/* 生成多行多列福字铺满背景 */}
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <text
                key={`${row}-${col}`}
                x={150 + col * 300}
                y={180 + row * 350}
                fontSize={180}
                fill={colors.red}
                fontFamily="Noto Serif SC, serif"
                textAnchor="middle"
              >
                福
              </text>
            ))
          )}
        </g>

        {/* 横批区域 */}
        <HorizontalScroll
          text={data.horizontalScroll || ''}
          x={600}
          y={130}
          width={500}
          height={120}
          direction={horizontalDirection as 'leftToRight' | 'rightToLeft'}
        />

        {/* 对联区域 */}
        <g transform="translate(0, 290)">
          {/* 左联 */}
          <Couplet
            text={leftCoupletText || ''}
            x={260}
            y={0}
            width={140}
            height={leftParams.height}
            params={leftParams}
            label={isLeftUpper ? '上联' : '下联'}
          />
          {/* 右联 */}
          <Couplet
            text={rightCoupletText || ''}
            x={940}
            y={0}
            width={140}
            height={rightParams.height}
            params={rightParams}
            label={isLeftUpper ? '下联' : '上联'}
          />
          {/* 福字区域（中间） */}
          <g transform={`translate(600, ${fuYPosition})`}>
            <FuCharacter 
              x={-90} 
              y={0} 
              orientation={fuOrientation as 'upright' | 'inverted'} 
              parentRotation={fuRotation}
            />
            <FuCharacter 
              x={90} 
              y={0} 
              orientation={fuOrientation as 'upright' | 'inverted'} 
              parentRotation={fuRotation}
            />
          </g>
        </g>

        {/* 挥春区域 */}
        {data.springScrolls && data.springScrolls.length > 0 && (
          <SpringScrolls texts={data.springScrolls} x={600} y={scrollsYPosition} />
        )}

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
          <text
            x={0}
            y={32}
            fontSize={16}
            fill={colors.goldDark}
            fontFamily="Noto Sans SC, sans-serif"
            textAnchor="middle"
          >
            横批：{data.horizontalScroll || ''}
          </text>
          <text
            x={0}
            y={58}
            fontSize={16}
            fill={colors.goldDark}
            fontFamily="Noto Sans SC, sans-serif"
            textAnchor="middle"
          >
            上联：{data.upperCouplet || ''}
          </text>
          <text
            x={0}
            y={84}
            fontSize={16}
            fill={colors.goldDark}
            fontFamily="Noto Sans SC, sans-serif"
            textAnchor="middle"
          >
            下联：{data.lowerCouplet || ''}
          </text>
        </g>
      </svg>

      <button className="download-btn" onClick={handleDownload}>
        保存图片
      </button>
    </div>
  );
}
