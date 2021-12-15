<template>
  <div class="pat-flyover lui-flex-column">
    <div class="pat-flyover-header lui-flex-row">
      <div
        v-if="!visible"
        class="pat-icon pat-icon-arrow-left"
        @click="show"
      />
      <div
        v-if="visible"
        class="pat-icon pat-icon-arrow-right"
        @click="hide"
      />
      <div
        class="pat-flyover-title lui-flex-auto"
        v-text="title"
      />
    </div>
    <div class="pat-flyover-body lui-flex-auto">
      <slot />
    </div>
  </div>
</template>
<script>
import { $ } from 'turbogrid';
export default {
    data: () => {
        return {
            visible: false,
            title: ''
        };
    },
    methods: {

        update: function(item) {
            this.title = item.title;
        },

        hide: function() {
            if (!this.visible) {
                return;
            }
            const $flyover = $('.pat-flyover');
            $flyover.addClass('pat-slide-out-right').one('animationend', () => {
                $flyover.removeClass('pat-slide-out-right pat-show');
                this.visible = false;
            });
        },
        
        show: function() {
            if (this.visible) {
                return;
            }
            const $flyover = $('.pat-flyover');
            $flyover.addClass('pat-slide-in-right pat-show').one('animationend', () => {
                $flyover.removeClass('pat-slide-in-right');
                this.visible = true;
            });
           
        }
    }
};
</script>
<style lang="scss">
.pat-flyover {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
    height: 100%;
    width: 0;
    background-color: #fff;
    animation-duration: 0.2s;
    animation-fill-mode: both;
}

.pat-show::before {
    pointer-events: none;
    content: '';
    position: absolute;
    left: -10px;
    top: 0;
    z-index: 10;
    display: block;
    height: 100%;
    width: 10px;
    background-image: linear-gradient(to left, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
}

.pat-show {
    width: 50%;
}

@keyframes pat-slide-in-right {
    from {
        transform: translate3d(100%, 0, 0);
        visibility: visible;
    }
    to {
        transform: translate3d(0, 0, 0);
    }
}
.pat-slide-in-right {
    animation-name: pat-slide-in-right;
}

@keyframes pat-slide-out-right {
    from {
        transform: translate3d(0, 0, 0);
    }
    to {
        visibility: hidden;
        transform: translate3d(100%, 0, 0);
    }
}
.pat-slide-out-right {
    animation-name: pat-slide-out-right;
}

.pat-flyover-header {
    height: 35px;
    line-height: 35px;
    border-bottom: 1px solid #ccc;
    padding: 0 5px;
    background-color: #333;
    color: #eee;
}

.pat-flyover-title {
    font-weight: bold;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 5px;
}

.pat-icon {
    width: 25px;
    height: 25px;
    cursor: pointer;

    &:hover {
        background-color: #333;
    }
}

.pat-icon-arrow-left {
    background-image: url("../images/arrow-left.svg");
    margin-left: -35px;
}

.pat-icon-arrow-right {
    background-image: url("../images/arrow-right.svg");
}

.pat-flyover-body {
    padding: 5px 5px;
}
</style>