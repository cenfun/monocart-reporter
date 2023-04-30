<template>
  <div class="mcr-summary-container">
    <SummaryList
      title="Response"
      :list="data.list"
    />

    <SummaryList
      title="Response Headers"
      :list="data.headers"
    />

    <SummaryTable
      title="Response Cookies"
      :list="data.cookies"
    />
  </div>
</template>
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
    headers: [],
    cookies: []
});

const update = (entry) => {
    // console.log(entry);

    const { response } = entry;
    const content = response.content;

    // console.log('response', response);

    // http://www.softwareishard.com/blog/har-12-spec/

    const statusText = response.statusText || (entry.statusType === 'ok' ? 'OK' : '');
    const failureText = response._failureText ? ` (${response._failureText})` : '';
    const statusStr = `<span class="mcr-status-${entry.statusType}">${response.status} ${statusText}${failureText}</span>`;

    data.list = [{
        name: 'Status',
        value: statusStr
    }, {
        name: 'Remote Address',
        value: entry.removeAddress
    }, {
        name: 'HTTP Version',
        value: response.httpVersion
    }, {
        name: 'Resource Type',
        value: `${content.mimeType} (${entry.resourceType})`
    }, {
        name: 'Resource Size',
        value: `${Util.NF(Math.max(content.size, 0))} Bytes`
    }, {
        name: 'Transfer Size',
        value: Util.getTransferSize(response)
    }];

    if (entry.statusType === 'redirect' && Util.hasOwn(response, 'redirectURL')) {
        data.list.push({
            name: 'redirectURL',
            value: response.redirectURL
        });
    }

    console.log(response);

    if (response.comment) {
        data.list.push({
            name: 'comment',
            value: response.comment
        });
    }

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
.mcr-summary-container {
    position: relative;
}
</style>

