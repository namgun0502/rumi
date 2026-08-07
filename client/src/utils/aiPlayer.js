// aiPlayer.js - 클라이언트 브라우저 내부에서 바로 구동되는 AI 대전 상대의 턴 처리 알고리즘입니다.
// 남건이 로직을 이해하기 쉽도록 친절한 한글 주석을 달았습니다.

import { 
  isValidGroup, 
  isValidRun, 
  calculateSetScore 
} from './ruleEngine';

/**
 * AI 플레이어의 턴 행동을 결정하는 함수
 * @param {Object} aiPlayer - AI 플레이어 객체 ({ id, name, rack, hasRegistered })
 * @param {Array} currentBoard - 현재 보드 상태
 * @returns {Object} - { action: 'play' | 'draw', newBoard: Array, newRack: Array, justRegistered: boolean }
 */
export function makeAiMove(aiPlayer, currentBoard) {
  const rack = [...aiPlayer.rack];
  const board = JSON.parse(JSON.stringify(currentBoard));

  // 1. 현재 AI 손패에서 만들 수 있는 모든 유효 세트(3장 이상 그룹/런) 탐색
  const possibleSets = findPossibleSetsFromRack(rack);

  if (possibleSets.length === 0) {
    // 낼 수 있는 조합이 없으면 타일 1장 뽑기 (Draw)
    return { action: 'draw' };
  }

  // 2. 첫 등록(Initial Meld)을 아직 안 한 경우 -> 합산 30점 이상 조건 확인
  if (!aiPlayer.hasRegistered) {
    const meldCombo = find30PointCombo(possibleSets);
    if (meldCombo) {
      // 30점 이상 조합을 보드에 추가
      const playedTileIds = new Set(meldCombo.flatMap(s => s.map(t => t.id)));
      const newRack = rack.filter(t => !playedTileIds.has(t.id));
      
      const newBoard = [
        ...board,
        ...meldCombo.map((tiles, idx) => ({ id: `set_ai_${Date.now()}_${idx}`, tiles }))
      ];

      return {
        action: 'play',
        newBoard,
        newRack,
        justRegistered: true
      };
    } else {
      // 30점을 만들 수 없으므로 1장 뽑기
      return { action: 'draw' };
    }
  }

  // 3. 이미 등록을 완료한 경우 -> 점수가 가장 높은 세트를 내려놓음
  const bestSet = possibleSets[0];
  const playedTileIds = new Set(bestSet.map(t => t.id));
  const newRack = rack.filter(t => !playedTileIds.has(t.id));
  const newBoard = [
    ...board,
    { id: `set_ai_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, tiles: bestSet }
  ];

  return {
    action: 'play',
    newBoard,
    newRack,
    justRegistered: false
  };
}

/**
 * 손패에서 유효 세트 조합 구하기 (Greedy 점수 순 정렬)
 */
function findPossibleSetsFromRack(rack) {
  const sets = [];
  const n = rack.length;

  for (let len = 3; len <= Math.min(n, 5); len++) {
    const combinations = getCombinations(rack, len);
    for (const combo of combinations) {
      if (isValidGroup(combo) || isValidRun(combo)) {
        sets.push(combo);
      }
    }
  }

  // 점수가 높은 순으로 정렬
  sets.sort((a, b) => calculateSetScore(b) - calculateSetScore(a));
  return sets;
}

/**
 * 조합 도우미 함수
 */
function getCombinations(arr, selectNum) {
  const results = [];
  if (selectNum === 1) return arr.map(val => [val]);
  arr.forEach((fixed, index, origin) => {
    const rest = origin.slice(index + 1);
    const combinations = getCombinations(rest, selectNum - 1);
    const attached = combinations.map(combo => [fixed, ...combo]);
    results.push(...attached);
  });
  return results;
}

/**
 * 30점 이상이 되는 세트 조합 탐색
 */
function find30PointCombo(possibleSets) {
  // 단일 세트로 30점 이상
  for (const set of possibleSets) {
    if (calculateSetScore(set) >= 30) {
      return [set];
    }
  }

  // 2개 세트 조합으로 30점 이상
  for (let i = 0; i < possibleSets.length; i++) {
    for (let j = i + 1; j < possibleSets.length; j++) {
      const setA = possibleSets[i];
      const setB = possibleSets[j];

      const idsA = new Set(setA.map(t => t.id));
      const hasOverlap = setB.some(t => idsA.has(t.id));

      if (!hasOverlap) {
        const score = calculateSetScore(setA) + calculateSetScore(setB);
        if (score >= 30) {
          return [setA, setB];
        }
      }
    }
  }

  return null;
}
