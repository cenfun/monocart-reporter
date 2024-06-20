<script setup>
import Util from '../../utils/util';
import IconLabel from '../icon-label.vue';

const props = defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

const onCopyClick = (e, column) => {
    const container = e.currentTarget && e.currentTarget.parentNode;
    if (!container) {
        return;
    }
    const elem = container.querySelector('.mcr-column-html');
    if (!elem) {
        return;
    }

    Util.copyText(elem.innerText).then((res) => {
        if (res) {
            column.tg_state.copied = 'copied';
            setTimeout(() => {
                column.tg_state.copied = '';
            }, 1000);
        }
    });

};

</script>

<template>
  <div class="mcr-html-content">
    <div
      class="mcr-column-html"
      v-html="props.column.content"
    />
    <div
      class="mcr-column-copy"
      @click="onCopyClick($event, props.column)"
    >
      <IconLabel icon="copy">
        {{ props.column.tg_state.copied }}
      </IconLabel>
    </div>
  </div>
</template>

<style lang="scss">
.mcr-html-content {
    position: relative;
}

.mcr-column-html {
    position: relative;
    padding: 10px;
    overflow-x: auto;
}

.mcr-column-copy {
    position: absolute;
    top: 5px;
    right: 5px;
    display: none;
    padding: 5px;
    border-radius: 5px;
    background-color: #fff;
}

.mcr-html-content:hover {
    .mcr-column-copy {
        display: block;
    }
}

</style>
