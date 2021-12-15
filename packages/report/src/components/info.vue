<template>
  <div class="pat-info lui-flex-row">
    <div><b>Cases:</b> {{ summary.cases }}</div>
    <div class="pat-info-item pat-info-passed">
      Passed: {{ summary.passed }} ({{ summary.passedPercent }})
    </div>
    <div
      v-if="summary.failed > 0"
      class="pat-info-item pat-info-failed"
    >
      Failed: {{ summary.failed }} ({{ summary.failedPercent }})
    </div>
    <div
      v-if="summary.flaky > 0"
      class="pat-info-item pat-info-flaky"
    >
      Flaky: {{ summary.flaky }} ({{ summary.flakyPercent }})
    </div>
    <div
      v-if="summary.skipped > 0"
      class="pat-info-item"
    >
      Skipped: {{ summary.skipped }} ({{ summary.skippedPercent }})
    </div>
    <div class="pat-info-item">
      <b>Suites:</b> {{ summary.suites }}
    </div>
    <div class="pat-info-item">
      <b>Steps:</b> {{ summary.steps }}
    </div>
  </div>
</template>
<script>
export default {
    props: {
        info: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
    data: function() {
        return {
            summary: this.info
        };
    }
};
</script>
<style lang="scss">
.pat-info {
    font-size: 12px;
    .pat-info-item {
        margin-left: 10px;
    }
    .pat-info-passed {
        color: green;
    }
    .pat-info-failed {
        color: #ff0000;
    }
    .pat-info-flaky {
        color: orange;
    }
}
</style>