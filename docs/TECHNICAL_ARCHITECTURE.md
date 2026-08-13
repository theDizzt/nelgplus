# 기술 구조

## 실행 구조

- `src/core/Game.ts`: 메인 메뉴, 옵션, Warp Zone, 레벨 진입과 완료 처리
- `src/core/LevelScope.ts`: 레벨 이벤트·타이머·정리 생명주기
- `src/levels/registry.ts`: 실제 게임에 포함되는 레벨 등록
- `src/levels/levelNN.ts`: 레벨별 상태와 상호작용
- `src/styles/levels/levelNN.css`: 레벨별 시각 디자인
- `public/assets/`: 브라우저가 그대로 제공하는 이미지·폰트·음원

## 생명주기

레벨은 `mount(context)`에서 DOM을 만들고 정리 함수를 반환한다. 전역 이벤트와 타이머는 가능한 한 `context.listen`, `context.timeout`, `context.interval`을 사용한다. 여러 Scene을 가진 레벨은 Scene 전환마다 자체 AbortController와 타이머 집합을 정리한다. Audio 객체, Red Guy 컨트롤러, 드래그 포인터 캡처도 Scene 종료 시 해제한다.

## 공통 기능

- `AudioManager`: Music과 SFX 활성화 및 볼륨
- `StarMaskedInput`: 실제 값을 별표로 표시하는 암호 입력
- `RedGuy`: 가속·관성·점프·일방통행 발판·장면별 키 매핑
- `floatingPosition`: 가변 크기 화면에서 메뉴와 부유 UI의 좌표 변환
- `assetUrl`: GitHub Pages 같은 하위 경로 배포에서도 안전한 에셋 URL
- `InteractionGuard`: 허용된 요소 외 선택·드래그 방지

두 레벨 이상에서 같은 좌표 계산이나 상호작용이 반복되면 `core`의 작은 유틸리티로 분리한다. 반대로 한 레벨의 연출에만 필요한 코드는 해당 레벨 모듈과 CSS에 둔다.

## Scene 상태 원칙

Scene 렌더 함수는 이전 Scene을 정리한 뒤 전체 화면을 다시 만든다. DOM 참조를 Scene 밖에서 재사용하지 않는다. 성공과 실패 전환에는 중복 실행 방지 플래그를 둔다. 반복 클릭 퍼즐은 상태 범위를 명시하고 모듈러 연산으로 `빈 화면 → 단계들 → 입력창 → 빈 화면` 순환을 구현한다.

## 확장 방향

레벨 수가 늘어나면 다음 순서로 구조를 확장한다.

1. 암호 폼, Flash식 메뉴, Warp 체크포인트 데이터의 독립 컴포넌트화
2. 플랫폼 장면 레이아웃을 데이터 객체로 분리
3. 레벨별 에셋 목록을 등록해 선택적 프리로드
4. 개발 전용 Scene 점프 및 충돌 박스 표시 기능
5. 자동화 가능한 정답·오답·Enter·정리 동작 테스트
