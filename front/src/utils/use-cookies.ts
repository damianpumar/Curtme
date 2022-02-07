import { toast } from "@zerodevx/svelte-toast";
import { gaLoad } from "./ga";
import CookiesContent from "../components/CookiesContent.svelte";

const COOKIES_KEY = "cookies";

let toastId = 0;

export const useCookies = () => {
  const load = () => {
    const cookies = JSON.parse(localStorage.getItem(COOKIES_KEY));
    if (!cookies) {
      toastId = toast.push({
        target: "cookies-toast",
        component: {
          src: CookiesContent,
        },
        dismissable: false,
      });

      return;
    }

    if (cookies.accepted) gaLoad();
  };

  const close = (accepted: Boolean) => {
    hide();

    localStorage.setItem(
      COOKIES_KEY,
      JSON.stringify({
        accepted,
      })
    );
  };

  const hide = () => {
    toast.pop(toastId);
  };

  return {
    load,
    close,
    hide,
  };
};
