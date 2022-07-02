<template>
  <div class="prg-flyover vui-flex-column">
    <div class="prg-flyover-header vui-flex-row">
      <div
        v-if="!visible"
        class="prg-flyover-icon prg-icon-arrow-left"
        @click="show"
      />
      <div
        v-if="visible"
        class="prg-flyover-icon prg-icon-arrow-right"
        @click="hide"
      />
      <div
        class="prg-flyover-title vui-flex-auto"
        v-text="title"
      />
    </div>
    <div class="prg-flyover-body vui-flex-auto">
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
            title: 'Please select a case to show detail here'
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
            const $flyover = $('.prg-flyover');
            $flyover.addClass('prg-slide-out-right').one('animationend', () => {
                $flyover.removeClass('prg-slide-out-right prg-show');
                this.visible = false;
            });
        },

        show: function() {
            if (this.visible) {
                return;
            }
            const $flyover = $('.prg-flyover');
            $flyover.addClass('prg-slide-in-right prg-show').one('animationend', () => {
                $flyover.removeClass('prg-slide-in-right');
                this.visible = true;
            });

        }
    }
};
</script>
<style lang="scss">
.prg-flyover {
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

.prg-show::before {
    pointer-events: none;
    content: '';
    position: absolute;
    left: -10px;
    top: 0;
    z-index: 10;
    display: block;
    height: 100%;
    width: 10px;
    background-image: linear-gradient(to left, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0));
}

.prg-show {
    width: 50%;
}

@keyframes prg-slide-in-right {
    from {
        transform: translate3d(100%, 0, 0);
        visibility: visible;
    }
    to {
        transform: translate3d(0, 0, 0);
    }
}
.prg-slide-in-right {
    animation-name: prg-slide-in-right;
}

@keyframes prg-slide-out-right {
    from {
        transform: translate3d(0, 0, 0);
    }
    to {
        visibility: hidden;
        transform: translate3d(100%, 0, 0);
    }
}
.prg-slide-out-right {
    animation-name: prg-slide-out-right;
}

.prg-flyover-header {
    height: 35px;
    line-height: 35px;
    border-bottom: 1px solid #ccc;
    padding: 0 5px;
    background-color: #333;
    color: #eee;
}

.prg-flyover-title {
    font-weight: bold;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 5px;
}

.prg-flyover-icon {
    width: 25px;
    height: 25px;
    cursor: pointer;

    &:hover {
        background-color: #333;
    }
}

.prg-icon-arrow-left {
    background-image: url("../images/arrow-left.svg");
    margin-left: -35px;
}

.prg-icon-arrow-right {
    background-image: url("../images/arrow-right.svg");
}

.prg-flyover-body {
    padding: 5px 5px;
}
</style>
