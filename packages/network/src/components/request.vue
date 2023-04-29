<template>
  <VuiFlex
    class="mcr-request"
    direction="column"
  >
    <SummaryList
      title="Request"
      :list="data.list"
    />
    <SummaryList
      title="Query String Parameters"
      :list="data.queryString"
    />

    <SummaryList
      title="Request Headers"
      :list="data.headers"
    />

    <SummaryList
      title="Request Cookies"
      :list="data.cookies"
    />

    <SummaryList
      title="Post Data"
      :list="data.postData"
    />
  </VuiFlex>
</template>
<script setup>
import {
    inject, watch, shallowReactive
} from 'vue';
import { components } from 'vine-ui';

import SummaryList from './summary-list.vue';
import Util from '../utils/util.js';

const { VuiFlex } = components;

const state = inject('state');

const data = shallowReactive({
    list: [],
    queryString: [],
    headers: [],
    cookies: [],
    postData: []
});

const update = (entry) => {

    const { request } = entry;

    console.log('request', request);

    // http://www.softwareishard.com/blog/har-12-spec/
    data.list = [{
        name: 'url',
        value: request.url
    }, {
        name: 'method',
        value: request.method
    }, {
        name: 'http version',
        value: request.httpVersion
    }, {
        name: 'heads size',
        value: Util.NF(request.headersSize)
    }, {
        name: 'body size',
        value: Util.NF(request.bodySize)
    }];

    if (request.comment) {
        data.list.push({
            name: 'comment',
            value: request.comment
        });
    }

    data.queryString = request.queryString || [];
    data.headers = request.headers || [];
    data.cookies = request.cookies || [];

    data.postData = [];

    const postData = request.postData;
    if (postData) {
        Object.keys(postData).forEach((k) => {
            data.postData.push({
                name: k,
                value: postData[k]
            });
        });
    }


};

watch(() => state.entry, (v) => {
    if (v) {
        update(v);
    }
});

</script>
<style lang="scss">
.mcr-request {
    position: relative;
}
</style>
