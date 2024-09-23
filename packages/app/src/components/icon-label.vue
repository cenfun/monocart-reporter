<script setup>
import {
    computed, onMounted, ref, useSlots, watch
} from 'vue';

import { decodeIcons } from '../common/common.js';
const context = require.context('../images/icons', true, /\.svg$/);
const icons = decodeIcons(context);

const props = defineProps({
    icon: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: ''
    },
    gap: {
        type: String,
        default: ''
    },
    button: {
        type: Boolean,
        default: true
    },
    primary: {
        type: Boolean,
        default: false
    }
});

const el = ref(null);
const slots = useSlots();

const classMap = computed(() => {
    const list = ['mcr-icon-label', 'vui-flex-row'];
    if (props.button) {
        list.push('mcr-icon-label-button');
        if (props.primary) {
            list.push('mcr-icon-label-primary');
        }
    }
    return list;
});

const styleMap = computed(() => {
    const st = {};
    if (props.size) {
        st['--mcr-icon-size'] = props.size;
    }
    if (props.gap) {
        st['--mcr-icon-gap'] = props.gap;
    }
    return st;
});

const getSlot = function() {
    const fun = slots.default;
    if (typeof fun === 'function') {
        return fun();
    }
};

const labelContent = computed(() => {
    return props.label || getSlot();
});

const showIcon = () => {

    if (!props.icon) {
        return;
    }

    const svg = icons[props.icon];

    if (!svg) {
        return;
    }
    const $el = el.value;

    $el.innerHTML = svg;
};

onMounted(() => {
    showIcon();
});

watch(() => props.icon, () => {
    showIcon();
});

</script>

<template>
  <div
    :class="classMap"
    :style="styleMap"
  >
    <div
      v-if="props.icon"
      ref="el"
      class="mcr-icon-label-icon"
    />
    <label v-if="labelContent">
      <slot>{{ props.label }}</slot>
    </label>
  </div>
</template>

<style lang="scss">
.mcr-icon-label {
    --mcr-icon-size: 16px;
    --mcr-icon-gap: 3px;

    position: relative;
    gap: var(--mcr-icon-gap);
}

.mcr-icon-label-icon {
    display: block;
    width: var(--mcr-icon-size);
    height: var(--mcr-icon-size);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: var(--mcr-icon-size) var(--mcr-icon-size);

    svg {
        pointer-events: none;
    }
}

.mcr-icon-label-button {
    cursor: pointer;
    opacity: 0.8;

    label {
        white-space: nowrap;
        cursor: pointer;
    }
}

.mcr-icon-label-button:hover {
    opacity: 1;
}

.mcr-icon-label-primary {
    opacity: 1;
}

.mcr-icon-label-primary:hover {
    color: #0a58ca;
}

</style>
