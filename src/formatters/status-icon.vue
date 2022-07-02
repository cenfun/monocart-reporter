<template>
  <div :class="icon" />
</template>
<script>
import { createComponent } from 'vine-ui';

const StatusIcon = {
    createComponent,
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
        const list = ['prg-icon'];
        if (this.row.ok) {
            if (this.row.status === 'skipped') {
                list.push('prg-icon-skipped');
            } else {
                list.push('prg-icon-passed');
            }
        } else {
            list.push('prg-icon-failed');
        }

        this.icon = list.join(' ');
    }
};

export default StatusIcon;
</script>
<style lang="scss">
.prg-status-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.prg-icon {
    width: 16px;
    height: 16px;
}
.prg-icon-passed {
    background-image: url("../images/passed.svg");
}
.prg-icon-skipped {
    background-image: url("../images/skipped.svg");
}
.prg-icon-failed {
    background-image: url("../images/failed.svg");
}

</style>
