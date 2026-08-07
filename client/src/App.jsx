// App.jsx - 아무것도 내지 않고 턴 완료 클릭 시 자동 1장 뽑기가 적용된 메인 앱입니다.
// 남건이 로직을 한눈에 알 수 있도록 친절한 한글 주석을 달았습니다.

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
  // 3. 플레이어 턴 컨트롤 (되돌리기 / 1장 뽑기 / 턴 제출)
  // -------------------------------------------------------------

  const handleUndo = useCallback(() => {
    if (!turnSnapshot) return;
    setLocalBoard(JSON.parse(JSON.stringify(turnSnapshot.board)));
    setLocalRack(sortTilesByColor(JSON.parse(JSON.stringify(turnSnapshot.rack))));
  }, [turnSnapshot]);

  // 타일 1장 뽑고 턴 넘기기
  const handleDrawTile = useCallback(() => {
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

  // 턴 제출 (아무것도 내지 않았을 시 자동 1장 뽑기 연동!)
  const handleSubmitTurn = useCallback(() => {
    if (players[currentTurnIndex]?.id !== myPlayerId) return;

    // 💡 감지: 턴 시작 시점 손패 개수와 현재 손패 개수가 같고, 보드 세트도 변화가 없는지 검사
    const originalRackIds = new Set(turnSnapshot.rack.map(t => t.id));
    const currentRackIds = new Set(localRack.map(t => t.id));
    
    const isRackUnchanged = originalRackIds.size === currentRackIds.size && 
      [...originalRackIds].every(id => currentRackIds.has(id));

    // 아무 패도 새로 내거나 가져오지 않았다면 -> 자동 1장 뽑기로 간주!
    if (isRackUnchanged) {
      handleDrawTile();
      return;
    }

    // 패를 내거나 변경한 경우: 정상 유효성 검사 수행
    const cleanBoard = localBoard.filter(s => s.tiles && s.tiles.length > 0);

    if (!validateBoard(cleanBoard)) {
      return alert('⚠️ 보드 위에 규칙에 맞지 않는 3장 미만의 세트가 존재합니다!');
    }

    const me = players.find(p => p.id === myPlayerId);

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

    if (localRack.length === 0) {
      setWinner(me);
      setGamePhase('ended');
      return;
    }

    moveToNextTurn();
  }, [players, currentTurnIndex, myPlayerId, localBoard, localRack, turnSnapshot, handleDrawTile]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (gamePhase !== 'playing') return;

      const isMyTurn = players[currentTurnIndex]?.id === myPlayerId;
      if (!isMyTurn) return;

      const key = e.key.toLowerCase();

      if (key === ' ' || key === 'enter') {
        e.preventDefault();
        handleSubmitTurn();
      } else if (key === 'd') {
        e.preventDefault();
        handleDrawTile();
      } else if (key === 'z' || key === 'u') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, players, currentTurnIndex, myPlayerId, handleSubmitTurn, handleDrawTile, handleUndo]);

  // -------------------------------------------------------------
  // 4. 드래그 앤 드롭
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
        onDrawTile={handleDrawTile}
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
