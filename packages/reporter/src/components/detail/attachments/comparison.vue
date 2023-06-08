<script setup>
import { watchEffect, shallowReactive } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    list: []
});

const getLinkComparison = (item) => {
    return item.list.map((it) => `<div><a href="${it.path}" target="_blank" class="mcr-icon-link">${it.name}</a></div>`).join('');
};

const getImageComparison = (item) => {

    const titles = {
        diff: 'Diff',
        actual: 'Actual',
        expected: 'Expected',
        previous: 'Previous'
    };

    const heads = item.list.map((it) => `<div>${titles[it.category]}</div>`).join('');
    const views = item.list.map((it) => `<div><img src="${it.path}" alt="${it.name}" /></div>`).join('');

    const links = getLinkComparison(item);

    return `<div>
        <div class="vui-flex-row">${heads}</div>
        <div class="">${views}</div>
        ${links}
    </div>`;
};

const getComparison = (item) => {
    console.log(item);
    const { contentType, name } = item;

    const body = contentType.startsWith('image') ? getImageComparison(item) : getLinkComparison(item);

};


watchEffect(() => {
    console.log(props.data);
});

</script>

<template>
  <details
    class="mcr-attachment-comparison"
    open
  >
    <summary class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.name }}</a>
    </summary>
    <div class="mcr-attachment-body">
      ${body}
    </div>
  </details>
</template>

<style lang="scss">

</style>
