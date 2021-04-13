import { writable } from "svelte/store";
import { get } from "svelte/store";
import type { LinkModel } from "../model/link-model";

export function getDateParsed(link: LinkModel) {
  const date = new Date(link.date);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export function parseDate(date: string) {
  return new Date(date);
}

export function parseDateAndTime(date: string) {
  const aDate = parseDate(date);

  return `${aDate.toLocaleDateString()}, ${aDate.getHours()}:${aDate.getMinutes()}`;
}

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
