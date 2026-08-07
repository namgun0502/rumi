// ruleEngine.test.js - 루미큐브 규칙 엔진 단위 테스트 스크립트입니다.
import { isValidGroup, isValidRun, calculateSetScore, validateInitialMeld } from './ruleEngine.js';

console.log('=== 🧪 루미큐브 규칙 검증 엔진 테스트 시작 ===\n');

// 1. 그룹 테스트
const validGroup = [
  { color: 'red', number: 7, isJoker: false },
  { color: 'blue', number: 7, isJoker: false },
  { color: 'black', number: 7, isJoker: false }
];
console.log('1. [빨7, 파7, 검7] 그룹 검증 (예상: true):', isValidGroup(validGroup));

const invalidGroup = [
  { color: 'red', number: 7, isJoker: false },
  { color: 'red', number: 7, isJoker: false }, // 색상 중복
  { color: 'black', number: 7, isJoker: false }
];
console.log('2. [빨7, 빨7, 검7] 그룹 검증 (예상: false):', isValidGroup(invalidGroup));

// 2. 런 테스트
const validRun = [
  { color: 'red', number: 3, isJoker: false },
  { color: 'red', number: 4, isJoker: false },
  { color: 'red', number: 5, isJoker: false }
];
console.log('3. [빨3, 빨4, 빨5] 런 검증 (예상: true):', isValidRun(validRun));

const invalidRun = [
  { color: 'red', number: 3, isJoker: false },
  { color: 'red', number: 5, isJoker: false }, // 숫자가 연속되지 않음
  { color: 'red', number: 6, isJoker: false }
];
console.log('4. [빨3, 빨5, 빨6] 런 검증 (예상: false):', isValidRun(invalidRun));

// 3. 조커 포함 런 테스트
const jokerRun = [
  { color: 'orange', number: 10, isJoker: false },
  { color: 'orange', number: 0, isJoker: true }, // 조커가 11 대체
  { color: 'orange', number: 12, isJoker: false }
];
console.log('5. [주10, 조커, 주12] 런 검증 (예상: true):', isValidRun(jokerRun));

// 4. 30점 등록 검증 테스트
const meld30 = [
  [
    { color: 'blue', number: 10, isJoker: false },
    { color: 'black', number: 10, isJoker: false },
    { color: 'red', number: 10, isJoker: false }
  ] // 합 30점
];
console.log('6. 30점 등록 검증 (합 30점) (예상: true):', validateInitialMeld(meld30));

const meld15 = [
  [
    { color: 'blue', number: 5, isJoker: false },
    { color: 'black', number: 5, isJoker: false },
    { color: 'red', number: 5, isJoker: false }
  ] // 합 15점
];
console.log('7. 30점 등록 검증 (합 15점) (예상: false):', validateInitialMeld(meld15));

console.log('\n=== ✅ 테스트 완료 ===');
