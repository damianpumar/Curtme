<script>
  import {
    Auth0Context,
    authError,
    authToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    userInfo
  } from "@dopry/svelte-auth0";
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

  header nav > ul > li button {
    display: inline-block;
    height: 2em;
    line-height: 1.95em;
    padding: 0 1em;
    border-radius: 6px;
  }

  header nav > ul > li a:not(.button) {
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

  header nav > ul > li.active a:not(.button) {
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
</style>

<!-- <Auth0Context
  domain="dev-6r8s11fz.eu.auth0.com"
  client_id="2l41JB9wG62TaX0BmIfILNq6GiTbt92b">
  {$isLoading} -->
<header class="alt">
  <h1>
    <a href="/">Curtme</a>
  </h1>
  <nav id="nav">
    <ul>
      <!-- {#if $isAuthenticated}
          <li>
            <button on:click|preventDefault={() => logout()}>Logout</button>
          </li>
        {:else}
          <li>
            <button on:click|preventDefault={() => login()}>Login</button>
          </li>
        {/if} -->
    </ul>
  </nav>
</header>

<!-- </Auth0Context> -->
