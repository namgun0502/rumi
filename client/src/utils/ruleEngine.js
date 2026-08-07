// ruleEngine.js - 루미큐브의 핵심 규칙(그룹, 런, 30점 첫 등록)을 검증하는 엔진입니다.
// 남건이 코드를 한눈에 이해할 수 있도록 친절한 한글 주석을 달았습니다.

/**
 * 1. 그룹(Group) 검증 함수
 * - 정의: 동일한 숫자, 서로 다른 색상의 타일 3개 또는 4개의 조합
 * - 예시: [빨강7, 파랑7, 검정7] (O), [빨강7, 파랑7, 파랑7] (X - 색상 중복)
 * - 조커는 어떤 색상의 숫자든 대신할 수 있습니다.
 */
export function isValidGroup(tiles) {
  if (!tiles || tiles.length < 3 || tiles.length > 4) return false;

  // 조커가 아닌 일반 타일들만 골라냅니다.
  const regularTiles = tiles.filter(t => !t.isJoker);

  // 전부 조커인 세트는 무효 처리
  if (regularTiles.length === 0) return false;

  // 모든 일반 타일의 숫자가 동일한지 검사합니다.
  const targetNumber = regularTiles[0].number;
  const isSameNumber = regularTiles.every(t => t.number === targetNumber);
  if (!isSameNumber) return false;

  // 색상이 중복되는지 검사합니다 (서로 다른 색상이어야 함).
  const colors = regularTiles.map(t => t.color);
  const uniqueColors = new Set(colors);
  if (colors.length !== uniqueColors.size) return false;

  return true;
}

/**
 * 2. 런(Run) 검증 함수
 * - 정의: 동일한 색상, 연속된 숫자의 타일 3개 이상의 조합
 * - 예시: [빨강3, 빨강4, 빨강5] (O), [빨강3, 빨강5, 빨강6] (X - 숫자가 튐)
 * - 조커는 빈 숫자 자리를 대신할 수 있습니다.
 */
export function isValidRun(tiles) {
  if (!tiles || tiles.length < 3) return false;

  // 조커가 아닌 일반 타일들만 골라냅니다.
  const regularTiles = tiles.filter(t => !t.isJoker);
  const jokerCount = tiles.length - regularTiles.length;

  // 일반 타일이 하나도 없으면 무효 처리
  if (regularTiles.length === 0) return false;

  // 모든 일반 타일의 색상이 동일한지 검사합니다.
  const targetColor = regularTiles[0].color;
  const isSameColor = regularTiles.every(t => t.color === targetColor);
  if (!isSameColor) return false;

  // 일반 타일을 숫자 순으로 정렬합니다.
  const sortedRegular = [...regularTiles].sort((a, b) => a.number - b.number);

  // 일반 타일 내에 중복 숫자가 있으면 런이 될 수 없습니다.
  for (let i = 0; i < sortedRegular.length - 1; i++) {
    if (sortedRegular[i].number === sortedRegular[i + 1].number) {
      return false;
    }
  }

  const minNum = sortedRegular[0].number;
  const maxNum = sortedRegular[sortedRegular.length - 1].number;

  const span = maxNum - minNum + 1; // 필요한 전체 연속 숫자 범위
  const missingCount = span - sortedRegular.length; // 중간에 빠진 숫자 개수

  // 중간에 빠진 숫자를 채우기에 조커 개수가 부족하면 무효
  if (missingCount > jokerCount) return false;

  const unusedJokers = jokerCount - missingCount;

  // 1~13 범위를 벗어나는지 확인
  if (span + unusedJokers > 13) return false;

  return true;
}

/**
 * 3. 단일 세트(그룹 또는 런) 유효성 검사 함수
 */
export function isValidSet(tiles) {
  if (!tiles || tiles.length < 3) return false;
  return isValidGroup(tiles) || isValidRun(tiles);
}

/**
 * 4. 세트의 점수(합산값)를 정확히 계산하는 함수 (30점 첫 등록 검증용)
 * - 조커는 완성된 그룹 또는 런에서 대체하는 진짜 숫자의 점수로 다 더해집니다.
 */
export function calculateSetScore(tiles) {
  if (!isValidSet(tiles)) return 0;

  const regularTiles = tiles.filter(t => !t.isJoker);
  
  // A. 그룹인 경우: 조커도 일반 타일과 동일한 숫자의 점수를 가집니다.
  if (isValidGroup(tiles)) {
    const groupNum = regularTiles[0].number;
    return groupNum * tiles.length;
  }

  // B. 런인 경우: 조커가 대체하는 연속된 숫자를 찾아 전체 합산합니다.
  if (isValidRun(tiles)) {
    const sortedRegular = [...regularTiles].sort((a, b) => a.number - b.number);
    const minNum = sortedRegular[0].number;
    const maxNum = sortedRegular[sortedRegular.length - 1].number;
    const jokerCount = tiles.length - regularTiles.length;

    // 중간에 비어있는 조커 개수 계산
    let missingCount = 0;
    for (let i = 0; i < sortedRegular.length - 1; i++) {
      missingCount += (sortedRegular[i + 1].number - sortedRegular[i].number - 1);
    }

    const unusedJokers = jokerCount - missingCount;

    // 조커를 1 미만이 되지 않는 선에서 앞으로 붙이고, 남으면 뒤로 붙입니다.
    let frontJokers = Math.min(unusedJokers, minNum - 1);
    
    // 시작 숫자 결정
    let startNum = minNum - frontJokers;

    // 첫 번째 타일(startNum)부터 타일 수만큼 연속된 숫자들의 합을 구합니다.
    let totalScore = 0;
    for (let i = 0; i < tiles.length; i++) {
      totalScore += (startNum + i);
    }
    return totalScore;
  }

  return 0;
}

/**
 * 5. 첫 등록(Initial Meld) 30점 조건 검증 함수
 * @param {Array} newMeldSets - 순수 손패로 구성된 새로 내놓은 세트들의 배열
 * @returns {boolean} - 점수 합이 30점 이상이고 모두 규칙에 맞는지 여부
 */
export function validateInitialMeld(newMeldSets) {
  if (!newMeldSets || newMeldSets.length === 0) return false;

  let totalScore = 0;

  for (const set of newMeldSets) {
    if (!isValidSet(set)) return false;
    totalScore += calculateSetScore(set);
  }

  return totalScore >= 30;
}

/**
 * 6. 전체 보드 유효성 검사 함수
 */
export function validateBoard(boardSets) {
  if (!boardSets) return true;
  for (const set of boardSets) {
    const tiles = set.tiles || set;
    if (!isValidSet(tiles)) {
      return false;
    }
  }
  return true;
}
