<script>
  import { createAuth } from "./auth0";

  // Go to Auth0 to get the values and set everything up.
  // Make sure all callback urls are set correctly.
  const config = {
    domain: "dev-6r8s11fz.eu.auth0.com",
    client_id: "2l41JB9wG62TaX0BmIfILNq6GiTbt92b",
    redirect_uri: window.location.origin,
    useRefreshTokens: true
  };

  const { isAuthenticated, login, logout, authToken, userInfo } = createAuth(
    config
  );

  $: state = {
    isAuthenticated: $isAuthenticated,
    userInfo: $userInfo,
    authToken: $authToken
  };
</script>

<style>
  header {
    background: #444;
    color: #bbb;
    cursor: default;
    height: 3.25em;
    left: 0;
    line-height: 3.25em;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 10000;
    -moz-animation: none;
    -webkit-animation: none;
    -ms-animation: none;
    animation: none;
    background: none;
    color: rgba(255, 255, 255, 0.75);
    position: absolute;
  }

  header h1 {
    color: inherit;
    height: inherit;
    left: 1.25em;
    line-height: inherit;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 0;
  }

  header h1 a {
    color: #fff;
    font-weight: 400;
    border: 0;
    text-decoration: none;
  }

  header nav {
    height: inherit;
    line-height: inherit;
    position: absolute;
    right: 0.75em;
    top: 0;
    vertical-align: middle;
  }

  header nav > ul {
    list-style: none;
    margin: 0;
    padding-left: 0;
  }

  header nav > ul > li {
    display: inline-block;
    padding-left: 0;
  }

  img {
    height: 1.5em;
    vertical-align: middle;
    border-radius: 20%;
  }

  header nav > ul > li button {
    display: inline-block;
    height: 2em;
    line-height: 1.95em;
    padding: 0 1em;
    border-radius: 6px;
  }

  header nav > ul > li a {
    color: #fff;
    display: inline-block;
    text-decoration: none;
    border: 0;
  }

  header nav > ul > li:first-child {
    margin-left: 0;
  }

  header nav > ul > li.active a:not(.button) {
    background-color: rgba(153, 153, 153, 0.25);
  }

  header nav > ul > li button {
    margin: 0 0 0 0.5em;
    position: relative;
  }

  header button {
    background-color: transparent;
    box-shadow: inset 0 0 0 2px #999;
    color: #fff;
  }

  header button:hover {
    background-color: rgba(153, 153, 153, 0.25);
  }

  header button:active {
    background-color: rgba(153, 153, 153, 0.5);
  }

  header nav > ul > li.active a {
    background-color: rgba(255, 255, 255, 0.2);
  }

  header button {
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
  }

  header button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  header button:active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  menu {
    position: relative;
    display: inline-block;
  }

  menu-content {
    display: none;
    position: absolute;
    min-width: 100%;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    border-radius: 5px;
  }

  menu:hover menu-content {
    display: block;
  }

  menu-content button {
    left: 15%;
  }

  @media screen and (max-width: 840px) {
    header {
      display: none;
    }
  }
</style>

<header>
  <h1>
    <a href="/">Curtme</a>
  </h1>
  <nav>
    <ul>
      {#if $isAuthenticated}
        <li>
          <menu>
            <span>
              <img src={$userInfo.picture} alt={$userInfo.name} />
              {$userInfo.name}
              <i class="icon solid fa-angle-down" />
            </span>
            <menu-content>
              <button on:click|preventDefault={() => logout()}>Logout</button>
            </menu-content>
          </menu>

        </li>
      {:else}
        <li>
          <button on:click|preventDefault={() => login()}>Login</button>
        </li>
      {/if}
    </ul>
  </nav>

  <br />
  <div>{JSON.stringify(state, null, 2)}</div>

</header>
