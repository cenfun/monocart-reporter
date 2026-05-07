<script setup>
import {
    computed,
    onMounted, reactive, watch
} from 'vue';
import { microtask } from 'async-tick';

const modelValue = defineModel({
    type: [Number, String],
    default: 0
});

const props = defineProps({
    options: {
        type: Array,
        default: () => []
    },
    colors: {
        type: Object,
        default: () => ({})
    }
});

const data = reactive({
    options: []
});

const styleMap = computed(() => {
    const st = {};


    return st;
});

const update = microtask(() => {
    const options = props.options.map((option, i) => {
        if (typeof option === 'string') {
            return {
                label: option,
                value: i
            };
        }
        return option;
    });
    const selectedOption = options.find((option) => option.value === modelValue.value);
    if (selectedOption) {
        options.forEach((option) => {
            option.selected = false;
        });
        selectedOption.selected = true;
    }

    data.options = options;
});

const onTabClick = (item) => {
    if (item.disabled) {
        return;
    }
    modelValue.value = item.value;
};

watch([
    modelValue,
    () => props.options
], (options) => {
    update();
});

onMounted(() => {
    update();
});

</script>

<template>
  <div
    class="mcr-tabs"
    :style="styleMap"
  >
    <div class="mcr-tabs-header">
      <div
        v-for="(item, i) in data.options"
        :key="i"
        :class="['mcr-tabs-item', item.selected ? 'mcr-tabs-selected' : '', item.disabled ? 'mcr-tabs-disabled' : '']"
        @click="onTabClick(item)"
      >
        <div class="mcr-tabs-label">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.mcr-tabs {
    --color-separator: #666;
    --color-hover: #e0e0e0;
    --color-selected: #fff;
    --path-left: path("M0,10 h11 v-10 h-1 Q10,10 0,10 z");
    --path-right: path("M11,10 h-11 v-10 h1 Q1,10 11,10 z");

    position: relative;
    padding-top: 10px;
}

.mcr-tabs-header {
    display: flex;
    gap: 0;
    align-items: flex-end;
    min-height: 36px;
    padding: 8px 10px 0;
    overflow: auto hidden;
    user-select: none;
}

.mcr-tabs-label {
    position: relative;
    display: block;
    min-width: 60px;
    max-width: 200px;
    padding: 10px 15px;
    white-space: nowrap;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
}

.mcr-tabs-item {
    position: relative;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    cursor: pointer;

    &:not(:first-child)::before {
        position: absolute;
        left: 0;
        bottom: 50%;
        content: "";
        width: 1px;
        height: 16px;
        background-color: var(--color-separator);
        transform: translateY(50%);
    }

    &.mcr-tabs-selected {
        position: relative;
        z-index: 1000;
        background-color: var(--color-selected);

        & + .mcr-tabs-item::before {
            display: none;
        }

        &::before {
            position: absolute;
            left: -10px;
            bottom: 0;
            content: "";
            width: 11px;
            height: 10px;
            background-color: var(--color-selected);
            transform: none;
            clip-path: var(--path-left);
        }

        &::after {
            position: absolute;
            bottom: 0;
            right: -10px;
            content: "";
            width: 11px;
            height: 10px;
            background-color: var(--color-selected);
            transform: none;
            clip-path: var(--path-right);
        }
    }

    &.mcr-tabs-disabled {
        cursor: default;
        opacity: 0.5;
    }

    &:hover:not(.mcr-tabs-selected) {
        z-index: 100;
        background-color: var(--color-hover);

        &::before {
            position: absolute;
            left: -10px;
            bottom: 0;
            content: "";
            width: 11px;
            height: 10px;
            background-color: var(--color-hover);
            transform: none;
            clip-path: var(--path-left);
        }

        &::after {
            position: absolute;
            bottom: 0;
            right: -10px;
            content: "";
            width: 11px;
            height: 10px;
            background-color: var(--color-hover);
            transform: none;
            clip-path: var(--path-right);
        }

        & + .mcr-tabs-item:not(.mcr-tabs-selected)::before {
            display: none;
        }
    }
}

</style>
