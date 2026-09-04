<template>
  <div :class="['grid-title-cell', isCaseClickable ? 'tg-cell-open' : '']">
    <div
      v-if="hasTitleTags"
      tooltip
      class="grid-title-tags mcr-tags"
    >
      <template
        v-for="(item, i) of titleItems"
        :key="i"
      >
        <span
          v-if="item.tag"
          :class="item.className"
          :style="item.style"
          :tooltip="item.description || undefined"
        >{{ item.key }}</span>
        <span v-else>{{ item.text }}</span>
      </template>
    </div>
    <div
      v-else
      tooltip
      class="grid-title-content"
    >
      {{ title }}
    </div>
    <div
      v-if="caseNum"
      class="mcr-num"
    >
      {{ caseNum }}
    </div>
    <div
      v-if="stepCount"
      class="mcr-num mcr-count"
    >
      {{ stepCount }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import Util from '../../utils/util.js';
import state from '../../modules/state.js';

const props = defineProps({
    rowItem: {
        type: Object,
        default: () => ({})
    },
    columnItem: {
        type: Object,
        default: () => ({})
    },
    caseClickable: {
        type: Boolean,
        default: true
    }
});

const title = computed(() => `${props.rowItem.title}`);
const hasTitleTags = computed(() => {
    const rowItem = props.rowItem;
    if (props.columnItem.titleTagsDisabled || !Util.isTagItem(rowItem)) {
        return false;
    }
    return Boolean(title.value.match(Util.tagPattern)) || Util.isList(rowItem.tags);
});

const getTagItem = (key) => {
    const tag = state.tagMap[key] || {};
    return {
        tag: true,
        key,
        className: 'mcr-tag',
        style: tag.style,
        description: tag.description
    };
};

const titleItems = computed(() => {
    const rowItem = props.rowItem;
    const titleValue = title.value;
    const list = [];
    const titleTags = [];
    let lastIndex = 0;

    const matches = titleValue.matchAll(Util.tagPattern);
    for (const match of matches) {
        const [all, key] = match;
        const index = match.index;
        let textBefore = titleValue.slice(lastIndex, index);
        const beforeMatch = textBefore.match(/\s+$/);
        const afterIndex = index + all.length;
        const afterMatch = titleValue.slice(afterIndex).match(/^\s+/);

        if (beforeMatch) {
            textBefore = textBefore.slice(0, -beforeMatch[0].length);
        }
        if (textBefore) {
            list.push({
                text: textBefore
            });
        }

        titleTags.push(all);
        list.push(getTagItem(key));
        lastIndex = afterIndex + (afterMatch ? afterMatch[0].length : 0);
    }

    if (lastIndex < titleValue.length) {
        list.push({
            text: titleValue.slice(lastIndex)
        });
    }

    // New tag syntax introduced in Playwright v1.42. Do not render tags
    // already present in the title a second time.
    if (rowItem.tags) {
        const tags = Util.getTagKeys(rowItem.tags).filter((key) => !titleTags.includes(`@${key}`));
        tags.forEach((key) => {
            list.push(getTagItem(key));
        });
    }

    return list;
});

const isCaseClickable = computed(() => props.rowItem.type === 'case' && props.caseClickable);
const caseNum = computed(() => {
    if (props.rowItem.type === 'suite' && props.rowItem.caseNum) {
        return Util.NF(props.rowItem.caseNum);
    }
    return '';
});

// xN repeated step count
const stepCount = computed(() => {
    if (props.rowItem.type === 'step' && props.rowItem.count) {
        return Util.NF(props.rowItem.count);
    }
    return '';
});
</script>

<style lang="scss" scoped>
.grid-title-cell {
    display: flex;
    gap: 5px;
    align-items: center;
}

.grid-title-content,
.grid-title-tags {
    min-width: 0;
    text-overflow: ellipsis;
    overflow: hidden;
}

</style>
