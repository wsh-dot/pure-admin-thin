import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { computed, onBeforeUnmount, ref } from "vue";

dayjs.locale("zh-cn");

export function useCostClock() {
  const now = ref(dayjs());
  const timer = window.setInterval(() => {
    now.value = dayjs();
  }, 1000 * 30);

  const dateText = computed(() => now.value.format("YYYY-M-D dddd"));
  const timeText = computed(() => now.value.format("HH:mm"));

  onBeforeUnmount(() => {
    window.clearInterval(timer);
  });

  return {
    dateText,
    timeText
  };
}
