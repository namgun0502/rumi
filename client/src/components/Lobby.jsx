// Lobby.jsx - 실시간 멀티플레이 대기실을 제거하고, AI 대전을 바로 시작할 수 있는 대기실 화면입니다.

import React, { useState } from 'react';
import { Bot, Play, Sparkles } from 'lucide-react';

export default function Lobby({ onStartGame }) {
  const [playerName, setPlayerName] = useState('남건');
  const [aiCount, setAiCount] = useState(3); // 대전할 AI 인원수 (기본 3명, 총 4인 게임)

  const handleStart = () => {
    if (!playerName.trim()) return alert('닉네임을 입력해 주세요!');
    onStartGame(playerName, aiCount);
  };

  return (
    <div className="min-h-screen bg-table flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-emerald-950/85 backdrop-blur-xl border-2 border-emerald-700/60 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6">

        {/* 메인 타이틀 */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-amber-300 tracking-tight flex items-center justify-center gap-2 mb-2">
            🎲 루미큐브 🎲
          </h1>
          <p className="text-sm text-emerald-200/80">스마트 AI 대전 웹 앱</p>
        </div>

        {/* 1. 닉네임 입력 */}
        <div className="w-full">
          <label className="block text-xs font-bold text-emerald-300 mb-1.5 px-1">
            👤 플레이어 닉네임
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="
              w-full px-4 py-3 rounded-2xl bg-emerald-900/60 border-2 border-emerald-700
              text-white font-bold placeholder-emerald-500 focus:outline-none focus:border-amber-400
              transition-all
            "
          />
        </div>

        {/* 2. 대전 상대 AI 수 선택 */}
        <div className="w-full">
          <label className="block text-xs font-bold text-emerald-300 mb-1.5 px-1">
            🤖 AI 상대 선택
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setAiCount(count)}
                className={`
                  py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer
                  ${aiCount === count
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black scale-105'
                    : 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50 hover:bg-emerald-800/60'
                  }
                `}
              >
                AI {count}명 ({count + 1}인전)
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-emerald-800/60 my-1" />

        {/* 게임 시작 버튼 */}
        <button
          onClick={handleStart}
          className="
            w-full py-4 rounded-2xl font-black text-lg text-slate-950
            bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400
            hover:from-amber-300 hover:to-yellow-300
            shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-200 active:scale-98
            flex items-center justify-center gap-2 cursor-pointer
          "
        >
          <Play className="w-6 h-6 fill-current" /> AI 대전 시작하기
        </button>

        <p className="text-xs text-center text-emerald-400/60 pt-2">
          © 2026 남건의 루미큐브 앱. All rights reserved.
        </p>

      </div>
    </div>
  );
}
