<template>
  <Teleport to="body">
    <div
      ref="overlay"
      class="mcr-image-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      tabindex="-1"
      @click.self="emit('close')"
      @wheel.prevent="onWheel"
      @keydown.esc.stop.prevent="emit('close')"
      @keydown.tab.prevent="closeButton.focus()"
    >
      <img
        :key="props.src"
        class="mcr-image-preview-image"
        :class="{
          'mcr-image-preview-draggable': canDrag,
          'mcr-image-preview-dragging': canDrag && dragging
        }"
        :src="props.src"
        :alt="props.alt"
        :style="imageStyle"
        draggable="false"
        @load="onLoad"
        @error="failed = true"
        @dragstart.prevent
        @dblclick.prevent="onDoubleClick"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
        @lostpointercapture="onPointerEnd"
      >
      <span
        v-if="failed"
        class="mcr-image-preview-error"
        role="status"
      >Unable to load image</span>
      <button
        ref="closeButton"
        class="mcr-image-preview-close"
        type="button"
        aria-label="Close image preview"
        title="Close (Esc)"
        @click="emit('close')"
      >
        ×
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import {
    computed, onMounted, onBeforeUnmount, ref, watch
} from 'vue';

const props = defineProps({
    src: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        default: ''
    }
});
const emit = defineEmits(['close']);

const overlay = ref(null);
const closeButton = ref(null);
const width = ref(0);
const height = ref(0);
const viewportWidth = ref(0);
const viewportHeight = ref(0);
const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const dragging = ref(false);
const failed = ref(false);
// Scale is relative to the image's natural size; never exceed 8×.
const MAX_SCALE = 8;
let fitScale = 1;
const pointers = new Map();
let tap;
let lastTap;
let lastTouchTime = 0;
let previousFocus;
let previousOverflow;

const imageStyle = computed(() => ({
    width: `${width.value}px`,
    height: `${height.value}px`,
    visibility: width.value ? 'visible' : 'hidden',
    transform: `translate(-50%, -50%) translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`
}));

// Only the portion extending beyond the viewport can be panned on each axis.
const panBounds = computed(() => ({
    x: Math.max(0, (width.value * scale.value - viewportWidth.value) / 2),
    y: Math.max(0, (height.value * scale.value - viewportHeight.value) / 2)
}));
const canDrag = computed(() => panBounds.value.x > 0 || panBounds.value.y > 0);

const constrainOffsets = () => {
    const { x, y } = panBounds.value;
    offsetX.value = Math.max(-x, Math.min(x, offsetX.value));
    offsetY.value = Math.max(-y, Math.min(y, offsetY.value));
};

const resetView = () => {
    viewportWidth.value = overlay.value.clientWidth;
    viewportHeight.value = overlay.value.clientHeight;
    if (!width.value || !height.value) {
        return;
    }
    fitScale = Math.min(1, Math.max(1, viewportWidth.value - 32) / width.value, Math.max(1, viewportHeight.value - 32) / height.value);
    scale.value = fitScale;
    offsetX.value = 0;
    offsetY.value = 0;
    tap = null;
    lastTap = null;
};

const onLoad = (event) => {
    width.value = event.target.naturalWidth;
    height.value = event.target.naturalHeight;
    failed.value = false;
    resetView();
};

// Anchor zooming at the cursor / pinch midpoint, subject to the pan bounds.
const zoomAt = (nextScale, point, nextPoint = point) => {
    const rect = overlay.value.getBoundingClientRect();
    const x = point.x - rect.left - rect.width / 2;
    const y = point.y - rect.top - rect.height / 2;
    const clampedScale = Math.min(MAX_SCALE, Math.max(fitScale, nextScale));
    const ratio = clampedScale / scale.value;
    offsetX.value = x - (x - offsetX.value) * ratio + nextPoint.x - point.x;
    offsetY.value = y - (y - offsetY.value) * ratio + nextPoint.y - point.y;
    scale.value = clampedScale;
    constrainOffsets();
};

const toggleOriginalSize = () => {
    scale.value = Math.abs(scale.value - 1) < 0.001 ? fitScale : 1;
    offsetX.value = 0;
    offsetY.value = 0;
};

const onDoubleClick = () => {
    // Touch double-taps are handled below; ignore synthesized mouse events.
    if (Date.now() - lastTouchTime > 500) {
        toggleOriginalSize();
    }
};

