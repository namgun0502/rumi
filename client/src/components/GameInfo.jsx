// GameInfo.jsx - 게임 보드 상단 정보창 및 단축키 버튼 바입니다.
// 남건이 쉽게 이해할 수 있도록 상세한 한글 주석을 추가했습니다.

import React from 'react';
import { ArrowRightLeft, RotateCcw, CheckCircle, ShieldAlert } from 'lucide-react';

export default function GameInfo({
  players,
  currentTurnIndex,
  myPlayerId,
  deckLength,
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
          <span className="text-xl font-black text-amber-300 tracking-wider mr-2 flex items-center gap-1.5">
            🎲 루미큐브
          </span>
          
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

        {/* 3. 액션 버튼 (Q: 되돌리기 / Space: 턴 완료) */}
        <div className="flex items-center gap-2">
          {/* Q 키: 되돌리기 (Undo) */}
          <button
            onClick={onUndo}
            disabled={!isMyTurn}
            className="
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40
              border border-slate-600 transition-all active:scale-95 cursor-pointer relative group
            "
            title="단축키: Q (이번 턴에 이동한 패 원상복구)"
          >
            <RotateCcw className="w-4 h-4" /> 
            <span>되돌리기</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-700 text-amber-300 rounded border border-slate-500">Q</kbd>
          </button>

          {/* Space 키: 턴 완료 (내놓은 패가 없을 시 자동으로 타일 1장 뽑기) */}
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
            title="단축키: Space (스페이스바) 또는 Enter / E"
          >
            <ArrowRightLeft className="w-4 h-4" /> 
            <span>턴 완료</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-800 text-emerald-200 rounded border border-emerald-500">Space</kbd>
          </button>
        </div>

      </div>
    </div>
  );
}
