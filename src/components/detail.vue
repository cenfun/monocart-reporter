<template>
  <div class="prg-detail">
    <div class="prg-location">
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
            console.log(item.results);

            const loc = item.location;
            this.location = `${loc.file}:${loc.line},${loc.column}`;
        }
    }
};
</script>
