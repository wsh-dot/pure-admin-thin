import { onBeforeUnmount, ref } from "vue";

interface HorizontalResizeOptions {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  minRemainingWidth?: number;
}

export function useHorizontalPanelResize(
  options: HorizontalResizeOptions = {}
) {
  const {
    defaultWidth = 360,
    minWidth = 180,
    maxWidth = Number.POSITIVE_INFINITY,
    minRemainingWidth = 240
  } = options;

  const panelWidth = ref(defaultWidth);
  const resizing = ref(false);

  let activeContainer: HTMLElement | null = null;

  function updateWidth(clientX: number, containerRect: DOMRect) {
    const rawWidth = clientX - containerRect.left;
    const maxUsableWidth = Math.max(
      minWidth,
      Math.min(maxWidth, containerRect.width - minRemainingWidth)
    );

    panelWidth.value = Math.max(minWidth, Math.min(maxUsableWidth, rawWidth));
  }

  function stopResize() {
    resizing.value = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResize);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!activeContainer) return;
    updateWidth(event.clientX, activeContainer.getBoundingClientRect());
  }

  function startResize(event: MouseEvent, container: HTMLElement | null) {
    if (!container) return;

    resizing.value = true;
    activeContainer = container;
    updateWidth(event.clientX, container.getBoundingClientRect());
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
  }

  onBeforeUnmount(() => {
    stopResize();
  });

  return {
    panelWidth,
    resizing,
    startResize
  };
}
