<script>
  import { onMount } from "svelte";
  import Link from "./Link.svelte";

  const STORAGE_KEY = "links";

  let longURL = null;
  let links = [];

  onMount(() => {
    const linksStored = localStorage.getItem(STORAGE_KEY);

    if (linksStored) {
      links = JSON.parse(linksStored);
    }
  });

  function addNewLink(link) {
    links = [...links, link];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  async function createShortURL() {
    const data = {
      url: longURL
    };

    const response = await fetch("https://curtme.org", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const link = await response.json();

    if (response.ok) {
      longURL = null;

      addNewLink(link);
    }
  }
</script>

<section id="banner" class="container medium">
  <h2>Curtme.org</h2>
  <p>Free, open source and unlimited link shorter</p>
  <div class="row">
    <div class="col-12 col-12-mobilep">
      <input
        type="text"
        bind:value={longURL}
        placeholder="Paste long url and shorten it"
        on:keypress={e => (e.keyCode == 13 ? createShortURL() : null)}
        required />
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-12-mobilep">
      <button class="button" on:click={createShortURL}>Short</button>
    </div>
  </div>
</section>

{#each links as link}
  <Link {link} />
{/each}
