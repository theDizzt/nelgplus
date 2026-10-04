import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import { clientPointToLocal, positionFloatingElement } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

/**
 * 레벨 제작 참고용: Level 255, Test
 * 실행: 어드민 패널에서 255 선택 또는 개발 서버의 /tests/test-level.html.
 * 테스트 전용 진입으로 제공하며 정규 진행 목록에는 포함하지 않는다.
 * 스타일: ../styles/levels/test-level.css의 같은 번호 주석을 함께 참고/복사한다.
 * 원본: Level 8(입력/드래그), Level 9(우클릭 메뉴), LevelScope(이벤트/타이머 정리).
 *
 * 새 레벨로 복사할 때 export 이름, number, title, CSS 접두사를 변경하고
 * registry.ts와 styles/global.css에 등록한다. 필요한 예시만 골라 가져오면 된다.
 * 이벤트/타이머는 listen/timeout/interval로 등록하면 레벨 종료 시 자동 해제된다.
 * 직접 만든 observer, requestAnimationFrame 등은 mount의 반환 함수에서 정리한다.
 * 이 예시는 정답을 맞혀도 진행도/업적을 바꾸지 않아 반복 실험할 수 있다.
 */
export const testLevel: LevelDefinition = {
  number: 255,
  title: "Test",
  mount({ screen, listen, timeout, interval, audio }) {
    // 01. screen은 게임 좌표계의 컨테이너. 배경/기본 글자색은 전용 CSS에서 지정한다.
    // 공통 level-heading을 사용하면 기존 레벨의 제목 서체와 정렬을 재사용한다.
    screen.className = "level-screen test-level";
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 255</div><h1>Test</h1>
      </header>
      <nav class="test-level__tabs" aria-label="샘플 분류">
        <button type="button" data-page="style" aria-pressed="true">색상 · 오브젝트</button>
        <button type="button" data-page="motion" aria-pressed="false">애니메이션 · 드래그</button>
        <button type="button" data-page="input" aria-pressed="false">입력 · 버튼 · 메뉴</button>
      </nav>
      <section class="test-level__panel" data-panel="style" aria-label="색상과 오브젝트">
        <h2>01 / 배경색 · 글자색</h2>
        <div class="test-level__row">
          <label>배경 <input type="color" data-color="--test-background" value="#ff9900" /></label>
          <label>글자 <input type="color" data-color="--test-ink" value="#111111" /></label>
          <button type="button" data-action="colors">기본 색상</button>
          <span class="test-level__accent">개별 글자색</span>
        </div>
        <h2>02 / 선형 · 원형 · 글자 그라데이션</h2>
        <div class="test-level__row">
          <div class="test-level__linear">linear-gradient</div>
          <div class="test-level__radial">radial-gradient</div>
          <strong class="test-level__gradient-text">RAINBOW</strong>
        </div>
        <h2>03 / 도형 · 이미지 · SVG · 숨겨진 단서</h2>
        <div class="test-level__row test-level__objects">
          <div class="test-level__circle" aria-label="원"></div>
          <img src="${assetUrl("images/level9a.png")}" alt="Level 9 메뉴 이미지" draggable="false" />
          <svg width="100" height="60" viewBox="0 0 100 60" aria-label="SVG 경로" role="img">
            <path d="M5 45 H30 V15 H65 V45 H95" fill="none" stroke="#2475e8" stroke-width="8" />
          </svg>
          <button type="button" data-action="reveal" aria-expanded="false">단서 표시</button>
          <span data-clue hidden>SILVER</span>
        </div>
      </section>
      <section class="test-level__panel" data-panel="motion" aria-label="애니메이션과 드래그" hidden>
        <h2>04 / CSS 반복 애니메이션 · hover 전환</h2>
        <div class="test-level__row">
          <div class="test-level__track"><div class="test-level__ball"></div></div>
          <button type="button" data-action="animation" aria-pressed="false">일시 정지</button>
          <button type="button" class="test-level__hover">마우스를 올려보세요</button>
        </div>
        <h2>05 / Pointer Events로 드래그 (터치 지원)</h2>
        <div class="test-level__drag-area"><div class="test-level__draggable" data-allow-drag>DRAG</div></div>
        <h2>06 / 타이머 · 오디오</h2>
        <div class="test-level__row">
          <span>경과 <output data-ticks>0</output>초</span>
          <button type="button" data-action="effect">효과음</button>
          <button type="button" data-action="music">음악 재생</button>
          <button type="button" data-action="stop">음악 정지</button>
        </div>
      </section>
      <section class="test-level__panel" data-panel="input" aria-label="입력과 메뉴" hidden>
        <h2>07 / Level 8 패스워드 입력창</h2>
        <p>정답: <strong>silver</strong> · GO 또는 Enter로 확인</p>
        <form class="test-level__form" autocomplete="off">
          <input class="nelg-password-input" name="nelg-test-answer" data-allow-select
            data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
            autocomplete="off" autocapitalize="off" aria-autocomplete="none"
            aria-label="Password" spellcheck="false" />
          <button type="submit">GO</button>
        </form>
        <h2>08 / 버튼 상태 · 우클릭 메뉴</h2>
        <div class="test-level__row">
          <button type="button" data-action="count">클릭 <span data-count>0</span>회</button>
          <button type="button" disabled>비활성화</button>
          <button type="button" data-action="menu" aria-haspopup="menu">메뉴 열기</button>
          <button type="button" data-action="clear">입력 초기화</button>
        </div>
        <p>화면에서 우클릭해도 메뉴가 열립니다. Esc / 바깥 클릭으로 닫습니다.</p>
      </section>
      <p class="test-level__feedback" role="status" aria-live="polite">버튼과 오브젝트를 직접 조작해 보세요.</p>
      <p class="test-level__source">참고 코드: src/levels/testLevel.ts + src/styles/levels/test-level.css</p>
      <div class="test-level__menu" role="menu" aria-label="샘플 우클릭 메뉴" hidden>
        <button type="button" role="menuitem" data-command="hint">힌트 보기</button>
        <button type="button" role="menuitem" data-command="colors">배경 · 글자색 초기화</button>
        <button type="button" role="menuitem" data-command="close">닫기</button>
      </div>
    `;

    // 정적 마크업의 필수 요소가 빠지면 개발 중 즉시 알 수 있게 한다.
    const get = <T extends HTMLElement>(selector: string): T => {
      const element = screen.querySelector<T>(selector);
      if (!element) throw new Error(`Test level: missing ${selector}`);
      return element;
    };
    const feedback = get<HTMLElement>(".test-level__feedback");
    const menu = get<HTMLElement>(".test-level__menu");
    const input = get<HTMLInputElement>(".test-level__form input");
    const form = get<HTMLFormElement>(".test-level__form");
    const submit = get<HTMLButtonElement>(".test-level__form button");
    const report = (message: string) => { feedback.textContent = message; };

    // 01. CSS 변수는 기본 텍스트에 상속된다. 개별 color 지정은 우선한다.
    // 사용자 입력은 innerHTML에 삽입하지 말고 textContent/style API로 반영한다.
    const resetColors = () => {
      screen.style.removeProperty("--test-background");
      screen.style.removeProperty("--test-ink");
      screen.querySelectorAll<HTMLInputElement>("[data-color]").forEach((picker) => {
        picker.value = picker.defaultValue;
      });
    };
    screen.querySelectorAll<HTMLInputElement>("[data-color]").forEach((picker) => {
      listen(picker, "input", () => screen.style.setProperty(picker.dataset.color!, picker.value));
    });
    screen.querySelectorAll<HTMLButtonElement>("[data-page]").forEach((button) => {
      listen(button, "click", () => {
        screen.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.panel !== button.dataset.page;
        });
        screen.querySelectorAll<HTMLElement>("[data-page]").forEach((tab) => {
          tab.setAttribute("aria-pressed", String(tab === button));
        });
        menu.hidden = true;
      });
    });

    // 07. Level 8과 동일한 별표 마스킹. input.value에는 별표만 있으므로 정답 비교에는
    // 반드시 getValue()를 사용한다. 초기화도 input.value = '' 대신 clear()로 한다.
    const maskedInput = attachStarMaskedInput(input, listen);
    let checking = false;
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      if (!event.repeat) form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault(); // 기본 submit은 페이지를 새로고침하므로 막는다.
      if (checking) return;
      checking = true;
      submit.disabled = true;
      if (maskedInput.getValue() === "silver") {
        // 실제 레벨: complete(); return; (LevelContext에서 complete도 받아온다.)
        report("정답입니다! 실제 레벨에서는 여기서 complete()를 호출합니다.");
      } else {
        // 실제 레벨: if (wrongAnswer()) return; 이후 아래 시각 피드백을 실행한다.
        // true는 실패 화면으로 전환되었다는 뜻. 이전 화면을 계속 조작하지 않는다.
        report("오답입니다. silver를 입력해 보세요.");
        input.classList.add("is-wrong");
      }
      input.focus();
      timeout(() => {
        input.classList.remove("is-wrong");
        submit.disabled = false;
        checking = false;
      }, 360);
    });

    // 08. 먼저 표시해야 메뉴 크기를 잴 수 있다. 공통 함수가 게임 스케일을 보정하고
    // 오른쪽/아래 경계 밖으로 나가지 않도록 제한한다 (Level 9 방식).
    let menuOpener: HTMLElement | null = null;
    const openMenu = (x: number, y: number) => {
      if (menu.hidden) menuOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      menu.hidden = false;
      positionFloatingElement(screen, menu, x, y);
      menu.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    };
    const closeMenu = (restoreFocus = false) => {
      menu.hidden = true;
      if (restoreFocus) menuOpener?.focus({ preventScroll: true });
    };
    listen(screen, "contextmenu", (event) => {
      event.preventDefault();
      openMenu(event.clientX, event.clientY);
    });
    listen(document, "pointerdown", (event) => {
      if (!menu.contains(event.target as Node)) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (menu.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); closeMenu(true); }
      if (event.key === "Tab") closeMenu();
      // role=menu에 맞춰 위/아래 화살표도 지원한다. Enter/Space는 버튼 기본 동작.
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const items = [...menu.querySelectorAll<HTMLButtonElement>("button")];
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    });
    listen(menu, "click", (event) => {
      const item = (event.target as Element).closest<HTMLButtonElement>("[data-command]");
      if (!item) return;
      if (item.dataset.command === "hint") report("메뉴의 힌트: 패스워드는 silver입니다.");
      if (item.dataset.command === "colors") resetColors();
      closeMenu(true);
    });

    // 03/04/06/08. data-action으로 버튼의 기능을 구분한다.
    let clicks = 0;
    screen.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
      listen(button, "click", () => {
        switch (button.dataset.action) {
          case "colors": resetColors(); break;
          case "reveal": {
            const clue = get<HTMLElement>("[data-clue]");
            clue.hidden = !clue.hidden;
            button.setAttribute("aria-expanded", String(!clue.hidden));
            button.textContent = clue.hidden ? "단서 표시" : "단서 숨기기";
            break;
          }
          case "animation": {
            const paused = screen.classList.toggle("test-level--paused");
            button.setAttribute("aria-pressed", String(paused));
            button.textContent = paused ? "다시 재생" : "일시 정지";
            break;
          }
          // AudioManager가 경로/볼륨/음소거를 처리한다. 자동재생 제한을 피하기 위해
          // 사용자 클릭에서 재생하며 기존 음소거 설정도 그대로 존중한다.
          case "effect": audio.playEffect(SOUND_EFFECTS.pop); report("효과음 재생 요청 (음소거 설정 적용)"); break;
          case "music": void audio.playMusic("music/level32.mp3"); report("음악 재생 요청 (음소거 설정 적용)"); break;
          case "stop": audio.stopMusic(); report("음악을 정지했습니다."); break;
          case "count": get<HTMLElement>("[data-count]").textContent = String(++clicks); break;
          case "clear": maskedInput.clear(); input.focus(); report("입력을 초기화했습니다."); break;
          case "menu": {
            const bounds = button.getBoundingClientRect();
            openMenu(bounds.left, bounds.bottom);
            break;
          }
        }
      });
    });

    // 05. 화면 픽셀(clientX/Y)을 게임 내부 좌표로 변환해야 확대/축소에도 정확하다.
    // pointer capture로 밖에서 놓아도 종료를 받는다. 두 번째 손가락/우클릭은 무시한다.
    const area = get<HTMLElement>(".test-level__drag-area");
    const draggable = get<HTMLElement>(".test-level__draggable");
    let drag: { id: number; dx: number; dy: number } | undefined;
    listen(draggable, "pointerdown", (event) => {
      if (event.button !== 0 || drag) return;
      const point = clientPointToLocal(area, event.clientX, event.clientY);
      drag = { id: event.pointerId, dx: point.x - draggable.offsetLeft, dy: point.y - draggable.offsetTop };
      draggable.setPointerCapture(event.pointerId);
      draggable.classList.add("is-dragging");
      event.preventDefault();
    });
    listen(draggable, "pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const point = clientPointToLocal(area, event.clientX, event.clientY);
      const x = Math.max(0, Math.min(point.x - drag.dx, area.clientWidth - draggable.offsetWidth));
      const y = Math.max(0, Math.min(point.y - drag.dy, area.clientHeight - draggable.offsetHeight));
      draggable.style.left = `${x}px`;
      draggable.style.top = `${y}px`;
    });
    const endDrag = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) return;
      drag = undefined;
      draggable.classList.remove("is-dragging");
      if (draggable.hasPointerCapture(event.pointerId)) draggable.releasePointerCapture(event.pointerId);
    };
    listen(draggable, "pointerup", endDrag);
    listen(draggable, "pointercancel", endDrag);
    listen(draggable, "lostpointercapture", endDrag);

    // 06. interval은 반복, timeout은 1회 실행. 예시 페이지가 숨겨져도 초는 계속 센다.
    // 정밀한 애니메이션 시간은 performance.now()/requestAnimationFrame을 사용한다.
    let ticks = 0;
    interval(() => { get<HTMLElement>("[data-ticks]").textContent = String(++ticks); }, 1000);

    // LevelScope가 이벤트/타이머를 해제한 뒤 실행하는 사용자 정리 함수.
    return () => {
      audio.stopMusic();
      screen.style.removeProperty("--test-background");
      screen.style.removeProperty("--test-ink");
    };
  },
};
