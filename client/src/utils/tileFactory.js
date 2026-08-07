// tileFactory.js - 루미큐브 타일 106개를 생성하고, 섞고, 정렬하는 유틸리티 파일입니다.
// 남건이 로직을 쉽게 이해할 수 있도록 상세한 한글 주석을 작성했습니다.

// 사용 가능한 4가지 타일 색상 정의
export const TILE_COLORS = ['red', 'blue', 'orange', 'black'];

/**
 * 106장의 완전한 루미큐브 타일 덱을 생성하는 함수입니다.
 * - Red, Blue, Orange, Black 4가지 색상
 * - 각 색상별 1~13 숫자 패가 2세트씩 (4 * 13 * 2 = 104장)
 * - 빨간색 조커 1장, 검은색 조커 1장 (2장)
 * - 총 106장
 */
export function generateFullDeck() {
  const deck = [];

  // 1. 일반 타일 104장 생성 (세트 1, 세트 2)
  for (let setNum = 1; setNum <= 2; setNum++) {
    for (const color of TILE_COLORS) {
      for (let num = 1; num <= 13; num++) {
        deck.push({
          id: `${color}_${num}_set${setNum}`, // 고유 식별자 (예: red_7_set1)
          color: color,                       // 타일 색상 ('red', 'blue', 'orange', 'black')
          number: num,                        // 타일 숫자 (1 ~ 13)
          isJoker: false,                     // 조커 여부 (false)
        });
      }
    }
  }

  // 2. 조커 타일 2장 생성
  deck.push({
    id: 'joker_red',
    color: 'red',
    number: 0,       // 조커는 기본 숫자 0으로 표시 (검증 시 임의 숫자로 대체됨)
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

/**
 * 타일 배열을 무작위로 섞는 함수 (피셔-예이츠 셔플 알고리즘)
 */
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 타일 배열을 색상별 -> 숫자순으로 정렬하는 함수 (손패 정렬 기능에 사용)
 */
export function sortTilesByColor(tiles) {
  const colorOrder = { red: 1, blue: 2, orange: 3, black: 4 };
  return [...tiles].sort((a, b) => {
    if (a.isJoker) return 1;
    if (b.isJoker) return -1;
    if (colorOrder[a.color] !== colorOrder[b.color]) {
      return colorOrder[a.color] - colorOrder[b.color];
    }
    return a.number - b.number;
  });
}

/**
 * 타일 배열을 숫자순 -> 색상별로 정렬하는 함수 (손패 정렬 기능에 사용)
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
