import { writable } from "svelte/store";
import { get } from "svelte/store";

export function useTimer(seconds: number) {
  let currentTimer = writable(0);
  let downloadTimer = null;

  const startTimer = (finish) => {
    currentTimer.set(seconds);
    downloadTimer = setInterval(function () {
      let remainingSeconds = get(currentTimer);

      if (remainingSeconds === 1) {
        cancelTimer();
        finish();
      } else {
        currentTimer.set(--remainingSeconds);
      }
    }, 1000);
  };
  const cancelTimer = () => {
    clearInterval(downloadTimer);
  };
  return {
    startTimer,
    cancelTimer,
    currentTimer,
  };
}
