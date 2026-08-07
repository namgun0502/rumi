// aiPlayer.js - 루미큐브 AI 플레이어의 의사결정 및 조합 탐색 알고리즘입니다.
// 남건이 코드를 이해하기 쉽도록 친절한 한글 주석을 다 달아두었습니다.

import { 
  isValidGroup, 
  isValidRun, 
  calculateSetScore 
} from './ruleEngine';

/**
 * AI 플레이어의 턴 행동을 결정하는 강화된 함수
 */
export function makeAiMove(aiPlayer, currentBoard) {
  const rack = [...aiPlayer.rack];
  // 보드에서 타일이 없는 빈 세트 객체들을 깨끗하게 정리합니다.
  const cleanBoard = (currentBoard || []).filter(s => s.tiles && s.tiles.length > 0);

  // 1. 손패에서 만들 수 있는 모든 유효 세트 탐색
  const possibleSets = findAllPossibleSetsFromRack(rack);

  if (possibleSets.length === 0) {
    return { action: 'draw' };
  }

  // 2. 첫 등록(Initial Meld)을 안 한 경우 -> 합산 30점 이상 조합 탐색
  if (!aiPlayer.hasRegistered) {
    const meldCombo = findBest30PointCombo(possibleSets);
    if (meldCombo && meldCombo.length > 0) {
      const playedTileIds = new Set(meldCombo.flatMap(s => s.map(t => t.id)));
      const newRack = rack.filter(t => !playedTileIds.has(t.id));
      
      const newBoard = [
        ...cleanBoard,
        ...meldCombo.map((tiles, idx) => ({ 
          id: `set_ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`, 
          tiles 
        }))
      ];

      return {
        action: 'play',
        newBoard,
        newRack,
        justRegistered: true
      };
    } else {
      return { action: 'draw' };
    }
  }

  // 3. 이미 등록을 마친 경우: 한 턴에 내려놓을 수 있는 최선의 다중 세트 조합 탐색 (패 털어내기 극대화)
  const bestMultiSetCombo = findMaxTileCombination(possibleSets);

  if (bestMultiSetCombo && bestMultiSetCombo.length > 0) {
    const playedTileIds = new Set(bestMultiSetCombo.flatMap(s => s.map(t => t.id)));
    const newRack = rack.filter(t => !playedTileIds.has(t.id));
    
    const newBoard = [
      ...cleanBoard,
      ...bestMultiSetCombo.map((tiles, idx) => ({ 
        id: `set_ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`, 
        tiles 
      }))
    ];

    return {
      action: 'play',
      newBoard,
      newRack,
      justRegistered: false
    };
  }

  return { action: 'draw' };
}

/**
 * 손패(Rack)에서 만들 수 있는 모든 가능한 유효 세트(3장~6장) 탐색
 */
function findAllPossibleSetsFromRack(rack) {
  const sets = [];
  const n = rack.length;

  for (let len = 3; len <= Math.min(n, 6); len++) {
    const combinations = getCombinations(rack, len);
    for (const combo of combinations) {
      if (isValidGroup(combo) || isValidRun(combo)) {
        sets.push(combo);
      }
    }
  }

  return sets;
}

/**
 * 중복 타일 없이 가장 많은 타일을 한 번에 털어낼 수 있는 다중 세트 조합 탐색 (AI 카드 털기 최적화)
 */
function findMaxTileCombination(allPossibleSets) {
  if (allPossibleSets.length === 0) return [];

  let bestCombo = [allPossibleSets[0]];
  let maxTileCount = allPossibleSets[0].length;

  // 1개 단일 세트 최댓값
  for (const set of allPossibleSets) {
    if (set.length > maxTileCount) {
      maxTileCount = set.length;
      bestCombo = [set];
    }
  }

  // 2개 세트 동시 조합
  for (let i = 0; i < allPossibleSets.length; i++) {
    for (let j = i + 1; j < allPossibleSets.length; j++) {
      const setA = allPossibleSets[i];
      const setB = allPossibleSets[j];

      const idsA = new Set(setA.map(t => t.id));
      const hasOverlap = setB.some(t => idsA.has(t.id));

      if (!hasOverlap) {
        const totalLen = setA.length + setB.length;
        if (totalLen > maxTileCount) {
          maxTileCount = totalLen;
          bestCombo = [setA, setB];
        }
      }
    }
  }

  return bestCombo;
}

/**
 * 첫 등록 30점 조건 만족 최선의 조합
 */
function findBest30PointCombo(allPossibleSets) {
  // 1개 세트로 30점 이상
  for (const set of allPossibleSets) {
    if (calculateSetScore(set) >= 30) {
      return [set];
    }
  }

  // 2개 세트 조합으로 30점 이상
  for (let i = 0; i < allPossibleSets.length; i++) {
    for (let j = i + 1; j < allPossibleSets.length; j++) {
      const setA = allPossibleSets[i];
      const setB = allPossibleSets[j];

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
