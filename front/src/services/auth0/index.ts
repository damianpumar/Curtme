import { onMount, setContext, getContext } from "svelte";
import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";
import {
  gaEventUserClickLogin,
  gaEventUserClickLogout,
  gaEventUserLoggedLogin,
} from "../../utils/ga";
import {
  initialized,
  isLoading,
  isAuthenticated,
  authToken,
  userInfo,
  authError,
  AUTH_KEY,
  Auth0Config,
} from "./auth0.store";

// Default Auth0 expiration time is 10 hours or something like that.
// If you want to get fancy you can parse the JWT token and get
// token's actual expiration time.
const refreshRate = 10 * 60 * 60 * 1000;

const createAuth = (config: Auth0Config) => {
  let auth0Client: Auth0Client = null;
  let intervalId: number = null;

  onMount(async () => {
    auth0Client = await createAuth0Client(config);

    const params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
      authError.set(new Error(params.get("error_description")));
    }

    if (params.has("code")) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
      authError.set(null);
    }

    const isUserAuthenticated = await auth0Client.isAuthenticated();
    isAuthenticated.set(isUserAuthenticated);

    if (isUserAuthenticated) {
      gaEventUserLoggedLogin();

      userInfo.set(await auth0Client.getUser());

      const token = await auth0Client.getTokenSilently();
      authToken.set(token);

      intervalId = setInterval(async () => {
        authToken.set(await auth0Client.getTokenSilently());
      }, refreshRate);
    }
    isLoading.set(false);
    initialized.set(true);

    return () => {
      intervalId && clearInterval(intervalId);
    };
  });

  const login = async (redirectPage) => {
    gaEventUserClickLogin();
    await auth0Client.loginWithRedirect({
      redirect_uri: redirectPage || window.location.origin,
      prompt: "login",
    });
  };

  const logout = () => {
    auth0Client.logout({
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
};

const getAuth = () => {
  return getContext(AUTH_KEY);
};

export { createAuth, getAuth };
