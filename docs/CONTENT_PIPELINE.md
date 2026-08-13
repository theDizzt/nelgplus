# 콘텐츠와 에셋 관리

## 디렉터리

- 이미지: `public/assets/images/`
- 배경음악과 긴 음성: `public/assets/music/`
- 짧은 효과음: `public/assets/sounds/`
- 웹폰트: `public/assets/fonts/<family>/`

파일명은 영문 소문자와 숫자, 하이픈을 권장한다. 기존 레벨 명명 규칙을 유지해야 할 때는 `level32bg5.jpg`, `level35phase4a.png`처럼 레벨 번호와 역할이 드러나게 한다.

## URL과 배포

TypeScript에서 에셋을 참조할 때는 `assetUrl("images/...")`를 사용한다. CSS에서 직접 절대 경로를 쓰면 GitHub Pages의 저장소 하위 경로에서 실패할 수 있으므로, 동적 CSS 변수에 `assetUrl` 결과를 전달하거나 공통 배포 기준을 확인한다.

## 이미지

투명 PNG와 GIF의 충돌 판정은 사각형 전체가 아니라 알파 마스크 또는 명시된 작은 hitbox를 사용한다. 거대한 원본은 표시 크기에 맞춰 최적화하되 퍼즐이 픽셀 색 차이에 의존한다면 손실 압축을 사용하지 않는다. 숨은 색 퍼즐의 RGB 값은 문서와 코드에서 정확히 일치시킨다.

## 오디오

Music과 SFX 볼륨을 구분한다. 레벨 전용 배경음악은 레벨 종료까지 반복하고 cleanup에서 정지한다. 긴 음성은 초기 전체 프리로더에 넣지 않고 해당 레벨에서 메타데이터 또는 사용자 재생 시 로드한다. 재생 버튼은 브라우저의 사용자 상호작용 이후 `play()`를 호출하고 실패 상태를 표시한다.

## 폰트

폰트 파일을 추가하면 `src/styles/fonts.css`에 `@font-face`를 등록하고 필요하면 초기 프리로드 목록에도 추가한다. 제목은 Perpetua, 부제목은 Courier가 기본이며 Arial, Tahoma, Comic Sans, Papyrus 등은 레벨 명세에 지정된 경우만 사용한다.
