// App.jsx - 실시간 백엔드 서버 없이 브라우저 내에서 100% 동작하는 루미큐브 AI 대전 메인 앱입니다.
// 남건이 코드를 완전히 이해할 수 있도록 구체적인 한글 주석을 달았습니다.

import React, { useState, useEffect } from 'react';

import Lobby from './components/Lobby';
import GameInfo from './components/GameInfo';
import GameBoard from './components/GameBoard';
import PlayerRack from './components/PlayerRack';
import WinScreen from './components/WinScreen';

import { generateFullDeck, shuffleDeck } from './utils/tileFactory';
import { validateBoard, validateInitialMeld } from './utils/ruleEngine';
import { makeAiMove } from './utils/aiPlayer';

export default function App() {
  // 게임 진행 상태 관리 (lobby, playing, ended)
  const [gamePhase, setGamePhase] = useState('lobby');

  // 전체 플레이어 목록 (나 + AI 플레이어들)
  const [players, setPlayers] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [deck, setDeck] = useState([]);
  const [winner, setWinner] = useState(null);

  // 로컬 드래그 앤 드롭 편집용 상태 (현재 턴 수정 중인 보드와 내 손패)
  const [localBoard, setLocalBoard] = useState([]);
  const [localRack, setLocalRack] = useState([]);
  const [turnSnapshot, setTurnSnapshot] = useState(null); // 되돌리기용

  const myPlayerId = 'human_player';

  // -------------------------------------------------------------
  // 게임 시작 로직 (AI 대전 초기화)
  // -------------------------------------------------------------
  const handleStartGame = (playerName, aiCount) => {
    const fullDeck = shuffleDeck(generateFullDeck());

    // 1. 나(human) 플레이어 생성
    const humanPlayer = {
      id: myPlayerId,
      name: playerName,
      rack: fullDeck.splice(0, 14), // 초반 14장 지급
      hasRegistered: false,
      isAI: false,
    };

    // 2. 선택한 수만큼 AI 플레이어 생성
    const aiNames = ['알파큐브🤖', '베타큐브🤖', '감마큐브🤖'];
    const aiPlayers = [];
    for (let i = 0; i < aiCount; i++) {
      aiPlayers.push({
        id: `ai_${i + 1}`,
        name: aiNames[i],
        rack: fullDeck.splice(0, 14),
        hasRegistered: false,
        isAI: true,
      });
    }

    const initialPlayers = [humanPlayer, ...aiPlayers];

    setDeck(fullDeck);
    setPlayers(initialPlayers);
    setLocalBoard([]);
    setLocalRack(humanPlayer.rack);
    setCurrentTurnIndex(0); // 내가 첫 턴으로 시작
    setWinner(null);
    setTurnSnapshot({ board: [], rack: JSON.parse(JSON.stringify(humanPlayer.rack)) });
    setGamePhase('playing');
  };

  // -------------------------------------------------------------
  // AI 턴 자동 진행 루프 Effect
  // -------------------------------------------------------------
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const currentP = players[currentTurnIndex];
    if (currentP && currentP.isAI) {
      // AI 생각하는 시간 (1.2초) 연출
      const timer = setTimeout(() => {
        const move = makeAiMove(currentP, localBoard);

        if (move.action === 'play') {
          // AI가 패를 내려놓은 경우
          setLocalBoard(move.newBoard);

          // AI 손패 및 등록 상태 업데이트
          setPlayers(prev => prev.map((p, idx) => {
            if (idx === currentTurnIndex) {
              return {
                ...p,
                rack: move.newRack,
                hasRegistered: move.justRegistered ? true : p.hasRegistered
              };
            }
            return p;
          }));

          // AI 승리 조건 체크 (손패 0장)
          if (move.newRack.length === 0) {
            setWinner(currentP);
            setGamePhase('ended');
            return;
          }
        } else {
          // AI가 패를 내지 못해 1장 뽑는 경우
          if (deck.length > 0) {
            const newDeck = [...deck];
            const drawnTile = newDeck.pop();
            setDeck(newDeck);

            setPlayers(prev => prev.map((p, idx) => {
              if (idx === currentTurnIndex) {
                return { ...p, rack: [...p.rack, drawnTile] };
              }
              return p;
            }));
          }
        }

        // 다음 턴으로 이동
        moveToNextTurn();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [currentTurnIndex, gamePhase]);

  // 다음 턴으로 이동시키는 함수
  const moveToNextTurn = () => {
    setPlayers(prevPlayers => {
      const nextIndex = (currentTurnIndex + 1) % prevPlayers.length;
      setCurrentTurnIndex(nextIndex);

      // 내 턴이 돌아오면 스냅샷 저장
      if (prevPlayers[nextIndex].id === myPlayerId) {
        setTurnSnapshot({
          board: JSON.parse(JSON.stringify(localBoard)),
          rack: JSON.parse(JSON.stringify(prevPlayers[nextIndex].rack))
        });
      }
      return prevPlayers;
    });
  };

  // -------------------------------------------------------------
  // 내 턴 드래그 앤 드롭 및 버튼 컨트롤 로직
  // -------------------------------------------------------------

  const handleTileDragStart = (e, tile, fromSetId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ tile, fromSetId }));
  };

  // 보드 빈 공간에 타일 내려놓기
  const handleBoardDrop = (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    const { tile, fromSetId } = JSON.parse(dataStr);

    if (fromSetId === 'rack') {
      setLocalRack(prev => prev.filter(t => t.id !== tile.id));
      const newSetId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      setLocalBoard(prev => [...prev, { id: newSetId, tiles: [tile] }]);
    } else if (fromSetId) {
      let movedTile = null;
      const updatedBoard = localBoard.map(setObj => {
        if (setObj.id === fromSetId) {
          movedTile = setObj.tiles.find(t => t.id === tile.id);
          return { ...setObj, tiles: setObj.tiles.filter(t => t.id !== tile.id) };
        }
        return setObj;
      }).filter(s => s.tiles.length > 0);

      if (movedTile) {
        const newSetId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        setLocalBoard([...updatedBoard, { id: newSetId, tiles: [movedTile] }]);
      }
    }
  };

  // 보드의 세트에 타일 합치기
  const handleSetDrop = (e, targetSetId) => {
    e.preventDefault();
    e.stopPropagation();

    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    const { tile, fromSetId } = JSON.parse(dataStr);
    if (fromSetId === targetSetId) return;

    if (fromSetId === 'rack') {
      setLocalRack(prev => prev.filter(t => t.id !== tile.id));
      setLocalBoard(prev => prev.map(s => {
        if (s.id === targetSetId) {
          return { ...s, tiles: [...s.tiles, tile] };
        }
        return s;
      }));
    } else if (fromSetId) {
      let movedTile = null;
      let tempBoard = localBoard.map(s => {
        if (s.id === fromSetId) {
          movedTile = s.tiles.find(t => t.id === tile.id);
          return { ...s, tiles: s.tiles.filter(t => t.id !== tile.id) };
        }
        return s;
      }).filter(s => s.tiles.length > 0);

      if (movedTile) {
        setLocalBoard(tempBoard.map(s => {
          if (s.id === targetSetId) {
            return { ...s, tiles: [...s.tiles, movedTile] };
          }
          return s;
        }));
      }
    }
  };

  // 보드 타일을 다시 내 손패로 가져오기
  const handleRackDrop = (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    const { tile, fromSetId } = JSON.parse(dataStr);
    if (fromSetId === 'rack') return;

    setLocalBoard(prev => prev.map(s => {
      if (s.id === fromSetId) {
        return { ...s, tiles: s.tiles.filter(t => t.id !== tile.id) };
      }
      return s;
    }).filter(s => s.tiles.length > 0));

    setLocalRack(prev => [...prev, tile]);
  };

  // -------------------------------------------------------------
  // 플레이어 버튼 액션 (턴 제출 / 1장 뽑기 / 되돌리기)
  // -------------------------------------------------------------

  // 턴 시작 시점으로 초기화
  const handleUndo = () => {
    if (!turnSnapshot) return;
    setLocalBoard(JSON.parse(JSON.stringify(turnSnapshot.board)));
    setLocalRack(JSON.parse(JSON.stringify(turnSnapshot.rack)));
  };

  // 타일 1장 뽑고 턴 넘기기
  const handleDrawTile = () => {
    handleUndo(); // 보드 변경사항 되돌리고 1장 뽑기

    if (deck.length > 0) {
      const newDeck = [...deck];
      const drawnTile = newDeck.pop();
      setDeck(newDeck);

      const updatedRack = [...turnSnapshot.rack, drawnTile];
      setLocalRack(updatedRack);

      // 내 플레이어 상태 업데이트
      setPlayers(prev => prev.map(p => {
        if (p.id === myPlayerId) {
          return { ...p, rack: updatedRack };
        }
        return p;
      }));
    }

    moveToNextTurn();
  };

  // 턴 제출 (규칙 검증)
  const handleSubmitTurn = () => {
    const cleanBoard = localBoard.filter(s => s.tiles && s.tiles.length > 0);

    // 1. 전체 보드 세트의 규칙 유효성 검사
    if (!validateBoard(cleanBoard)) {
      return alert('⚠️ 보드 위에 규칙에 맞지 않는 3장 미만의 세트가 존재합니다!');
    }

    const me = players.find(p => p.id === myPlayerId);

    // 2. 첫 등록을 안 한 플레이어인 경우 30점 조건 검사
    if (!me.hasRegistered) {
      const oldBoard = turnSnapshot.board || [];
      const newSets = cleanBoard.filter(newSet => 
        !oldBoard.some(oldSet => oldSet.id === newSet.id)
      );

      if (newSets.length === 0) {
        return alert('⚠️ 첫 등록 시에는 손패에서 새로운 세트를 최소 1개 이상 내려놓아야 합니다!');
      }

      const isValidInitial = validateInitialMeld(newSets.map(s => s.tiles));
      if (!isValidInitial) {
        return alert('⚠️ 첫 등록 시 내려놓는 패의 총 점수 합이 최소 30점 이상이어야 합니다!');
      }
    }

    // 내 플레이어 상태 업데이트
    setPlayers(prev => prev.map(p => {
      if (p.id === myPlayerId) {
        return {
          ...p,
          rack: localRack,
          hasRegistered: true
        };
      }
      return p;
    }));

    // 승리 조건 검사 (내 손패 0장)
    if (localRack.length === 0) {
      setWinner(me);
      setGamePhase('ended');
      return;
    }

    moveToNextTurn();
  };

  // 1. 로비 화면
  if (gamePhase === 'lobby') {
    return <Lobby onStartGame={handleStartGame} />;
  }

  const isMyTurn = players[currentTurnIndex]?.id === myPlayerId;

  return (
    <div className="min-h-screen bg-table flex flex-col select-none">
      {/* 상단 HUD 헤더 */}
      <GameInfo
        players={players}
        currentTurnIndex={currentTurnIndex}
        myPlayerId={myPlayerId}
        deckLength={deck.length}
        onDrawTile={handleDrawTile}
        onSubmitTurn={handleSubmitTurn}
        onUndo={handleUndo}
        isMyTurn={isMyTurn}
      />

      {/* 중앙 보드 판 및 하단 손패 */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full flex flex-col justify-between gap-4">
        <GameBoard
          board={localBoard}
          onTileDragStart={handleTileDragStart}
          onBoardDrop={handleBoardDrop}
          onSetDrop={handleSetDrop}
        />

        <PlayerRack
          rack={localRack}
          setRack={setLocalRack}
          onTileDragStart={handleTileDragStart}
          onRackDrop={handleRackDrop}
        />
      </main>

      {/* 승리 모달 */}
      {gamePhase === 'ended' && winner && (
        <WinScreen
          winner={winner}
          room={{ players }}
          onRestart={() => setGamePhase('lobby')}
        />
      )}
    </div>
  );
}
