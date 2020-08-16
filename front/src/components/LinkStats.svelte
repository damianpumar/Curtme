<script>
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { getLinkDetail, getISPData } from "../utils/api";
  import {
    LINK_VISITED_FEATURE,
    CITY,
    WHEN,
    REGION,
    CONTINENT,
    COUNTRY,
    USER_IP,
    ISP,
    LOADING_ISP_DATA,
  } from "../utils/resources";
  import { parseDateAndTime } from "../utils/date";

  export let linkId;
  let details = [];

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

  async function getISPName(detail) {
    const response = await getISPData(detail.ip);

    if (response.ok) {
      return await response.json();
    }
  }
</script>

<style>
  .detail {
    background-color: white;
    border-radius: 5px;
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

  @media screen and (max-width: 480px) {
    section {
      padding: 0 1em 0 1em;
    }
  }
</style>

<section
  class="col-12 col-12-mobilep container medium"
  transition:scale={{ start: 0.5 }}>
  <div class="detail">

    <table class="table">
      <thead>
        <tr>
          <th>{WHEN}</th>
          <th>{CITY}</th>
          <th>{REGION}</th>
          <th>{CONTINENT}</th>
          <th>{COUNTRY}</th>
          <th>{USER_IP}</th>
          <th>{ISP}</th>
        </tr>
      </thead>
      <tbody>
        {#each details as detail}
          <tr>
            <td>{parseDateAndTime(detail.date)}</td>
            <td>
              <a href={createGoogleMapsLink(detail)} target="_blank">
                {detail.city}
              </a>
            </td>
            <td>{detail.regionName}</td>
            <td>{detail.continentName}</td>
            <td>{detail.countryName} {detail.countryEmoji}</td>
            <td>{detail.ip}</td>
            {#await getISPName(detail)}
              <p>{LOADING_ISP_DATA}</p>
            {:then data}
              <td>{data.isp}</td>
            {/await}
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
