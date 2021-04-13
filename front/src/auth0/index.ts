import { onMount, setContext, getContext } from "svelte";
import createAuth0Client from "@auth0/auth0-spa-js";
import {
  gaEventUserClickLogin,
  gaEventUserClickLogout,
  gaEventUserLoggedLogin,
} from "../utils/ga";
import {
  isLoading,
  isAuthenticated,
  authToken,
  userInfo,
  authError,
  AUTH_KEY,
} from "./auth0.store";

// Default Auth0 expiration time is 10 hours or something like that.
// If you want to get fancy you can parse the JWT token and get
// token's actual expiration time.
const refreshRate = 10 * 60 * 60 * 1000;

function createAuth(config) {
  let auth0 = null;
  let intervalId = undefined;

  onMount(async () => {
    auth0 = await createAuth0Client(config);

    const params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
      authError.set(new Error(params.get("error_description")));
    }

    if (params.has("code")) {
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
      authError.set(null);
    }

    const _isAuthenticated = await auth0.isAuthenticated();
    isAuthenticated.set(_isAuthenticated);

    if (_isAuthenticated) {
      gaEventUserLoggedLogin();

      userInfo.set(await auth0.getUser());

      const token = await auth0.getTokenSilently();
      authToken.set(token);

      intervalId = setInterval(async () => {
        authToken.set(await auth0.getTokenSilently());
      }, refreshRate);
    }
    isLoading.set(false);

    return () => {
      intervalId && clearInterval(intervalId);
    };
  });

  const login = async (redirectPage) => {
    gaEventUserClickLogin();
    await auth0.loginWithRedirect({
      redirect_uri: redirectPage || window.location.origin,
      prompt: "login",
    });
  };

  const logout = () => {
    auth0.logout({
      returnTo: window.location.origin,
    });

    gaEventUserClickLogout();
  };

  const auth = {
    isLoading,
    isAuthenticated,
    authToken,
    authError,
    login,
    logout,
    userInfo,
  };

  setContext(AUTH_KEY, auth);

  return auth;
}

function getAuth() {
  return getContext(AUTH_KEY);
}

export { createAuth, getAuth };
