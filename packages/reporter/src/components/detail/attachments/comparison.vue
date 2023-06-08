<script setup>
import { watchEffect, shallowReactive } from 'vue';
import { components } from 'vine-ui';

const { VuiFlex, VuiTab } = components;

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    tabIndex: 0
});

const initImageComparison = () => {
    d.list = null;
    const { contentType, list } = props.data;
    if (contentType && contentType.startsWith('image')) {
        const titles = {
            diff: 'Diff',
            actual: 'Actual',
            expected: 'Expected',
            previous: 'Previous'
        };

        d.list = list.map((it) => {
            return {
                title: titles[it.category],
                name: it.name,
                path: it.path
            };
        });
    }
};

watchEffect(() => {
    initImageComparison();
});

</script>

<template>
  <details
    class="mcr-attachment-comparison"
    open
  >
    <summary class="mcr-attachment-head">
      {{ props.data.name }}
    </summary>
    <div class="mcr-attachment-body">
      <VuiTab
        v-if="d.list"
        v-model="d.tabIndex"
      >
        <template #tabs>
          <div
            v-for="(item, i) of d.list"
            :key="i"
          >
            {{ item.title }}
          </div>
        </template>
        <template #panes>
          <div
            v-for="(item, i) of d.list"
            :key="i"
          >
            <img
              :src="item.path"
              :alt="item.name"
            >
          </div>
        </template>
      </VuiTab>

      <VuiFlex
        direction="column"
        gap="5px"
        padding="10px"
      >
        <a
          v-for="(item, i) of props.data.list"
          :key="i"
          :href="item.path"
          target="_blank"
          class="mcr-item"
        >{{ item.name }}</a>
      </VuiFlex>
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-comparison {
    .mcr-attachment-head {
        cursor: default;
    }

    .vui-tab-header {
        background: #eee;
    }

    .vui-tab-tabs {
        padding-top: 5px;
    }

    .vui-tab-item {
        justify-content: center;
        height: 30px;
        min-width: 81px;
        line-height: 30px;
    }

    .vui-tab-item::before {
        bottom: 10px;
        height: 10px;
    }

    .vui-tab-pane {
        img {
            display: block;
            max-width: 100%;
        }
    }
}
</style>
