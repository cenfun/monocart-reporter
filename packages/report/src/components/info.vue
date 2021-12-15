<template>
  <div class="pat-info lui-flex-row">
    <div><b>Cases:</b> {{ cases.total }}</div>
    <div class="lui-hs-5" />
    <div>(</div>
    <div class="lui-hs-5" />
    <div>Passed: {{ cases.passed }}</div>
    <div class="lui-hs-5" />
    <div :class="hasFailed">
      Failed: {{ cases.failed }}
    </div>
    <div class="lui-hs-5" />
    <div :class="hasFlaky">
      Flaky: {{ cases.flaky }}
    </div>
    <div class="lui-hs-5" />
    <div>Skipped: {{ cases.skipped }}</div>
    <div class="lui-hs-5" />
    <div>)</div>
    <div class="lui-hs-10" />
    <div><b>Suites:</b> {{ suites.total }}</div>
    <div class="lui-hs-10" />
    <div><b>Steps:</b> {{ steps.total }}</div>
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
            cases: {},
            suites: {},
            steps: {}
        };
    },
    computed: {
        hasFailed: function() {
            if (this.cases.failed > 0) {
                return 'pat-info-failed';
            }
            return '';
        },
        hasFlaky: function() {
            if (this.cases.flaky > 0) {
                return 'pat-info-flaky';
            }
            return '';
        }
    },
    created() {
        this.cases = this.info.cases;
        this.suites = this.info.suites;
        this.steps = this.info.steps;
    }
};
</script>
<style lang="scss">
.pat-info {
    font-size: 12px;
    .pat-info-failed {
        color: #ff0000;
    }
    .pat-info-flaky {
        color: orange;
    }
}
</style>