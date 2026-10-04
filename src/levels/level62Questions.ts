/** Level 62: 30문항과 점수별 결과를 편집하는 파일. */
export interface Level62Choice {
  /** 선택지에 표시할 문구. 소문자도 대문자 손글씨로 출력됩니다. */
  readonly text: string;
  /** 이 선택지를 클릭할 때 합산할 점수. 음수와 0도 가능합니다. */
  readonly score: number;
}
export interface Level62Question {
  readonly text: string;
  /** public/assets/images 안의 파일명(확장자 포함). 사진이 없으면 null. */
  readonly image: string | null;
  /** 사진 설명: 스크린 리더와 이미지 로딩 실패 시 사용합니다. */
  readonly imageAlt?: string;
  /** 화면 순서: 왼쪽 위, 오른쪽 위, 왼쪽 아래, 오른쪽 아래. 반드시 4개. */
  readonly choices: readonly [Level62Choice, Level62Choice, Level62Choice, Level62Choice];
}

/**
 * 아래는 교체용 샘플 30문항입니다. 순서대로 출제되며 정답 판정 없이 선택한 점수를 합산합니다.
 * text, image, choices의 text/score를 각 문항에서 직접 수정하세요.
 * 사진 예: image: "level106.png", imageAlt: "A mysterious picture"
 * 이미지 기본값은 null이며, 문제/선택지 문구에 줄바꿈(\n)을 넣을 수 있습니다.
 */
export const LEVEL62_QUESTIONS: readonly Level62Question[] = [
  // 1번 문제
  {
    text: "How curious are you?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 2번 문제
  {
    text: "Do you trust your first answer?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 3번 문제
  {
    text: "Would you explore a hidden room?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 4번 문제
  {
    text: "Do you enjoy solving puzzles?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 5번 문제
  {
    text: "Would you press a strange button?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 6번 문제
  {
    text: "Do you notice small details?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 7번 문제
  {
    text: "Do you prefer working alone?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 8번 문제
  {
    text: "Would you follow a mysterious sign?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 9번 문제
  {
    text: "Do you remember your dreams?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 10번 문제
  {
    text: "Do you like surprises?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 11번 문제
  {
    text: "Would you try the same puzzle again?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 12번 문제
  {
    text: "Do you question the rules?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 13번 문제
  {
    text: "Would you open a locked box?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 14번 문제
  {
    text: "Do you enjoy a challenge?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 15번 문제
  {
    text: "Would you take the longer path?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 16번 문제
  {
    text: "Do you trust your memory?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 17번 문제
  {
    text: "Would you help a stranger?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 18번 문제
  {
    text: "Do you look behind the obvious?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 19번 문제
  {
    text: "Would you wait for a secret?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 20번 문제
  {
    text: "Do you like changing your plans?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 21번 문제
  {
    text: "Would you explore in the dark?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 22번 문제
  {
    text: "Do you check every corner?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 23번 문제
  {
    text: "Would you keep a secret?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 24번 문제
  {
    text: "Do you follow your instincts?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 25번 문제
  {
    text: "Would you start over?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 26번 문제
  {
    text: "Do you enjoy finding patterns?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 27번 문제
  {
    text: "Would you choose the unknown?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 28번 문제
  {
    text: "Do you believe every clue?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 29번 문제
  {
    text: "Would you share your discovery?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
  // 30번 문제
  {
    text: "Are you ready for the result?",
    image: null,
    choices: [
      { text: "Not at all", score: 0 },
      { text: "A little", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Absolutely!", score: 3 },
    ],
  },
];

export interface Level62Result {
  /** 분기를 구분하는 고유 이름. 결과 화면의 data-result에도 기록됩니다. */
  readonly id: string;
  /** 이 점수 이하이면 선택됩니다. 낮은 값부터 배열에 작성하세요. */
  readonly maxScore: number;
  readonly title: string;
  readonly message: string;
}

/**
 * 임시 분기 예시: 0~29 / 30~59 / 60~90점 (현재 샘플의 총점 범위).
 * 점수와 문구를 바꾸거나 분기를 추가해도 됩니다.
 * 마지막 Infinity는 음수/고득점 등 어떤 합계에도 결과가 있도록 하는 최종 분기입니다.
 * 아직 레벨 통과/워프 조건은 지정하지 않았으므로 분기별 결과 문구만 표시합니다.
 */
export const LEVEL62_RESULTS: readonly Level62Result[] = [
  { id: "careful", maxScore: 29, title: "The careful observer", message: "You take your time before stepping into the unknown." },
  { id: "curious", maxScore: 59, title: "The curious explorer", message: "You balance caution with a sense of adventure." },
  { id: "fearless", maxScore: Infinity, title: "The fearless adventurer", message: "You are always ready to discover what comes next!" },
];

export function getLevel62Result(score: number): Level62Result {
  return LEVEL62_RESULTS.find(result => score <= result.maxScore) ?? LEVEL62_RESULTS[LEVEL62_RESULTS.length - 1]!;
}

