<script>
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { getLinkDetail } from "../utils/api";
  import {
    CITY,
    WHEN,
    BROWSER,
    PLATFORM,
    DEVICE,
    CONTINENT,
    COUNTRY,
    USER_IP,
    ISP,
    LOADING,
  } from "../utils/resources";
  import { parseDateAndTime } from "../utils/date";

  export let linkId;
  let details = [];

  let responseMessage = LOADING;

  onMount(async () => {
    await getDetail(linkId);
  });

  async function getDetail(id) {
    const response = await getLinkDetail(id);

    const data = await response.json();

    if (response.ok) {
      details = data;
    } else {
      responseMessage = data.error;
    }
  }

  function createGoogleMapsLink(detail) {
    const parse = (value) => value.replace(" ", "+");

    const city = parse(detail.city);
    const country = parse(detail.countryName);

    return `https://www.google.com/maps/search/?api=1&query=${city},${country}`;
  }
</script>

<section
  class="col-12 col-12-mobilep container medium"
  transition:scale={{ start: 0.5 }}
>
  <div class="detail">
    <table class="table">
      <thead>
        <tr>
          <th>{WHEN}</th>
          <th>{BROWSER}</th>
          <th>{PLATFORM}</th>
          <th>{DEVICE}</th>
          <th>{CITY}</th>
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
            <td>{detail.browser}</td>
            <td>{detail.platform} {detail.platformVersion}</td>
            <td>{detail.device}</td>
            <td>
              <a href={createGoogleMapsLink(detail)} target="_blank">
                {detail.city}
              </a>
            </td>
            <td>{detail.continentName}</td>
            <td
              >{detail.countryName}
              <img src={detail.countryEmoji} alt={detail.countryName} />
            </td>
            <td>{detail.ip}</td>
            <td>{detail.isp}</td>
          </tr>
        {:else}
          <tr>
            <td colspan="100%">
              <h5 class="text-center">{responseMessage}</h5>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

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

  img {
    width: 1em;
  }

  @media screen and (max-width: 480px) {
    section {
      padding: 0 1em 0 1em;
    }
  }
</style>
