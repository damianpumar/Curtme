<script lang="ts">
  import { onMount } from "svelte";

  import Chart from "svelte-frappe-charts";
  import { debug } from "svelte/internal";
  import type { LinkDetailModel } from "../model/link-model";
  import { groupBy } from "../utils/array-utils";

  export let details: LinkDetailModel[];
  let data;

  const buildData = () => {
    const groupedByDate = groupBy(details, (detail: LinkDetailModel) =>
      new Date(detail.date).toDateString()
    );

    const labels: string[] = [];
    const hostAccumulator = {};

    groupedByDate.forEach((groupByDate) => {
      labels.push(groupByDate.key);

      const groupedByHost = groupBy(
        groupByDate.members,
        (detail: LinkDetailModel) => detail.host
      );

      groupedByHost.forEach((groupByHost) => {
        const host = hostAccumulator[groupByHost.key];

        if (host) {
          host.values.push(groupByHost.members.length);
        } else {
          hostAccumulator[groupByHost.key] = {
            name: groupByHost.key,
            values: [groupByHost.members.length],
          };
        }
      });
    });

    const datasets = Object.values(hostAccumulator);

    return {
      labels,
      datasets,
    };
  };

  onMount(() => {
    const mappedData = buildData();

    data = {
      labels: mappedData.labels,
      datasets: mappedData.datasets,
    };
  });
</script>

{#if data}
  <section class="col-12 col-12-mobilep container medium">
    <h4>Source of clicks</h4>
    <Chart {data} type="bar" />
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
