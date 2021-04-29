<script lang="ts">
  import type { LinkDetailModel } from "../model/link-model";
  import DetailLinkTable from "../components/DetailLinkTable.svelte";
  import { LOADING } from "../utils/resources";
  import ClicksHeatMapChart from "../components/ClicksHeatMapChart.svelte";
  import HostBarChart from "../components/HostBarChart.svelte";
  import DevicesPieChart from "../components/DevicesPieChart.svelte";
  import BrowserPieChart from "../components/BrowserPieChart.svelte";
  import CountryPieChart from "../components/CountryPieChart.svelte";
  import CityPieChart from "../components/CityPieChart.svelte";

  export let details: LinkDetailModel[];
  export let message: string = LOADING;
</script>

{#if details}
  <DetailLinkTable {details} {message} />

  <HostBarChart {details} />

  <div class="col-12 col-12-mobilep container row">
    <DevicesPieChart {details} />

    <BrowserPieChart {details} />
  </div>

  <div class="col-12 col-12-mobilep container row">
    <CountryPieChart {details} />

    <CityPieChart {details} />
  </div>

  <ClicksHeatMapChart {details} />
{/if}
