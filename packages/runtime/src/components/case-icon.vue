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
        const list = ['prg-icon'];
        if (this.caseItem.ok) {
            if (this.caseItem.status === 'skipped') {
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

</script>
<style lang="scss">
.prg-case-icon {
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
