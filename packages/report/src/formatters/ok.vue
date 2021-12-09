<template>
  <div class="pat-ok">
    <div
      v-if="ok"
      class="pat-ok-icon pat-ok-icon-passed"
    />
    <div
      v-else
      class="pat-ok-icon pat-ok-icon-failed"
    />
  </div>
</template>
<script>
import { registerComponent } from 'lithops-ui';
const OK = {
    props: {
        ok: {
            type: [Boolean, String]
        }
    }
};
registerComponent(OK);
export default OK;
</script>
<style lang="scss">
.pat-ok {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pat-ok-icon {
    width: 16px;
    height: 16px;
}
.pat-ok-icon-passed {
    background-image: url("../images/passed.svg");
}
.pat-ok-icon-failed {
    background-image: url("../images/failed.svg");
}
</style>