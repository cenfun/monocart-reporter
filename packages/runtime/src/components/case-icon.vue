<template>
  <div :class="icon" />
</template>
<script>
import { createComponent } from 'vine-ui';

export default {
    createComponent,
    props: {
        caseItem: {
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
        const list = ['mcr-icon'];
        if (this.caseItem.ok) {
            if (this.caseItem.status === 'skipped') {
                list.push('mcr-icon-skipped');
            } else {
                list.push('mcr-icon-passed');
            }
        } else {
            list.push('mcr-icon-failed');
        }

        this.icon = list.join(' ');
    }
};

</script>
<style lang="scss">
.mcr-case-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mcr-icon {
    width: 16px;
    height: 16px;
}

.mcr-icon-passed {
    background-image: url("../images/passed.svg");
}

.mcr-icon-skipped {
    background-image: url("../images/skipped.svg");
}

.mcr-icon-failed {
    background-image: url("../images/failed.svg");
}

</style>
