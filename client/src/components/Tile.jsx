// Tile.jsx - 개별 루미큐브 패(Tile)를 그려주는 컴포넌트입니다.
// 드래그 앤 드롭 기능과 고급 3D 플라스틱 패 디자인이 적용되어 있습니다.

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Tile({ tile, onDragStart, onClick, isSelected, size = 'medium' }) {
  if (!tile) return null;

  // 1. 타일 색상 매핑 (루미큐브 4대 대표 색상)
  const colorMap = {
    red: 'text-red-600 border-red-200',
    blue: 'text-blue-600 border-blue-200',
    orange: 'text-amber-500 border-amber-200',
    black: 'text-gray-900 border-gray-300',
  };

  // 2. 크기별 스타일 (모바일과 PC 대응)
  const sizeClasses = {
    small: 'w-8 h-12 text-base font-bold rounded',
    medium: 'w-11 h-16 text-xl font-black rounded-lg',
    large: 'w-14 h-20 text-2xl font-black rounded-xl',
  }[size] || 'w-11 h-16 text-xl font-black rounded-lg';

  const textColorClass = tile.isJoker ? '' : (colorMap[tile.color] || 'text-gray-900');

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, tile)}
      onClick={() => onClick && onClick(tile)}
      className={`
        relative inline-flex flex-col items-center justify-between p-1.5 cursor-grab active:cursor-grabbing
        bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200
        border-2 ${textColorClass}
        tile-shadow tile-hover transition-all duration-150 select-none
        ${sizeClasses}
        ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-2 z-10' : ''}
      `}
    >
      {/* 타일 상단 구석 색상 닷 표시 */}
      {!tile.isJoker && (
        <div 
          className="w-2 h-2 rounded-full self-start" 
          style={{ 
            backgroundColor: 
              tile.color === 'red' ? '#dc2626' : 
              tile.color === 'blue' ? '#2563eb' : 
              tile.color === 'orange' ? '#f59e0b' : '#111827' 
          }} 
        />
      )}

      {/* 중앙 숫자 또는 조커 아이콘 */}
      <div className="flex-1 flex items-center justify-center">
        {tile.isJoker ? (
          <div className="flex flex-col items-center justify-center text-amber-600 animate-pulse">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span className="text-[10px] font-bold tracking-tighter text-purple-800">JOKER</span>
          </div>
        ) : (
          <span>{tile.number}</span>
        )}
      </div>

      {/* 하단 미세 장식 선 */}
      <div className="w-full h-1 bg-amber-300/40 rounded-full" />
    </div>
  );
}
