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
            if ([this.caseItem.status, this.caseItem.outcome].includes('skipped')) {
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

</style>
