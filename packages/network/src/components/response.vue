<template>
  <VuiFlex
    class="mcr-response"
    direction="column"
  >
    <SummaryList
      title="Response"
      :list="data.list"
    />

    <SummaryList
      title="Response Headers"
      :list="data.headers"
    />

    <SummaryList
      title="Response Cookies"
      :list="data.cookies"
    />
  </VuiFlex>
</template>
<script setup>
import {
    inject, watch, shallowReactive
} from 'vue';
import { components } from 'vine-ui';

import SummaryList from './summary-list.vue';

const { VuiFlex } = components;

const state = inject('state');

const data = shallowReactive({
    list: [],
    headers: [],
    cookies: []
});

const update = (entry) => {
    // console.log(entry);

    const { response } = entry;

    console.log('response', response);

    // http://www.softwareishard.com/blog/har-12-spec/
    data.headers = response.headers;
    data.cookies = response.cookies;
};

watch(() => state.entry, (v) => {
    if (v) {
        update(v);
    }
});
</script>
<style lang="scss">
.mcr-response {
    position: relative;
}
</style>

