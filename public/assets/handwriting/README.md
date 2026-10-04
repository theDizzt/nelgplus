# 손글씨 문자 사용법

`sheet.png`의 대문자 26개, 숫자 10개, 문장부호 `? ! . ( ) - ,` 총 43개를 문자별 영역으로 추출해 사용합니다. 원본 이미지는 그대로 유지하며, 별도 폰트 설치나 문자별 PNG 파일 없이 CSS 마스크로 표시합니다.

## 레벨에서 출력하기

```ts
import { setHandwritingText } from "../core/HandwritingText";

const label = document.createElement("div");
label.style.fontSize = "36px";
label.style.color = "white";
label.style.lineHeight = "1.5";
setHandwritingText(label, "HELLO, WORLD!\nLEVEL 62 (TEST)");
container.append(label);

// 내용 변경 시에도 같은 함수를 사용합니다.
setHandwritingText(label, "NEXT QUESTION?");
```

- 소문자를 입력하면 시트의 대문자 그림으로 표시합니다.
- 작은따옴표(`'`)는 쉼표 그림을 글자 위쪽으로 올려 표시합니다. 예: `It's a test, isn't it?` → `IT'S A TEST, ISN'T IT?`
- 공백, 줄바꿈, 단어 단위 자동 줄바꿈을 지원합니다.
- 시트에 없는 문자(한글 등)는 해당 요소의 기존 글꼴로 표시합니다.
- `color`와 `font-size`로 색상과 크기를 지정합니다. 원본의 획과 문자별 너비를 유지합니다.
- 스크린 리더에는 그림 대신 원래 입력한 텍스트를 제공합니다.
- 함수는 대상 요소의 기존 자식 노드를 교체하므로 텍스트 전용 요소에 사용합니다.

현재 Level 62의 퀴즈 문제 번호, 문제 문구, 선택지에 적용되어 있습니다. 레벨 타이틀은 기존 글꼴을 사용합니다.

## 시트를 수정했을 때

같은 600×600 크기와 아래 행별 문자 순서로 수정한 경우, 프로젝트 루트에서 영역 정보를 다시 생성합니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-handwriting.ps1
```

```text
ABCDEFGH
IJKLMNOP
QRSTUVWX
YZ0123456
789?!.()-,
```

생성 파일은 `src/core/handwritingGlyphs.ts`입니다. 행 위치나 시트 크기를 바꾸면 추출 스크립트의 행 범위·기준선과 `src/styles/components/handwriting-text.css`의 마스크 크기도 함께 조정해야 합니다. 각 문자 사이에는 투명한 간격이 필요합니다.
