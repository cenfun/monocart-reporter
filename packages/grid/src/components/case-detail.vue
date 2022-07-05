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
            location: ''
        };
    },

    methods: {
        update(caseItem, position) {
            this.location = caseItem.location;
        }
    }
};
</script>
