// GameInfo.jsx - 게임 보드 상단 정보창 및 턴 관리 버튼 바입니다.

import React from 'react';
import { ArrowRightLeft, RotateCcw, Plus, CheckCircle, ShieldAlert } from 'lucide-react';

export default function GameInfo({
  players,
  currentTurnIndex,
  myPlayerId,
  deckLength,
  onDrawTile,
  onSubmitTurn,
  onUndo,
  isMyTurn
}) {
  const me = players.find(p => p.id === myPlayerId);

  return (
    <div className="w-full bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/60 p-4 shadow-xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* 1. 타이틀 & 플레이어 현황 */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-amber-300 tracking-wider mr-2">🎲 루미큐브</span>
          
          <div className="flex items-center gap-2">
            {players.map((p, idx) => {
              const isTurn = idx === currentTurnIndex;
              const isMe = p.id === myPlayerId;
              return (
                <div
                  key={p.id}
                  className={`
                    px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 border
                    ${isTurn 
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                      : 'bg-emerald-900/40 text-emerald-200 border-emerald-800/40'
                    }
                  `}
                >
                  <span className="text-sm">
                    {p.isAI ? '🤖' : '👤'} {p.name} {isMe && '(나)'}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/30 text-white font-bold">
                    {p.rack?.length || 0}장
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. 남은 덱 & 30점 등록 상태 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/40 text-xs font-bold text-emerald-200">
            <span>📦 남은 덱:</span>
            <span className="text-amber-400 text-sm font-black">{deckLength}장</span>
          </div>

          {me && (
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border
              ${me.hasRegistered
                ? 'bg-emerald-800/40 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
              }
            `}>
              {me.hasRegistered ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>30점 등록 완료</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>첫 등록 (30점 필요)</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. 액션 버튼 (내 턴일 때 활성화) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!isMyTurn}
            className="
              flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold
              bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40
              border border-slate-600 transition-all active:scale-95 cursor-pointer
            "
            title="턴 시작 시점 보드 상태로 초기화"
          >
            <RotateCcw className="w-4 h-4" /> 되돌리기
          </button>

          <button
            onClick={onDrawTile}
            disabled={!isMyTurn}
            className="
              flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
              bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-40
              border border-amber-400/50 transition-all active:scale-95 shadow-md cursor-pointer
            "
          >
            <Plus className="w-4 h-4" /> 1장 뽑기 (패스)
          </button>

          <button
            onClick={onSubmitTurn}
            disabled={!isMyTurn}
            className={`
              flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-black transition-all active:scale-95 shadow-lg cursor-pointer
              ${isMyTurn
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white ring-2 ring-emerald-300 animate-bounce'
                : 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 opacity-40 cursor-not-allowed'
              }
            `}
          >
            <ArrowRightLeft className="w-4 h-4" /> 턴 완료
          </button>
        </div>

      </div>
    </div>
  );
}
