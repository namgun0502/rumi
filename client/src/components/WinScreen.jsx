// WinScreen.jsx - 누군가가 모든 패를 털어내고 게임에 승리했을 때 축하 효과와 함께 정산 화면을 보여줍니다.

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw } from 'lucide-react';

export default function WinScreen({ winner, room, onRestart }) {
  useEffect(() => {
    // 승리 시 폭축 애니메이션 3회 터뜨리기
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-emerald-950 border-4 border-amber-400 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-6 animate-bounce-once">

        <div className="w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-amber-300">
          <Trophy className="w-12 h-12 animate-pulse" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-amber-300 mb-1">
            🎉 {winner?.name} 승리! 🎉
          </h2>
          <p className="text-sm text-emerald-200/80">
            모든 손패를 완벽히 털어내고 루미큐브 완성!
          </p>
        </div>

        {/* 플레이어별 남아있는 패 점수 정산 리스트 */}
        <div className="w-full bg-emerald-900/60 rounded-2xl p-4 border border-emerald-700/50 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-emerald-300 text-left mb-1">📊 플레이어 점수 정산</h3>
          {room?.players.map((p) => {
            const remainingCount = p.rack?.length || 0;
            return (
              <div key={p.id} className="flex justify-between items-center text-sm font-semibold">
                <span className="text-emerald-100">{p.name}</span>
                <span className={remainingCount === 0 ? 'text-amber-400 font-bold' : 'text-rose-400'}>
                  {remainingCount === 0 ? '🏆 0장 (승리)' : `남은 패: ${remainingCount}장`}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onRestart}
          className="
            w-full py-4 rounded-2xl font-black text-slate-950 bg-amber-400 hover:bg-amber-300
            transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg
          "
        >
          <RotateCcw className="w-5 h-5" /> 메인 로비로 돌아가기
        </button>

      </div>
    </div>
  );
}
