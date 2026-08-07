# 🎮 루미큐브 웹 앱 — AI 턴 실행 시 보드 타일 소멸 오류 수정 계획서

## 1. 개요
AI가 턴 진행 시 보드에 이미 놓여있던 유효한 세트 및 패들이 사라지거나 이전 상태로 덮어씌워지는 오류를 수정합니다.

## 2. 오류 원인 분석
- React의 `setLocalBoard(move.newBoard)` 상태 변경 함수는 비동기적으로 동작합니다.
- AI가 턴을 마칠 때 `setLocalBoard(move.newBoard)`를 호출하자마자 연속해서 `moveToNextTurn()`을 실행하는데, `moveToNextTurn` 내부에서 참조하는 `localBoard` 변수는 업데이트 전의 **이전 보드 클로저(Closure) 값**이었습니다.
- 그 결과 다음 플레이어의 `turnSnapshot`이나 연속 AI 턴에 이전 보드가 전달되어 **AI가 등록한 패나 이전 보드 패가 덮어씌워져 사라지는 현상**이 발생했습니다.

## 3. 해결 방안
1. **`App.jsx` `moveToNextTurn` 함수 개선**:
   - `moveToNextTurn(latestBoard)`와 같이 최신 보드 상태를 직접 파라미터로 받아 처리할 수 있도록 구조 개편.
   - AI가 패를 내거나 덱에서 뽑았을 때, 최신 보드(`move.newBoard` 또는 최신 `localBoard`)가 다음 턴 및 스냅샷(`turnSnapshot`)에 차질 없이 전해지도록 보장.
2. **`aiPlayer.js` 세트 래핑 안정화**:
   - AI가 새로 내놓는 세트들에 중복되지 않는 고유 ID를 부여하고, 기존 보드의 빈 세트를 확실하게 청소한 뒤 보드를 구성하도록 개선.

## 4. 세부 수정 파일
- [MODIFY] `docs/plans/06_fix_ai_board_destruction_plan.md`
- [MODIFY] `client/src/utils/aiPlayer.js`
- [MODIFY] `client/src/App.jsx`
