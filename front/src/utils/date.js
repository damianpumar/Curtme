import { writable } from "svelte/store";
import { get } from "svelte/store";

export function getDateParsed(link) {
  const date = new Date(link.date);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export function parseDate(dateString) {
  return new Date(dateString);
}

export function parseDateAndTime(dateString) {
  const date = parseDate(dateString);

  return `${date.toLocaleDateString()}, ${date.getHours()}:${date.getMinutes()}`;
}

export function useTimer(seconds) {
  let currentTimer = writable();
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
