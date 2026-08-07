// App.jsx - 정식 루미큐브 규칙(첫 등록 30점 순수 손패 검증)이 완벽 적용된 메인 앱입니다.
// 남건이 코드를 쉽게 이해할 수 있도록 친절한 한글 주석을 달았습니다.

import React, { useState, useEffect, useCallback } from 'react';

import Lobby from './components/Lobby';
import GameInfo from './components/GameInfo';
import GameBoard from './components/GameBoard';
import PlayerRack from './components/PlayerRack';
import WinScreen from './components/WinScreen';

import { generateFullDeck, shuffleDeck, sortTilesByColor } from './utils/tileFactory';
import { validateBoard, validateInitialMeld } from './utils/ruleEngine';
import { makeAiMove } from './utils/aiPlayer';

export default function App() {
  const [gamePhase, setGamePhase] = useState('lobby');

  const [players, setPlayers] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [deck, setDeck] = useState([]);
  const [winner, setWinner] = useState(null);

  const [localBoard, setLocalBoard] = useState([]);
  const [localRack, setLocalRack] = useState([]);
  const [turnSnapshot, setTurnSnapshot] = useState(null);

  const myPlayerId = 'human_player';

  // -------------------------------------------------------------
  // 1. 게임 시작 초기화
  // -------------------------------------------------------------
  const handleStartGame = (playerName, aiCount) => {
    const fullDeck = shuffleDeck(generateFullDeck());

    const initialRack = sortTilesByColor(fullDeck.splice(0, 14));

    const humanPlayer = {
      id: myPlayerId,
      name: playerName,
      rack: initialRack,
      hasRegistered: false,
      isAI: false,
    };

    const aiNames = ['알파큐브🤖', '베타큐브🤖', '감마큐브🤖'];
    const aiPlayers = [];
    for (let i = 0; i < aiCount; i++) {
      aiPlayers.push({
        id: `ai_${i + 1}`,
        name: aiNames[i],
        rack: sortTilesByColor(fullDeck.splice(0, 14)),
        hasRegistered: false,
        isAI: true,
      });
    }

    const initialPlayers = [humanPlayer, ...aiPlayers];

    setDeck(fullDeck);
    setPlayers(initialPlayers);
    setLocalBoard([]);
    setLocalRack(initialRack);
    setCurrentTurnIndex(0);
    setWinner(null);
    setTurnSnapshot({ board: [], rack: JSON.parse(JSON.stringify(initialRack)) });
    setGamePhase('playing');
  };

  // -------------------------------------------------------------
  // 2. AI 턴 루프
  // -------------------------------------------------------------
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const currentP = players[currentTurnIndex];
    if (currentP && currentP.isAI) {
      const timer = setTimeout(() => {
        const move = makeAiMove(currentP, localBoard);

        if (move.action === 'play') {
          setLocalBoard(move.newBoard);

          setPlayers(prev => prev.map((p, idx) => {
            if (idx === currentTurnIndex) {
              return {
                ...p,
                rack: sortTilesByColor(move.newRack),
                hasRegistered: move.justRegistered ? true : p.hasRegistered
              };
            }
            return p;
          }));

          if (move.newRack.length === 0) {
            setWinner(currentP);
            setGamePhase('ended');
            return;
          }
        } else {
          if (deck.length > 0) {
            const newDeck = [...deck];
            const drawnTile = newDeck.pop();
            setDeck(newDeck);

            setPlayers(prev => prev.map((p, idx) => {
              if (idx === currentTurnIndex) {
                return { ...p, rack: sortTilesByColor([...p.rack, drawnTile]) };
              }
              return p;
            }));
          }
        }

        moveToNextTurn();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [currentTurnIndex, gamePhase]);

  const moveToNextTurn = () => {
    setPlayers(prevPlayers => {
      const nextIndex = (currentTurnIndex + 1) % prevPlayers.length;
      setCurrentTurnIndex(nextIndex);

      if (prevPlayers[nextIndex].id === myPlayerId) {
        const sortedRack = sortTilesByColor(prevPlayers[nextIndex].rack);
        setLocalRack(sortedRack);

        setTurnSnapshot({
          board: JSON.parse(JSON.stringify(localBoard)),
          rack: JSON.parse(JSON.stringify(sortedRack))
        });
      }
      return prevPlayers;
    });
  };

  // -------------------------------------------------------------
  // 3. 플레이어 턴 컨트롤 (되돌리기 / 턴 제출 및 자동 1장 드로우)
  // -------------------------------------------------------------

  // 이번 턴 시작 시의 판과 손패로 되돌립니다.
  const handleUndo = useCallback(() => {
    if (!turnSnapshot) return;
    setLocalBoard(JSON.parse(JSON.stringify(turnSnapshot.board)));
    setLocalRack(sortTilesByColor(JSON.parse(JSON.stringify(turnSnapshot.rack))));
  }, [turnSnapshot]);

  // 패를 제출하지 않았을 때 자동으로 실행되는 1장 뽑기 함수입니다.
  const handleDrawTileInternal = useCallback(() => {
    if (players[currentTurnIndex]?.id !== myPlayerId) return;

    handleUndo();

    if (deck.length > 0) {
      const newDeck = [...deck];
      const drawnTile = newDeck.pop();
      setDeck(newDeck);

      const updatedRack = sortTilesByColor([...turnSnapshot.rack, drawnTile]);
      setLocalRack(updatedRack);

      setPlayers(prev => prev.map(p => {
        if (p.id === myPlayerId) {
          return { ...p, rack: updatedRack };
        }
        return p;
      }));
    }

    moveToNextTurn();
  }, [players, currentTurnIndex, myPlayerId, deck, turnSnapshot, handleUndo]);

  // 턴 완료 제출 처리 (첫 등록 30점 정밀 검증 포함)
  const handleSubmitTurn = useCallback(() => {
    if (players[currentTurnIndex]?.id !== myPlayerId) return;

    const originalRackIds = new Set(turnSnapshot.rack.map(t => t.id));
    const currentRackIds = new Set(localRack.map(t => t.id));
    
    // 이번 턴에 내 손패 개수와 구성이 동일한지 검사합니다.
    const isRackUnchanged = originalRackIds.size === currentRackIds.size && 
      [...originalRackIds].every(id => currentRackIds.has(id));

    // 아무것도 내지 않고 턴 완료 클릭/스페이스바 입력 시 -> 자동 1장 뽑고 턴 전환
    if (isRackUnchanged) {
      handleDrawTileInternal();
      return;
    }

    const cleanBoard = localBoard.filter(s => s.tiles && s.tiles.length > 0);

    // 보드 위 모든 세트가 3장 이상의 규칙에 맞는지 검사
    if (!validateBoard(cleanBoard)) {
      return alert('⚠️ 보드 위에 규칙에 맞지 않는 3장 미만 또는 무효 세트가 존재합니다!');
    }

    const me = players.find(p => p.id === myPlayerId);

    // 🔥 [핵심 오류 수정] 첫 등록 (Initial Meld) 30점 정확 판정 로직
    if (!me.hasRegistered) {
      const originalBoardSets = turnSnapshot.board || [];
      const originalBoardTileIds = new Set(
        originalBoardSets.flatMap(setObj => (setObj.tiles || []).map(t => t.id))
      );

      // 1. 첫 등록 전에는 기존 보드의 타일을 조합하거나 움직일 수 없습니다.
      // 보드에 놓여있던 기존 타일들이 훼손되었거나 조작되었는지 체크합니다.
      let isOldBoardModified = false;
      for (const oldSet of originalBoardSets) {
        // 기존 세트의 타일이 그대로 유지되었는지 확인
        const currentMatchingSet = cleanBoard.find(newSet => 
          newSet.tiles.length >= oldSet.tiles.length &&
          oldSet.tiles.every(oldTile => newSet.tiles.some(t => t.id === oldTile.id))
        );
        if (!currentMatchingSet) {
          isOldBoardModified = true;
          break;
        }
      }

      if (isOldBoardModified) {
        return alert('⚠️ 첫 등록 시에는 보드의 기존 타일을 건드리거나 분해할 수 없습니다!\n오직 내 손패(Rack) 타일만으로 30점 이상을 내려놓으세요.');
      }

      // 2. 오직 내 원래 손패(originalRackIds)의 타일들로만 이루어진 완전한 신규 세트들만 골라냅니다.
      const freshRackSets = cleanBoard.filter(setObj => 
        setObj.tiles.every(tile => originalRackIds.has(tile.id))
      );

      if (freshRackSets.length === 0) {
        return alert('⚠️ 첫 등록 시에는 본인 손패에서 새로운 완전한 세트를 최소 1개 이상 내려놓아야 합니다!');
      }

      // 3. 순수 손패 세트들의 점수 합계가 30점 이상인지 정밀 검증합니다.
      const isValidInitial = validateInitialMeld(freshRackSets.map(s => s.tiles));
      if (!isValidInitial) {
        return alert('⚠️ 첫 등록 시 내려놓는 패의 총 점수 합이 최소 30점 이상이어야 합니다!');
      }
    }

    // 30점 등록 조건을 만족했거나 이미 등록한 상태인 경우 플레이어 상태 업데이트
    setPlayers(prev => prev.map(p => {
      if (p.id === myPlayerId) {
        return {
          ...p,
          rack: sortTilesByColor(localRack),
          hasRegistered: true
        };
      }
      return p;
    }));

    // 승리 조건: 내 손패 타일을 모두 소진함
    if (localRack.length === 0) {
      setWinner(me);
      setGamePhase('ended');
      return;
    }

    moveToNextTurn();
  }, [players, currentTurnIndex, myPlayerId, localBoard, localRack, turnSnapshot, handleDrawTileInternal]);

  // -------------------------------------------------------------
  // ⌨️ Q (되돌리기) 및 Space / E / Enter (턴 완료) 키보드 단축키 리스너
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (gamePhase !== 'playing') return;

      const isMyTurn = players[currentTurnIndex]?.id === myPlayerId;
      if (!isMyTurn) return;

      const key = e.key.toLowerCase();

      if (key === 'q') {
        e.preventDefault();
        handleUndo(); // Q: 되돌리기
      } else if (key === ' ' || e.key === 'Spacebar' || key === 'e' || key === 'enter') {
        e.preventDefault();
        handleSubmitTurn(); // Space / E / Enter: 턴 완료
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, players, currentTurnIndex, myPlayerId, handleSubmitTurn, handleUndo]);

  // -------------------------------------------------------------
  // 4. 드래그 앤 드롭 이벤트 처리
  // -------------------------------------------------------------

  const handleTileDragStart = (e, tile, fromSetId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ tile, fromSetId }));
  };

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

    setLocalRack(prev => sortTilesByColor([...prev, tile]));
  };

  if (gamePhase === 'lobby') {
    return <Lobby onStartGame={handleStartGame} />;
  }

  const isMyTurn = players[currentTurnIndex]?.id === myPlayerId;

  return (
    <div className="min-h-screen bg-table flex flex-col select-none">
      <GameInfo
        players={players}
        currentTurnIndex={currentTurnIndex}
        myPlayerId={myPlayerId}
        deckLength={deck.length}
        onSubmitTurn={handleSubmitTurn}
        onUndo={handleUndo}
        isMyTurn={isMyTurn}
      />

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
