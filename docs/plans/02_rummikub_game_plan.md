# 🎮 루미큐브 웹 앱 — 구현 계획서 (AI 대전 및 실시간 멀티플레이어)

## 1. 프로젝트 개요
Google Antigravity 플랫폼 환경을 고려하여, 친구들과 실시간으로 즐기거나 AI와 대전할 수 있는 웹 기반 루미큐브(Rummikub) 앱 구축.
드래그 앤 드롭 UI 및 정확한 루미큐브 규칙 검증 엔진(Group, Run, 30점 첫 등록 규칙 포함) 탑재.

## 2. 기술 스택 (Tech Stack)
- **Frontend:** React (Vite 기반), Tailwind CSS, Lucide Icons, Drag & Drop API
- **Backend:** Node.js, Express, Socket.io (실시간 방 관리 및 AI 플레이어 로직 처리)
- **State & Logic:** React State / Context, Custom Hook (`useGameState`, `useSocket`)

## 3. 타일 데이터 구조 (106장)
- **색상 (4종):** Red, Blue, Orange, Black
- **숫자:** 1~13 각 2세트 (4색 × 13 × 2 = 104장)
- **조커:** Red Joker 1장, Black Joker 1장 (2장)
- **총계:** 106장

## 4. 규칙 검증 엔진 (Rule Engine)
1. **Group (그룹):** 같은 숫자, 서로 다른 색상의 패 3~4개 조합 (예: 빨7, 파7, 검7)
2. **Run (런):** 같은 색상, 연속된 숫자의 패 3개 이상 조합 (예: 빨3, 빨4, 빨5)
3. **첫 등록 (Initial Meld):** 게임 시작 후 플레이어가 첫 번째로 내는 세트들의 숫자 합이 **최소 30점 이상**이어야 함 (조커는 대체한 숫자 점수로 계산).
4. **보드 검증 (Board Validation):** 보드 위의 모든 세트가 유효한 3장 이상의 Group 또는 Run인지 검사.

## 5. 주요 기능
- **실시간 멀티플레이어:** 방 코드 생성 및 입장, 턴 교대, 타일 동기화
- **AI 대전 모드:** 난이도별(쉬움/보통/어려움) AI 알고리즘 적용
- **드래그 앤 드롭 UI:** 손패 ↔ 보드간 자유로운 패 이동 및 보드 내 세트 재배치
- **유효성 visual feedback:** 유효 세트(초록) / 무효 세트(빨강) 경고 표시
- **되돌리기 (Undo):** 턴 중 수정한 보드 상태를 턴 시작 시점으로 초기화
