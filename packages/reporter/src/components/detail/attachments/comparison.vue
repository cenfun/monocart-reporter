<script setup>
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
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

    return `<div class="mcr-attachment-comparison">
                <div class="mcr-attachment-head"><span class="mcr-item">${name}</span></div>
                <div class="mcr-attachment-body">${body}</div>
            </div>`;
};

</script>

<template>
  <div class="mcr-attachment-comparison">
    <div class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
        class="mcr-item"
      >{{ props.data.name }}</a>
    </div>
    <div class="mcr-attachment-body">
      ${body}
    </div>
  </div>
</template>

<style lang="scss">

</style>
