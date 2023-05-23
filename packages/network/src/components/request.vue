<script setup>
import {
    inject, watch, shallowReactive
} from 'vue';

import SummaryList from './summary-list.vue';
import SummaryTable from './summary-table.vue';

import Util from '../utils/util.js';

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

    // console.log('request', request);

    // http://www.softwareishard.com/blog/har-12-spec/
    data.list = [{
        name: 'Request URL',
        value: request.url
    }, {
        name: 'Request Method',
        value: request.method
    }, {
        name: 'HTTP Version',
        value: request.httpVersion
    }, {
        name: 'Transfer Size',
        value: Util.getTransferSize(request)
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
            if (k === 'params') {
                data.params = postData[k];
                return;
            }
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

<template>
  <div class="mcr-summary-container">
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

    <SummaryTable
      title="Request Cookies"
      :list="data.cookies"
    />

    <SummaryList
      title="Post Data"
      :list="data.postData"
    >
      <SummaryTable
        title="params"
        :list="data.params"
      />
    </SummaryList>
  </div>
</template>

<style lang="scss">
.mcr-summary-container {
    position: relative;

    > div:not(:last-child) {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ccc;
    }
}
</style>
