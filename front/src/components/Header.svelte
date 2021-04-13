<script>
  import { blur } from "svelte/transition";
  import { createAuth } from "../auth0";
  import { AUTH0 } from "../utils/config";

  const {
    isAuthenticated,
    isLoading,
    login,
    logout,
    userInfo
  } = createAuth(AUTH0);
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

  header nav > ul > li:first-child {
    margin-left: 0;
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
    header h1 a {
      display: none;
    }
  }
</style>

<header>
  <h1>
    <a href="/">Curtme</a>
  </h1>
  {#if !$isLoading}
    <nav>
      <ul>
        {#if $isAuthenticated}
          <li>
            <menu transition:blur={{ amount: 100 }}>
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
  {/if}

</header>
