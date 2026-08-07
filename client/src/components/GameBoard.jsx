// GameBoard.jsx - 테이블 중앙의 보드 판 영역입니다.
// 플레이어들이 내려놓거나 재배치한 타일 세트들이 펼쳐집니다.

import React from 'react';
import TileSet from './TileSet';

export default function GameBoard({ board, onTileDragStart, onTileClick, onBoardDrop, onSetDrop }) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (onBoardDrop) {
      onBoardDrop(e);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="
        flex-1 w-full min-h-[360px] p-6 rounded-3xl
        bg-table border-4 border-emerald-900/60
        shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)]
        overflow-y-auto flex flex-wrap gap-4 items-start content-start
        relative transition-all duration-300
      "
    >
      {/* 보드가 비어있을 때 안내 텍스트 */}
      {(!board || board.length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-200/40 pointer-events-none">
          <p className="text-2xl font-bold mb-2">🎲 루미큐브 테이블 🎲</p>
          <p className="text-sm">손패(Rack)에서 타일을 드래그하여 이곳에 30점 이상 첫 등록을 내려놓으세요!</p>
        </div>
      )}

      {/* 보드 위 세트 묶음 렌더링 */}
      {board && board.map((setObj) => (
        <TileSet
          key={setObj.id}
          setObj={setObj}
          onTileDragStart={onTileDragStart}
          onTileClick={onTileClick}
          onSetDrop={onSetDrop}
        />
      ))}
    </div>
  );
}