const onWheel = (event) => {
    if (!width.value) {
        return;
    }
    const unit = event.deltaMode === 1 ? 16 : 1;
    const delta = event.deltaMode === 2 ? event.deltaY * overlay.value.clientHeight : event.deltaY * unit;
    zoomAt(scale.value * Math.exp(-Math.max(-100, Math.min(100, delta)) * 0.002), {
        x: event.clientX,
        y: event.clientY
    });
};

const getPoint = (event) => ({
    x: event.clientX, y: event.clientY
});
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({
    x: (a.x + b.x) / 2, y: (a.y + b.y) / 2
});

const onPointerDown = (event) => {
    if (event.button !== 0 || !width.value) {
        return;
    }
    if (event.pointerType === 'touch') {
        event.preventDefault();
        lastTouchTime = Date.now();
    }
    const point = getPoint(event);
    pointers.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.value = true;
    if (pointers.size === 1) {
        tap = {
            ... point, id: event.pointerId, time: Date.now()
        };
    } else {
        tap = null;
        lastTap = null;
    }
};

const onPointerMove = (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) {
        return;
    }
    const point = getPoint(event);
    const oldPoints = Array.from(pointers.values());
    pointers.set(event.pointerId, point);
    if (tap && distance(tap, point) > 6) {
        tap = null;
        lastTap = null;
    }
    if (pointers.size === 1) {
        offsetX.value += point.x - previous.x;
        offsetY.value += point.y - previous.y;
        constrainOffsets();
        return;
    }
    const newPoints = Array.from(pointers.values());
    const oldDistance = distance(oldPoints[0], oldPoints[1]);
    const oldCenter = midpoint(oldPoints[0], oldPoints[1]);
    const newCenter = midpoint(newPoints[0], newPoints[1]);
    const nextScale = oldDistance > 0 ? scale.value * distance(newPoints[0], newPoints[1]) / oldDistance : scale.value;
    zoomAt(nextScale, oldCenter, newCenter);
};

const isDoubleTap = () => lastTap && lastTouchTime - lastTap.time < 300 && distance(tap, lastTap) < 24;

const onTouchTap = (event) => {
    lastTouchTime = Date.now();
    if (event.type !== 'pointerup' || !tap || tap.id !== event.pointerId
        || lastTouchTime - tap.time >= 300 || distance(tap, getPoint(event)) >= 6) {
        return;
    }
    if (isDoubleTap()) {
        toggleOriginalSize();
        lastTap = null;
    } else {
        lastTap = {
            ... tap, time: lastTouchTime
        };
    }
};

const onPointerEnd = (event) => {
    if (!pointers.has(event.pointerId)) {
        return;
    }
    pointers.delete(event.pointerId);
    dragging.value = pointers.size > 0;
    if (event.pointerType === 'touch') {
        onTouchTap(event);
    }
    tap = null;
};

watch(() => props.src, () => {
    width.value = 0;
    height.value = 0;
    failed.value = false;
    pointers.clear();
    dragging.value = false;
    tap = null;
    lastTap = null;
});

onMounted(() => {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.value.focus({
        preventScroll: true
    });
    window.addEventListener('resize', resetView);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', resetView);
    document.body.style.overflow = previousOverflow;
    if (previousFocus?.isConnected) {
        previousFocus.focus({
            preventScroll: true
        });
    }
});
</script>

<style lang="scss">
.mcr-image-preview {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgb(0 0 0 / 50%);
    overflow: hidden;
    user-select: none;
    touch-action: none;
    overscroll-behavior: contain;

    .mcr-image-preview-image {
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        max-width: none;
        max-height: none;
        cursor: default;
        transform-origin: center;
    }

    .mcr-image-preview-draggable {
        cursor: grab;
    }

    .mcr-image-preview-dragging {
        cursor: grabbing;
    }
}

.mcr-image-preview-close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    color: #fff;
    font-size: 30px;
    border: 0;
    border-radius: 50%;
    background: rgb(0 0 0 / 50%);
    cursor: pointer;

    &:hover,
    &:focus-visible {
        background: rgb(0 0 0 / 80%);
    }
}

.mcr-image-preview-error {
    position: absolute;
    top: 50%;
    left: 50%;
    color: #fff;
    transform: translate(-50%, -50%);
    pointer-events: none;
}
</style>
