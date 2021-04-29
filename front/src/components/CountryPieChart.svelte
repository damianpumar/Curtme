<script lang="ts">
  import { onMount } from "svelte";

  import Chart from "svelte-frappe-charts";
  import type { LinkDetailModel } from "../model/link-model";
  import { groupBy } from "../utils/array-utils";

  export let details: LinkDetailModel[];
  let data;

  const buildData = () => {
    const groupedByDevice = groupBy(
      details,
      (detail: LinkDetailModel) => detail.countryName
    );

    const labels: string[] = [];
    const values: number[] = [];

    groupedByDevice.forEach((groupByDevice) => {
      labels.push(groupByDevice.key);
      values.push(groupByDevice.members.length);
    });

    return {
      labels,
      values,
    };
  };

  onMount(() => {
    const mappedData = buildData();

    data = {
      labels: mappedData.labels,
      datasets: [
        {
          values: mappedData.values,
        },
      ],
    };
  });
</script>

{#if data}
  <section class="col-5 rev-off-5 col-12-mobilep">
    <h4>Country</h4>
    <Chart {data} type="pie" />
  </section>
{/if}

<style>
  section {
    padding: 10px 10px;
    background-color: white;
    border-radius: 5px;
    margin-top: 1em;
    border: solid 1px lightgray;
    -webkit-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    -moz-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    overflow-x: auto;
  }

  @media screen and (max-width: 480px) {
    section {
      max-width: 95%;
    }
  }
</style>
