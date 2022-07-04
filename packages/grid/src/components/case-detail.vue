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
        update(caseItem) {
            this.location = caseItem.location;
        }
    }
};
</script>
