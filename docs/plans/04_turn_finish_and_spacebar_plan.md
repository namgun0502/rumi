# 🎮 루미큐브 웹 앱 — 1장 뽑기 버튼 삭제 및 스페이스바 턴 완료 계획서

## 1. 개요
독립된 "1장 뽑기" 버튼을 제거하고, 보드판에 패를 내지 않은 상태에서 **턴 완료** 버튼을 누르거나 **스페이스바(Space)**를 누르면 자동으로 1장을 뽑고 턴이 넘어가도록 변경합니다.

## 2. 주요 변경 사항
1. **`GameInfo.jsx` (상단 HUD)**:
   - "1장 뽑기 (W)" 버튼 제거
   - "턴 완료" 버튼 단축키 표시를 `E`에서 `Space` (스페이스바)로 변경
2. **`App.jsx` (메인 애플리케이션)**:
   - `handleDrawTile`을 외부에 별도 버튼용으로 노출하지 않고 `handleSubmitTurn` 내부에 완전 통합
   - 키보드 이벤트에서 `W` 키 단축키 핸들러 제거
   - `Space` 키(스페이스바) 누름 시 `e.preventDefault()` 및 턴 완료(`handleSubmitTurn`) 정상 작동 보장

## 3. 세부 수정 파일
- [MODIFY] `docs/plans/04_turn_finish_and_spacebar_plan.md`
- [MODIFY] `client/src/components/GameInfo.jsx`
- [MODIFY] `client/src/App.jsx`
