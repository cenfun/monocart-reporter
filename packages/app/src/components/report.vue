<template>
  <VuiFlex
    direction="column"
    class="mcr-menu-detail"
  >
    <div class="mcr-menu-main vui-flex-auto">
      <VuiFlex
        gap="15px"
        direction="column"
        padding="20px"
      >
        <Pie />
        <VuiFlex
          gap="10px"
          wrap
        >
          <span
            v-for="(item, k) of state.tags"
            :key="k"
            :style="item.style"
            class="mcr-case-tag"
          >{{ k }}</span>
        </VuiFlex>
        <template v-if="state.testInfo">
          <VuiFlex
            v-for="(item, i) in state.testInfo"
            :key="i"
            gap="10px"
            class="mcr-menu-info"
          >
            <IconLabel
              :icon="item.icon"
              :button="false"
            >
              {{ item.name }}
            </IconLabel>
            <div>{{ item.value }}</div>
          </VuiFlex>
        </template>
      </VuiFlex>
    </div>
    <div class="mcr-menu-footer">
      <VuiFlex
        gap="10px"
        padding="10px"
      >
        <a
          href="https://github.com/microsoft/playwright"
          target="_blank"
        ><IconLabel
          icon="playwright"
          size="20px"
        >
          {{ state.titlePlaywright }}
        </IconLabel>
        </a>

        <a
          href="https://github.com/cenfun/monocart-reporter"
          target="_blank"
        ><IconLabel
          icon="github"
          size="20px"
        >
          {{ state.titleReporter }}
        </IconLabel>
        </a>
      </VuiFlex>
    </div>
  </VuiFlex>
</template>

<script setup>
import { components } from 'vine-ui';
import IconLabel from './icon-label.vue';
import state from '../modules/state.js';

import Pie from './pie.vue';

const { VuiFlex } = components;

</script>
<style lang="scss">
.mcr-menu-detail {
    height: 100%;
}

.mcr-menu-info {
    padding-left: 10px;

    .mcr-icon-label {
        width: 80px;
    }

    label {
        font-weight: bold;
    }
}

.mcr-menu-footer {
    border-top: 1px solid #ddd;
    background-color: #eee;

    a:visited,
    a:link {
        color: #333;
    }
}
</style>
