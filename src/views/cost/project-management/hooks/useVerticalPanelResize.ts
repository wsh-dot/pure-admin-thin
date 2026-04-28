import { onBeforeUnmount, ref } from "vue";

interface VerticalResizeOptions {
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  minRemainingHeight?: number;
}

export function useVerticalPanelResize(options: VerticalResizeOptions = {}) {
  const {
    defaultHeight = 320,
    minHeight = 180,
    maxHeight = Number.POSITIVE_INFINITY,
    minRemainingHeight = 160
  } = options;

  const panelHeight = ref(defaultHeight);
  const resizing = ref(false);

  let activeContainer: HTMLElement | null = null;

  function updateHeight(clientY: number, containerRect: DOMRect) {
    const rawHeight = containerRect.bottom - clientY;
    const maxUsableHeight = Math.max(
      minHeight,
      Math.min(maxHeight, containerRect.height - minRemainingHeight)
    );

    panelHeight.value = Math.max(
      minHeight,
      Math.min(maxUsableHeight, rawHeight)
    );
  }

  function stopResize() {
    resizing.value = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResize);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!activeContainer) return;
    updateHeight(event.clientY, activeContainer.getBoundingClientRect());
  }

  function startResize(event: MouseEvent, container: HTMLElement | null) {
    if (!container) return;

    resizing.value = true;
    activeContainer = container;
    updateHeight(event.clientY, container.getBoundingClientRect());
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
  }

  onBeforeUnmount(() => {
    stopResize();
  });

  return {
    panelHeight,
    resizing,
    startResize
  };
}
