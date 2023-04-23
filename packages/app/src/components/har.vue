<template>
  <div class="mcr-har">
    <VuiFlex
      direction="column"
      height="100%"
    >
      <div>Header</div>
      <div
        class="vui-flex-auto mcr-har-grid"
      />
    </VuiFlex>
    <VuiLoading
      :visible="data.loading"
      center
    />
  </div>
</template>
<script setup>
import { shallowReactive, onActivated } from 'vue';
import { components } from 'vine-ui';
import { microtask } from 'async-tick';
import { Grid } from 'turbogrid';

import Util from '../utils/util.js';
import state from '../modules/state.js';

const { VuiLoading, VuiFlex } = components;

const data = shallowReactive({
    loading: false
});

const createGrid = () => {
    const grid = new Grid('.mcr-har-grid');
    data.grid = grid;

    grid.setOption({
        rowNumberVisible: true
    });

    return grid;
};

const updateGrid = (gridData) => {
    let grid = data.grid;
    if (!grid) {
        grid = createGrid();
    }

    grid.setData(gridData);
    grid.render();

};

const getGridData = (harData) => {
    console.log(harData);

    const rows = harData.log.entries.map((item) => {

        const req = item.request;
        const res = item.response;

        const url = new URL(req.url);

        return {
            name: url.pathname,
            method: req.method,
            status: res.status
        };

    });

    const columns = [{
        id: 'name',
        name: 'Name'
    }, {
        id: 'method',
        name: 'Method'
    }, {
        id: 'status',
        name: 'Status'
    }];
    return {
        rows, columns
    };
};

const update = microtask(async () => {

    const d = state.flyoverData;
    if (!d) {
        return;
    }

    data.loading = true;

    const str = await Util.loadJsonp(d.path);

    if (!str) {
        console.log('failed to load jsonp data');
        return;
    }

    const harData = JSON.parse(Util.decompress(str));
    const gridData = getGridData(harData);

    data.loading = false;

    updateGrid(gridData);

});


onActivated(() => {
    update();
});
</script>
<style lang="scss">
.mcr-har {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
