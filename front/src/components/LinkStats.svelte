<script>
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";

  import { getLinkDetail } from "../utils/api";

  export let linkId;

  let details = [];
  const featureEnableMessage =
    "This functionality was enabled on August 8, 2020";
  let emptyMessage = "This link is not visited yet.";

  onMount(async () => {
    await getDetail(linkId);
  });

  async function getDetail(id) {
    const response = await getLinkDetail(id);

    const data = await response.json();

    if (response.ok) {
      details = data;
    } else {
      emptyMessage = `${data.error}. ${featureEnableMessage}`;
    }
  }

  function createGoogleMapsLink(detail) {
    const parse = (value) => value.replace(" ", "+");

    const city = parse(detail.city);
    const region = parse(detail.regionName);
    const country = parse(detail.countryName);

    return `https://www.google.com/maps/search/?api=1&query=${city},${region},${country}`;
  }
</script>

<style>
  .detail {
    background-color: white;
    border-radius: 5px;
    height: 900px;
    margin-top: 1em;
    border: solid 1px lightgray;
    -webkit-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    -moz-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    overflow-x: auto;
  }

  table {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  td {
    text-align: center;
  }
</style>

<section
  class="col-12 col-12-mobilep container medium"
  transition:scale={{ start: 0.5 }}>
  <div class="detail">

    <table class="table">
      <thead>
        <tr>
          <th>When</th>
          <th>City</th>
          <th>Region</th>
          <th>Continent</th>
          <th>Country</th>
          <th>User IP</th>
        </tr>
      </thead>
      <tbody>
        {#each details as detail}
          <tr>
            <td>{new Date(detail.date).toLocaleDateString()}</td>
            <td>
              <a href={createGoogleMapsLink(detail)} target="_blank">
                {detail.city}
              </a>
            </td>
            <td>{detail.regionName}</td>
            <td>{detail.continentName}</td>
            <td>{detail.countryName} {detail.countryEmoji}</td>
            <td>
              <a
                href={`https://www.whoismyisp.org/ip/${detail.ip}`}
                target="_blank">
                {detail.ip}
              </a>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="100%">
              <h5 class="text-center">{emptyMessage}</h5>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

  </div>
</section>
