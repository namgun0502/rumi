// TileSet.jsx - 보드 위에 올려진 타일 세트를 정렬하여 표시하는 컴포넌트입니다.
// 그룹(Group) 및 런(Run) 규칙에 따라 세트 내부 타일들을 자동으로 예쁘게 정렬합니다.

import React from 'react';
import Tile from './Tile';
import { isValidSet, isValidGroup, isValidRun } from '../utils/ruleEngine';

/**
 * 세트 내부 타일들을 규칙에 맞게 자동 정렬하는 도우미 함수
 */
function sortSetTiles(tiles) {
  if (!tiles || tiles.length === 0) return [];
  const sorted = [...tiles];

  // 1. 런(Run)인 경우: 같은 색상이므로 숫자 오름차순 정렬 (조커 고려)
  if (isValidRun(sorted)) {
    const colorOrder = { red: 1, blue: 2, orange: 3, black: 4 };
    return sorted.sort((a, b) => {
      if (a.isJoker) return 1;
      if (b.isJoker) return -1;
      return a.number - b.number;
    });
  }

  // 2. 그룹(Group)인 경우: 같은 숫지이므로 색상 순서(Red -> Blue -> Orange -> Black)로 정렬
  if (isValidGroup(sorted)) {
    const colorOrder = { red: 1, blue: 2, orange: 3, black: 4 };
    return sorted.sort((a, b) => {
      if (a.isJoker) return 1;
      if (b.isJoker) return -1;
      return (colorOrder[a.color] || 99) - (colorOrder[b.color] || 99);
    });
  }

  // 일반 타일 정렬 (숫자순 -> 색상순)
  const colorOrder = { red: 1, blue: 2, orange: 3, black: 4 };
  return sorted.sort((a, b) => {
    if (a.isJoker) return 1;
    if (b.isJoker) return -1;
    if (a.number !== b.number) return a.number - b.number;
    return (colorOrder[a.color] || 99) - (colorOrder[b.color] || 99);
  });
}

export default function TileSet({ setObj, onTileDragStart, onTileClick, onSetDrop }) {
  const rawTiles = setObj.tiles || [];
  
  // 보드 세트 타일 자동 정렬 적용!
  const sortedTiles = sortSetTiles(rawTiles);
  const valid = isValidSet(sortedTiles);

  const handleDragOver = (e) => {
    e.preventDefault();
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
      {sortedTiles.map((tile) => (
        <Tile
          key={tile.id}
          tile={tile}
          onDragStart={(e) => onTileDragStart && onTileDragStart(e, tile, setObj.id)}
          onClick={(t) => onTileClick && onTileClick(t, setObj.id)}
          size="medium"
        />
      ))}

      {!valid && (
        <span className="text-xs font-bold text-rose-400 px-1 animate-pulse">
          ⚠️ 3장 이상 필요
        </span>
      )}
    </div>
  );
}
