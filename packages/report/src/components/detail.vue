<template>
  <div class="pat-detail">
    Detail
    {{ item.title }}
  </div>
</template>
<script>
export default {
    data: function() {
        return {
            item: {}
        };
    },

    methods: {
        update(currentCase) {
            this.item = currentCase;
        }
    }
};
</script>