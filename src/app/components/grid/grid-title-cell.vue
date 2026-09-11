<template>
  <div
    :class="[
      'grid-title-cell',
      wrap ? 'grid-title-cell-wrap' : 'grid-title-cell-nowrap',
      isCaseClickable ? 'tg-cell-open' : ''
    ]"
  >
    <template v-if="hasTitleTags">
      <div
        v-if="wrap"
        class="grid-title-tags grid-title-tags-wrap mcr-tags"
      >
        <slot />
        <template
          v-for="(item, i) of allTitleItems"
          :key="i"
        >
          <span
            v-if="item.tag"
            class="mcr-tag"
            :style="item.style"
            :tooltip="item.description || undefined"
          >{{ item.key }}</span>
          <span
            v-else
            class="grid-title-text"
          >{{ item.text }}</span>
        </template>
      </div>

      <div
        v-else
        ref="tagsContainerRef"
        :tooltip="compact ? fullTitleText : ''"
        :tooltip-text="fullTitleText"
        class="grid-title-tags"
      >
        <div
          ref="titleRef"
          class="grid-title-tags-title"
        >
          <template
            v-for="(item, i) of titleContentItems"
            :key="i"
          >
            <span
              v-if="item.tag"
              class="mcr-tag"
              :style="item.style"
              :tooltip="item.description || undefined"
            >{{ item.key }}</span>
            <span v-else>{{ item.text }}</span>
          </template>
        </div>
        <div
          v-if="visibleExtraTagItems.length"
          ref="tagsListRef"
          class="grid-title-tags-list mcr-tags"
        >
          <span
            v-for="(item, i) of visibleExtraTagItems"
            :key="`${item.key}-${i}`"
            class="mcr-tag"
            :style="item.style"
            :tooltip="item.description || undefined"
          >{{ item.key }}</span>
        </div>
        <span
          v-if="compact"
          class="mcr-tag grid-title-tags-box"
          :style="tagsBoxStyle"
          :tooltip="fullTitleText"
        >@</span>
      </div>
    </template>

    <template v-else>
      <div
        v-if="wrap"
        class="grid-title-tags grid-title-tags-wrap mcr-tags"
      >
        <slot />
        <span class="grid-title-text">{{ title }}</span>
      </div>
      <div
        v-else
        tooltip
        class="grid-title-content"
      >
        {{ title }}
      </div>
    </template>

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
import {
    computed, ref, nextTick, onMounted, onBeforeUnmount
} from 'vue';

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
    },
    wrap: {
        type: Boolean,
        default: false
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
        style: tag.style,
        description: tag.description
    };
};

const titleData = computed(() => {
    const titleValue = title.value;
    const items = [];
    const tagKeys = [];
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
            items.push({
                text: textBefore
            });
        }

        tagKeys.push(key);
        items.push(getTagItem(key));
        lastIndex = afterIndex + (afterMatch ? afterMatch[0].length : 0);
    }

    if (lastIndex < titleValue.length) {
        items.push({
            text: titleValue.slice(lastIndex)
        });
    }

    return {
        items,
        tagKeys
    };
});

const titleContentItems = computed(() => titleData.value.items);

// New tag syntax introduced in Playwright v1.42. Keep tags which are not
// already part of the title separate, so they can be compacted on overflow.
const extraTagItems = computed(() => {
    const tags = Util.getTagKeys(props.rowItem.tags || []);
    return tags.filter((key) => !titleData.value.tagKeys.includes(key)).map(getTagItem);
});

const hasExtraTags = computed(() => Boolean(extraTagItems.value.length));
const allTitleItems = computed(() => titleContentItems.value.concat(extraTagItems.value));
const fullTitleText = computed(() => {
    const extraTags = extraTagItems.value.map((item) => `@${item.key}`);
    return [title.value, ... extraTags].join(' ');
});

const tagsContainerRef = ref();
const titleRef = ref();
const tagsListRef = ref();
const hiddenTagCount = ref(0);
const compact = computed(() => hiddenTagCount.value > 0);
const visibleExtraTagItems = computed(() => {
    const visibleCount = extraTagItems.value.length - hiddenTagCount.value;
    return extraTagItems.value.slice(0, visibleCount);
});
const hiddenExtraTagItems = computed(() => {
    const hiddenCount = hiddenTagCount.value;
    return hiddenCount ? extraTagItems.value.slice(-hiddenCount) : [];
});

const getTagBackground = (key) => {
    const tag = state.tagMap[key] || {};
    const style = tag.style || tag;
    if (typeof style === 'string') {
        const matched = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);
        return matched ? matched[1].trim() : 'gray';
    }
    return style.background || style.backgroundColor || style['background-color'] || 'gray';
};

