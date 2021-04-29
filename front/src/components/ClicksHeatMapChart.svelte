<script lang="ts">
  import { onMount } from "svelte";

  import SvelteHeatmap from "svelte-heatmap";
  import type { LinkDetailModel } from "../model/link-model";
  import { groupBy } from "../utils/array-utils";

  let container;
  export let details: LinkDetailModel[] = [];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const buildData = () => {
    const data = [];
    const grouped = groupBy(details, (detail: LinkDetailModel) => detail.date);

    for (const group of grouped) {
      data.push({ date: group.key, value: group.members.length });
    }

    return data;
  };

  onMount(() => {
    const data = buildData();

    new SvelteHeatmap({
      props: {
        view: "monthly",
        allowOverflow: true,
        cellGap: 1,
        cellRadius: 4,
        data,
        startDate: startDate,
        endDate: new Date(),
        emptyColor: "#f2f2f2",
        monthGap: 5,
      },
      target: container,
    });
  });
</script>

<section class="col-12 col-12-mobilep container medium">
  <h4>Heat map of links clicked</h4>
  <div bind:this={container} />
</section>

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
    div {
      width: 65em;
    }
  }
</style>
