// tileFactory.js - 106장 타일 생성 및 스마트 조커 수열 정렬 유틸리티입니다.
// 남건이 코드를 이해하기 쉽도록 친절한 한글 주석을 달아두었습니다.

export const TILE_COLORS = ['red', 'blue', 'orange', 'black'];

export function generateFullDeck() {
  const deck = [];

  for (let setNum = 1; setNum <= 2; setNum++) {
    for (const color of TILE_COLORS) {
      for (let num = 1; num <= 13; num++) {
        deck.push({
          id: `${color}_${num}_set${setNum}`,
          color: color,
          number: num,
          isJoker: false,
        });
      }
    }
  }

  deck.push({
    id: 'joker_red',
    color: 'red',
    number: 0,
    isJoker: true,
  });

  deck.push({
    id: 'joker_black',
    color: 'black',
    number: 0,
    isJoker: true,
  });

  return deck;
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 조커 스마트 수열 위치 추정 정렬 (예: 9, 10, 11, [조커], 13 에서 조커를 12 자리에 배치)
 */
export function sortTilesByColor(tiles) {
  if (!tiles || tiles.length === 0) return [];
  const colorOrder = { red: 1, blue: 2, orange: 3, black: 4 };

  // 1. 색상별로 그룹화
  const groupedByColor = { red: [], blue: [], orange: [], black: [], joker: [] };

  for (const t of tiles) {
    if (t.isJoker) {
      groupedByColor.joker.push(t);
    } else {
      groupedByColor[t.color].push(t);
    }
  }

  const result = [];

  // 2. 색상 순서대로 정렬하면서 조커의 들어갈 자리 추정
  for (const color of TILE_COLORS) {
    const group = groupedByColor[color].sort((a, b) => a.number - b.number);
    if (group.length === 0) continue;

    // 조커가 있고, 현재 색상과 조커 색상이 맞거나 일반 조커가 있는 경우
    // 수열 간격(gap)을 탐색하여 빈 숫자 자리에 조커 삽입
    const finalGroup = [];
    for (let i = 0; i < group.length; i++) {
      finalGroup.push(group[i]);

      if (i < group.length - 1) {
        const diff = group[i + 1].number - group[i].number;
        // 연속 숫자가 2 이상 차이나면(예: 11과 13) 중간 구멍에 조커 배치
        if (diff === 2 && groupedByColor.joker.length > 0) {
          const matchingJokerIndex = groupedByColor.joker.findIndex(
            j => j.color === color || j.isJoker
          );
          if (matchingJokerIndex !== -1) {
            const joker = groupedByColor.joker.splice(matchingJokerIndex, 1)[0];
            finalGroup.push(joker);
          }
        }
      }
    }

    result.push(...finalGroup);
  }

  // 남아있는 조커가 있으면 맨 뒤에 추가
  if (groupedByColor.joker.length > 0) {
    result.push(...groupedByColor.joker);
  }

  return result;
}

/**
 * 숫자별 정렬 함수
 */
export function sortTilesByNumber(tiles) {
  const colorOrder = { red: 1, blue: 2, orange: 3, black: 4 };
  return [...tiles].sort((a, b) => {
    if (a.isJoker) return 1;
    if (b.isJoker) return -1;
    if (a.number !== b.number) {
      return a.number - b.number;
    }
    return colorOrder[a.color] - colorOrder[b.color];
  });
}
