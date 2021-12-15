<template>
  <div class="pat-detail">
    <div class="pat-location">
      {{ location }}
    </div>
  </div>
</template>
<script>
export default {
    data: function() {
        return {
            item: {},
            location: ''
        };
    },

    methods: {
        update(item) {
            this.item = item;

            const loc = item.location;
            this.location = `${loc.file}:${loc.line},${loc.column}`;
        }
    }
};
</script>