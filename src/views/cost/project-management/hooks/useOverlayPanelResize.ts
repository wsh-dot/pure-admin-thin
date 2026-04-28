import { computed, onBeforeUnmount, ref } from "vue";

interface ResizeOptions {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapseThreshold?: number;
  handleWidth?: number;
  collapsedHotzoneWidth?: number;
}

export function useOverlayPanelResize(options: ResizeOptions = {}) {
  const {
    defaultWidth = 338,
    minWidth = 0,
    maxWidth = Number.POSITIVE_INFINITY,
    collapseThreshold = 24,
    handleWidth = 16,
    collapsedHotzoneWidth = 10
  } = options;

  const panelWidth = ref(defaultWidth);
  const lastExpandedWidth = ref(defaultWidth);
  const collapsed = ref(false);
  const resizing = ref(false);

  const visibleWidth = computed(() =>
    collapsed.value ? collapsedHotzoneWidth : panelWidth.value + handleWidth
  );

  function expand() {
    collapsed.value = false;
    panelWidth.value = lastExpandedWidth.value;
  }

  function collapse() {
    collapsed.value = true;
  }

  function updateWidth(clientX: number, containerRect: DOMRect) {
    const rawWidth = containerRect.right - clientX - handleWidth / 2;
    const maxUsableWidth = Math.max(
      minWidth,
      Math.min(maxWidth, containerRect.width - handleWidth)
    );

    if (rawWidth <= collapseThreshold) {
      collapse();
      return;
    }
    collapsed.value = false;
    panelWidth.value = Math.max(minWidth, Math.min(maxUsableWidth, rawWidth));
    lastExpandedWidth.value = panelWidth.value;
  }

  function stopResize() {
    resizing.value = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResize);
  }

  let activeContainer: HTMLElement | null = null;

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

  function toggle() {
    if (collapsed.value) expand();
    else collapse();
  }

  onBeforeUnmount(() => {
    stopResize();
  });

  return {
    collapsed,
    visibleWidth,
    resizing,
    startResize,
    toggle
  };
}
