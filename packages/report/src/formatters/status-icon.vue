<template>
  <div class="pat-status-icon">
    <div :class="icon" />
  </div>
</template>
<script>
import { registerComponent } from 'lithops-ui';
const StatusIcon = {
    props: {
        row: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data() {
        return {
            icon: ''
        };
    },

    created() {
        const list = ['pat-icon'];
        if (this.row.ok) {
            if (this.row.status === 'skipped') {
                list.push('pat-icon-skipped');
            } else {
                list.push('pat-icon-passed');
            }
        } else {
            list.push('pat-icon-failed');
        }

        this.icon = list.join(' ');
    }
};
registerComponent(StatusIcon);
export default StatusIcon;
</script>
<style lang="scss">
.pat-status-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .pat-icon {
      width: 16px;
      height: 16px;
    }
    .pat-icon-passed {
        background-image: url("../images/passed.svg");
    }
    .pat-icon-skipped {
        background-image: url("../images/skipped.svg");
    }
    .pat-icon-failed {
        background-image: url("../images/failed.svg");
    }
}

</style>