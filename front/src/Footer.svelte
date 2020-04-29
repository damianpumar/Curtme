<style>
  footer {
    padding: 4em 0 6em 0;
    text-align: center;
  }

  .icons a {
    -moz-transition: opacity 0.2s ease-in-out;
    -webkit-transition: opacity 0.2s ease-in-out;
    -ms-transition: opacity 0.2s ease-in-out;
    transition: opacity 0.2s ease-in-out;
    opacity: 0.45;
  }

  .icons a:hover {
    opacity: 0.85;
  }

  .copyright {
    color: #fff;
    opacity: 0.45;
    font-size: 0.9em;
    line-height: 1em;
    margin: 2em 0 0 0;
    padding: 0;
    text-align: center;
  }

  .copyright a {
    color: inherit;
  }

  .copyright li {
    display: inline-block;
    list-style: none;
    margin-left: 1em;
    padding-left: 1em;
  }

  .copyright li:first-child {
    border-left: 0;
    margin-left: 0;
    padding-left: 0;
  }

  @media screen and (max-width: 736px) {
    footer {
      padding: 4em 0;
    }

    footer .copyright li {
      border-left: 0;
      line-height: 2em;
      margin-left: 0;
      padding-left: 0;
    }
  }
</style>

<footer>
  <ul class="icons">
    <li>
      <a
        href="https://github.com/damianpumar/Curtme"
        title="Repository open source"
        class="icon brands fa-github">
        <span class="label">Github</span>
      </a>
    </li>
    <li>
      <a
        href="https://curtme.org/developer/"
        target="_blank"
        title="Developer site"
        class="icon brands fa-connectdevelop">
        <span class="label">Swagger</span>
      </a>
    </li>
    <li>
      <a
        href="https://github.com/damianpumar/Curtme/issues/new/"
        target="_blank"
        title="you found an error?"
        class="icon solid fa-bug">
        <span class="label">Bug</span>
      </a>
    </li>
  </ul>
  <ul class="copyright">
    <li>&copy; Curtme.org</li>
    <li>|</li>
    <li>
      <a href="https://damianpumar.com" target="_blank">Damián Pumar</a>
    </li>
  </ul>
</footer>
