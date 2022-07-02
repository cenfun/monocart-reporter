<template>
  <div class="prg-info vui-flex-row">
    <div><b>Cases:</b> {{ summary.cases }}</div>
    <div class="prg-info-item prg-info-passed">
      Passed: {{ summary.passed }} ({{ summary.passedPercent }})
    </div>
    <div
      v-if="summary.failed > 0"
      class="prg-info-item prg-info-failed"
    >
      Failed: {{ summary.failed }} ({{ summary.failedPercent }})
    </div>
    <div
      v-if="summary.flaky > 0"
      class="prg-info-item prg-info-flaky"
    >
      Flaky: {{ summary.flaky }} ({{ summary.flakyPercent }})
    </div>
    <div
      v-if="summary.skipped > 0"
      class="prg-info-item prg-info-skipped"
    >
      Skipped: {{ summary.skipped }} ({{ summary.skippedPercent }})
    </div>
    <div class="prg-info-item">
      <b>Suites:</b> {{ summary.suites }}
    </div>
    <div class="prg-info-item">
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
.prg-info {
    font-size: 12px;
    color: #666;
    .prg-info-item {
        margin-left: 10px;
    }
    .prg-info-passed {
        color: #333;
    }
    .prg-info-failed {
        color: red;
    }
    .prg-info-flaky {
        color: orange;
    }
    .prg-info-skipped {
      color: gray;
    }
}
</style>
