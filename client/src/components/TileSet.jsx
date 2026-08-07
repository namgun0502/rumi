// TileSet.jsx - 보드 위 세트 타일을 규칙 및 스마트 조커 위치에 맞게 정렬하는 컴포넌트입니다.

import React from 'react';
import Tile from './Tile';
import { isValidSet, isValidGroup, isValidRun } from '../utils/ruleEngine';

/**
 * 런/그룹 규칙 및 조커 수열 위치에 따른 스마트 세트 정렬 함수
 */
function sortSetTiles(tiles) {
  if (!tiles || tiles.length === 0) return [];
  const sorted = [...tiles];

  // 1. 런(Run)인 경우: 같은 색상의 숫자 연속 세트
  if (isValidRun(sorted)) {
    const regularTiles = sorted.filter(t => !t.isJoker).sort((a, b) => a.number - b.number);
    const jokers = sorted.filter(t => t.isJoker);

    if (regularTiles.length === 0) return sorted;

    const result = [];
    let jokerIdx = 0;

    for (let i = 0; i < regularTiles.length; i++) {
      result.push(regularTiles[i]);

      if (i < regularTiles.length - 1) {
        const gap = regularTiles[i + 1].number - regularTiles[i].number;
        // 연속 숫자 중간 구멍(gap > 1, 예: 11과 13 사이)에 조커 배치!
        for (let g = 1; g < gap && jokerIdx < jokers.length; g++) {
          result.push(jokers[jokerIdx++]);
        }
      }
    }

    // 남아있는 조커는 뒤(또는 앞)에 붙이기
    while (jokerIdx < jokers.length) {
      result.push(jokers[jokerIdx++]);
    }

    return result;
  }

  // 2. 그룹(Group)인 경우: 같은 숫자, 다른 색상 (Red -> Blue -> Orange -> Black)
  if (isValidGroup(sorted)) {
    const colorOrder = { red: 1, blue: 2, orange: 3, black: 4 };
    return sorted.sort((a, b) => {
      if (a.isJoker) return 1;
      if (b.isJoker) return -1;
      return (colorOrder[a.color] || 99) - (colorOrder[b.color] || 99);
    });
  }

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
