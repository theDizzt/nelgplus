export interface LocalPoint {
  readonly x: number;
  readonly y: number;
}

function localScale(container: HTMLElement): { x: number; y: number } {
  const bounds = container.getBoundingClientRect();
  return {
    x: bounds.width > 0 ? container.clientWidth / bounds.width : 1,
    y: bounds.height > 0 ? container.clientHeight / bounds.height : 1,
  };
}

export function clientPointToLocal(container: HTMLElement, clientX: number, clientY: number): LocalPoint {
  const bounds = container.getBoundingClientRect();
  const scale = localScale(container);
  return {
    x: (clientX - bounds.left) * scale.x,
    y: (clientY - bounds.top) * scale.y,
  };
}

export function positionFloatingElement(
  container: HTMLElement,
  element: HTMLElement,
  clientX: number,
  clientY: number,
  padding = 4,
): void {
  const point = clientPointToLocal(container, clientX, clientY);
  const elementBounds = element.getBoundingClientRect();
  const scale = localScale(container);
  const elementWidth = elementBounds.width * scale.x;
  const elementHeight = elementBounds.height * scale.y;
  const maximumX = Math.max(padding, container.clientWidth - elementWidth - padding);
  const maximumY = Math.max(padding, container.clientHeight - elementHeight - padding);

  element.style.left = `${Math.max(padding, Math.min(point.x, maximumX))}px`;
  element.style.top = `${Math.max(padding, Math.min(point.y, maximumY))}px`;
}

export function localElementBounds(container: HTMLElement, element: HTMLElement): DOMRect {
  const containerBounds = container.getBoundingClientRect();
  const elementBounds = element.getBoundingClientRect();
  const scale = localScale(container);
  return new DOMRect(
    (elementBounds.left - containerBounds.left) * scale.x,
    (elementBounds.top - containerBounds.top) * scale.y,
    elementBounds.width * scale.x,
    elementBounds.height * scale.y,
  );
}
