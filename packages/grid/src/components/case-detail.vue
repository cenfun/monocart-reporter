<template>
  <div class="prg-detail">
    <div class="prg-location">
      {{ location }}
    </div>
  </div>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            default: null
        }
    },

    data: function() {
        return {
            location: ''
        };
    },

    watch: {
        item() {
            console.log(this.item);
            const loc = this.item.location;
            this.location = `${loc.file}:${loc.line},${loc.column}`;

        }
    },

    methods: {

    }
};
</script>
