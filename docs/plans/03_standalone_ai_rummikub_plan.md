# 🎮 루미큐브 웹 앱 — 스탠드얼론 AI 대전 계획서 (실시간 대전 제거)

## 1. 개요
실시간 멀티플레이어 백엔드 서버(Socket.io/Node.js)를 제거하고, 복잡한 서버 구동 없이 브라우저에서 바로 실행되는 **독립형 AI 대전 단일 웹 앱(Vite+React)**으로 간소화합니다.

## 2. 주요 변경 사항
- **제거**: `server/` 디렉토리 전체, `socket.io-client` 패키지, 로비의 '친구 방 만들기/참가' 기능
- **통합**: AI 턴 처리 로직 및 규칙 엔진을 클라이언트 내부(`client/src/utils/aiPlayer.js`)로 완전 통합
- **단순화**: 실행 시 서버 2개 켤 필요 없이 `npm run dev` 하나로 즉시 플레이 가능

## 3. 구조
```
client/
├── src/
│   ├── components/
│   │   ├── GameBoard.jsx   ← 보드 판 (세트 드롭)
│   │   ├── PlayerRack.jsx  ← 내 손패 (정렬/드래그)
│   │   ├── Tile.jsx        ← 3D 타일
│   │   ├── TileSet.jsx     ← 보드 세트 (경고 효과)
│   │   ├── GameInfo.jsx    ← 상단 HUD (턴/30점/버튼)
│   │   ├── Lobby.jsx       ← 게임 시작 화면 (AI 난이도/선공 선택)
│   │   └── WinScreen.jsx   ← 승리 축하 모달
│   ├── utils/
│   │   ├── ruleEngine.js   ← 루미큐브 규칙 엔진
│   │   ├── tileFactory.js  ← 타일 106장 생성 & 셔플
│   │   └── aiPlayer.js     ← 클라이언트 통합 AI 로직
│   ├── App.jsx             ← 단일 게임 상태 메인 컨트롤러
│   └── index.css
```
