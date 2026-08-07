// TileSet.jsx - 보드 위에 올려져 있는 타일 묶음(그룹 또는 런 세트)을 표시합니다.
// 루미큐브 규칙 유효성에 따라 실시간으로 초록 테두리(유효) 또는 빨간 테두리+shake(무효) 경고 효과를 제공합니다.

import React from 'react';
import Tile from './Tile';
import { isValidSet } from '../utils/ruleEngine';

export default function TileSet({ setObj, onTileDragStart, onTileClick, onSetDrop }) {
  const tiles = setObj.tiles || [];
  const valid = isValidSet(tiles);

  const handleDragOver = (e) => {
    e.preventDefault(); // 드롭 허용
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (onSetDrop) {
      onSetDrop(e, setObj.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        inline-flex items-center gap-1 p-2 rounded-2xl transition-all duration-200
        bg-black/30 backdrop-blur-sm border-2
        ${valid 
          ? 'border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
          : 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.3)] bg-rose-950/20'
        }
      `}
    >
      {tiles.map((tile) => (
        <Tile
          key={tile.id}
          tile={tile}
          onDragStart={(e) => onTileDragStart && onTileDragStart(e, tile, setObj.id)}
          onClick={(t) => onTileClick && onTileClick(t, setObj.id)}
          size="medium"
        />
      ))}

      {/* 무효 세트 경고 아이콘 / 메시지 */}
      {!valid && (
        <span className="text-xs font-bold text-rose-400 px-1 animate-pulse">
          ⚠️ 3장 이상 필요
        </span>
      )}
    </div>
  );
}
