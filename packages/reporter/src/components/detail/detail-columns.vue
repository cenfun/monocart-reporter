<script setup>

import IconLabel from '../icon-label.vue';

const props = defineProps({
    list: {
        type: Array,
        default: null
    }
});

const itemColumnClass = (item) => {
    return ['mcr-detail-column', `mcr-detail-${item.id}`];
};

const columnContentClass = (column) => {
    const cls = ['mcr-column-content'];
    if (column.collapsed) {
        cls.push('mcr-column-collapsed');
    } else {
        cls.push('mcr-column-expanded');
    }
    return cls;
};

const onColumnHeadClick = (column) => {
    column.collapsed = !column.collapsed;
};

</script>

<template>
  <div>
    <div
      v-for="column, dk in props.list"
      :key="dk"
      :class="itemColumnClass(column.data)"
      :position-id="column.positionId"
      :position-type="column.positionType"
    >
      <IconLabel
        :icon="column.collapsed?'collapsed':'expanded'"
        class="mcr-column-head"
        @click="onColumnHeadClick(column)"
      >
        <IconLabel
          :icon="column.icon"
          size="20px"
        >
          {{ column.data.name }}
        </IconLabel>
      </IconLabel>
      <div
        :class="columnContentClass(column)"
        v-html="column.content"
      />
    </div>
  </div>
</template>
