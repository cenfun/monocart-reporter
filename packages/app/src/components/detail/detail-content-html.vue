<script setup>
import { onMounted, ref } from 'vue';
import Util from '../../utils/util.js';
import IconLabel from '../icon-label.vue';
import { convertHtml } from '../../modules/detail.js';

const props = defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

const html = ref('');
const isMarkdown = ref(false);

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

onMounted(() => {
    let content = props.column.content;
    if (Util.isList(content)) {
        content = content.map((it) => convertHtml(it)).join('');
    }

    isMarkdown.value = content?.includes('markdown-body');

    html.value = content;
});

</script>

<template>
  <div :class="['mcr-html-content', isMarkdown ? 'mcr-html-markdown' : '']">
    <div
      class="mcr-column-html"
      v-html="html"
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
    padding: 0;
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
    background-color: rgb(255 255 255 / 60%);

    .mcr-icon-label {
        background-color: #fff;
    }
}

.mcr-html-content.mcr-html-markdown {
    .mcr-column-html {
        background-color: var(--bg-primary-fixed);
    }

    .mcr-column-copy {
        background-color: rgb(255 255 255 / 60%);

        .mcr-icon-label {
            color: var(--color-primary-fixed);
            background-color: #fff;
        }
    }
}

.mcr-html-content:hover {
    .mcr-column-copy {
        display: block;
    }
}

</style>
