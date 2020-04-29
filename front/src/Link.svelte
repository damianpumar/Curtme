<script>
  import { fade, fly } from "svelte/transition";
  import { VISIT_LINK } from "./utils/config.js";

  export let link;

  function copyClipboard() {
    if (navigator.clipboard) {
      return navigator.clipboard
        .writeText(endpoint + link.shortURL)
        .catch(function(err) {
          throw err !== undefined
            ? err
            : new DOMException("The request is not allowed", "NotAllowedError");
        });
    }
  }

  function getDateParsed() {
    const date = new Date(link.date);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }
</script>

<style>
  .result {
    background-color: white;
    border-radius: 5px;
    border: solid 1px lightgray;
    margin-top: 2em;
    -webkit-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    -moz-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
  }

  .result:hover {
    -webkit-box-shadow: -4px 3px 29px -8px rgba(179, 179, 179, 1);
    -moz-box-shadow: -4px 3px 29px -8px rgba(179, 179, 179, 1);
    box-shadow: -4px 3px 29px -8px rgba(179, 179, 179, 1);
  }

  .result p {
    font-size: 1em !important;
    color: black;
    margin-bottom: 0 !important;
    margin-left: 10px;
    text-align: left;
  }

  .date-link {
    float: right;
    margin-top: 5px !important;
    margin-right: 5px !important;
    text-align: center !important;
    border: solid 1px black;
    width: 15%;
    border-radius: 3px;
  }

  .visited-link {
    align-self: flex-end;
    margin-right: 10px !important;
    margin-left: auto;
  }

  .title-link {
    font-weight: bold;
  }

  .long-link {
    text-align: left;
    color: gray;
  }

  .short-link {
    margin-top: 20px !important;
    color: gray;
    width: 14em;
  }

  button {
    background-color: transparent;
    box-shadow: unset !important;
    color: #e89980;
    padding-top: 10px;
    padding-left: 1px !important;
  }

  button:hover {
    color: lightgray;
  }
</style>

<div
  class="col-12 col-12-mobilep container medium"
  in:fly={{ y: 200, duration: 2000 }}
  out:fade>
  <div class="result">
    <p class="date-link">{getDateParsed()}</p>
    <p class="title-link">{link.title}</p>
    <p class="long-link">
      <a href={link.longURL} target="blank">{link.longURL}</a>
    </p>
    <div class="row">
      <p class="short-link">
        <a href={VISIT_LINK(link.shortURL)} class="short_url" target="blank">
          {VISIT_LINK(link.shortURL)}
        </a>
      </p>
      <button class="icon regular fa-copy" on:click={copyClipboard} />
      <div class="visited-link">
        <span>{link.visited} Clicks</span>
      </div>
    </div>
  </div>
</div>