const tagsBoxStyle = computed(() => {
    const tags = hiddenExtraTagItems.value;
    if (!tags.length) {
        return;
    }
    const colors = tags.map((tag) => getTagBackground(tag.key));
    const unit = 100 / colors.length;
    const stops = colors.map((color, index) => {
        const start = (index * unit).toFixed(2);
        const end = ((index + 1) * unit).toFixed(2);
        return `${color} ${start}% ${end}%`;
    });
    return [tags[0].style, {
        background: `conic-gradient(${stops.join(', ')})`
    }];
});

const tagsBoxWidth = 20;
let tagWidths = [];
let animationFrame;
let resizeObserver;

const disconnectObserver = () => {
    resizeObserver?.disconnect();
};

const getTagsWidth = (count, gap) => {
    if (!count) {
        return 0;
    }
    const width = tagWidths.slice(0, count).reduce((total, itemWidth) => total + itemWidth, 0);
    return width + gap * (count - 1);
};

const getVisibleTagCount = (availableWidth, titleWidth, gap, boxWidth) => {
    const tagCount = tagWidths.length;
    let tagsWidth = getTagsWidth(tagCount, gap);
    if (titleWidth + gap + tagsWidth <= availableWidth) {
        return tagCount;
    }

    // Remove tags from the end and reuse the previous total. This keeps the
    // resize calculation linear even when a title has many tags.
    for (let visibleCount = tagCount - 1; visibleCount >= 0; visibleCount -= 1) {
        tagsWidth -= tagWidths[visibleCount];
        if (visibleCount) {
            tagsWidth -= gap;
        }
        const visibleTagsWidth = visibleCount ? tagsWidth + gap : 0;
        const requiredWidth = titleWidth + gap + visibleTagsWidth + boxWidth;
        if (requiredWidth <= availableWidth) {
            return visibleCount;
        }
    }
    return 0;
};

// Width checks are kept together to avoid applying a stale measurement.
// eslint-disable-next-line complexity
const updateCompactState = () => {
    const container = tagsContainerRef.value;
    const titleNode = titleRef.value;
    const tagsList = tagsListRef.value;
    if (!container || !titleNode || props.wrap || !hasExtraTags.value) {
        hiddenTagCount.value = 0;
        return;
    }
    if (!container.isConnected) {
        disconnectObserver();
        return;
    }
    if (!container.clientWidth) {
        return;
    }

    if (!hiddenTagCount.value && tagsList) {
        tagWidths = Array.from(tagsList.querySelectorAll('.mcr-tag')).map((tag) => tag.offsetWidth);
    }
    if (!tagWidths.length) {
        return;
    }

    const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
    const visibleCount = getVisibleTagCount(container.clientWidth, titleNode.scrollWidth, gap, tagsBoxWidth);
    hiddenTagCount.value = extraTagItems.value.length - visibleCount;
};

const updateCompact = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(updateCompactState);
};

onMounted(() => {
    if (props.wrap || !hasTitleTags.value || !hasExtraTags.value) {
        return;
    }
    nextTick(() => {
        const container = tagsContainerRef.value;
        if (!container?.isConnected) {
            return;
        }
        updateCompact();
        resizeObserver = new ResizeObserver(updateCompact);
        resizeObserver.observe(container);
    });
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrame);
    disconnectObserver();
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
    min-width: 0;
}

.grid-title-content,
.grid-title-tags {
    min-width: 0;
}

.grid-title-tags {
    display: flex;
    flex: 1 1 auto;
    gap: 3px;
    align-items: center;
}

.grid-title-tags-title,
.grid-title-tags-list {
    min-width: 0;
}

.grid-title-tags-list,
.grid-title-tags-box {
    flex-shrink: 0;
}

.grid-title-tags-box {
    width: 20px;
    padding: 0;
}

.grid-title-cell-nowrap {
    white-space: nowrap;
    overflow: hidden;

    .grid-title-content,
    .grid-title-tags,
    .grid-title-tags-title {
        white-space: nowrap;
        overflow: hidden;
    }

    .grid-title-content,
    .grid-title-tags-title {
        text-overflow: ellipsis;
    }

    .grid-title-tags-title {
        flex: 0 1 auto;

        span + span {
            margin-left: 3px;
        }
    }
}

.grid-title-cell-wrap {
    white-space: normal;

    .grid-title-content,
    .grid-title-text {
        white-space: normal;
        overflow-wrap: anywhere;
    }

    .grid-title-text {
        flex-shrink: 1;
        min-width: 0;
    }

    .grid-title-tags-wrap {
        flex-wrap: wrap;
        white-space: normal;
        overflow: visible;
    }
}

</style>
