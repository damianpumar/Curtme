// @ts-nocheck
import { toast } from "@zerodevx/svelte-toast";
import { gaLoad } from "./ga";
import CookiesContent from "../components/CookiesContent.svelte";

export const useCookies = () => {
  const load = () => {
    const cookies = JSON.parse(localStorage.getItem("cookies"));
    if (!cookies) {
      toast.push({
        id: "cookies-toast",
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

  const unload = () => {
    toast.pop();
  };

  return {
    load,
    unload,
  };
};
