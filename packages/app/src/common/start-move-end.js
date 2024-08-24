
import Motion from './motion.js';

class StartMoveEnd extends EventTarget {

    static START = 'start';
    static MOVE = 'move';
    static END = 'end';
    static INERTIA = 'inertia';

    constructor(target, options = {}) {
        super();
        this.target = target;
        this.options = {
            // user options
            inertia: false,
            inertiaTime: 200,
            ... options
        };

        this.startEvents = {
            mousedown: {
                handler: (e) => {
                    this.targetMouseDownHandler(e);
                },
                options: true
            },
            touchstart: {
                handler: (e) => {
                    this.targetTouchStartHandler(e);
                },
                options: {
                    passive: false
                }
            }
        };

        this.bindEvents(this.startEvents, target);

        this.mouseEvents = {
            mousemove: {
                handler: (e) => {
                    this.mouseMoveHandler(e);
                },
                options: true
            },
            mouseup: {
                handler: (e) => {
                    this.mouseUpHandler(e);
                },
                options: {
                    once: true
                }
            }
        };

        this.touchEvents = {
            touchmove: {
                handler: (e) => {
                    this.touchMoveHandler(e);
                },
                options: {
                    passive: false
                }
            },
            touchend: {
                handler: (e) => {
                    this.touchEndHandler(e);
                },
                options: {
                    passive: false,
                    once: true
                }
            },
            touchcancel: {
                handler: (e) => {
                    this.touchCancelHandler(e);
                },
                options: {
                    passive: false,
                    once: true
                }
            }
        };

    }

    // ====================================================================

    targetMouseDownHandler(e) {
        this.motionStop();
        this.unbindEvents(this.mouseEvents);
        this.bindEvents(this.mouseEvents, window);
        const ed = {
            type: 'mouse',

            startX: 0,
            startY: 0,

            previousX: 0,
            previousY: 0,

            currentX: 0,
            currentY: 0,

            moveX: 0,
            moveY: 0,

            offsetX: 0,
            offsetY: 0,
            changed: false
        };

        // start position
        ed.e = e;
        ed.startX = e.pageX;
        ed.startY = e.pageY;
        ed.currentX = ed.startX;
        ed.currentY = ed.startY;

        this.eventData = ed;
        this.hasMoved = false;

    }

    mouseMoveHandler(e) {
        this.preventDefault(e);

        const ed = this.eventData;
        ed.e = e;
        // keep previous position
        ed.previousX = ed.currentX;
        ed.previousY = ed.currentY;
        // current position
        ed.currentX = e.pageX;
        ed.currentY = e.pageY;
        // current move offset from previous
        ed.moveX = ed.currentX - ed.previousX;
        ed.moveY = ed.currentY - ed.previousY;
        // current offset from start
        ed.offsetX = ed.currentX - ed.startX;
        ed.offsetY = ed.currentY - ed.startY;
        // position nothing change
        ed.changed = !(ed.offsetX === 0 && ed.offsetY === 0);

        // moved but no changed, because position back to start point
        if (this.hasMoved) {
            this.trigger(StartMoveEnd.MOVE, ed);
            return;
        }

        this.hasMoved = true;
        this.trigger(StartMoveEnd.START, ed);
    }

    mouseUpHandler(e) {
        this.unbindEvents(this.mouseEvents);
        if (!this.hasMoved) {
            return;
        }
        const ed = this.eventData;
        ed.e = e;
        this.preventDefault(e);
        this.trigger(StartMoveEnd.END, ed);
    }

    // ====================================================================

    targetTouchStartHandler(e) {
        this.motionStop();
        this.unbindEvents(this.touchEvents);
        this.bindEvents(this.touchEvents, document.body);
        const ed = {

            type: 'touch',

            startX: 0,
            startY: 0,

            previousX: 0,
            previousY: 0,

            currentX: 0,
            currentY: 0,

            moveX: 0,
            moveY: 0,

            offsetX: 0,
            offsetY: 0,
            changed: false,

            // touch data
            touchLength: 0,
            direction: ''

        };

        this.eventData = ed;

        this.trackingPoints = [];

        const touches = e.touches;
        const touchItem = touches[0];
        if (!touchItem) {
            // console.log('Not found touch item');
            return;
        }

        ed.e = e;
        // start position
        ed.startX = touchItem.clientX;
        ed.startY = touchItem.clientY;
        ed.currentX = ed.startX;
        ed.currentY = ed.startY;
        ed.touchLength = touches.length;

        this.addTrackingPoint(ed);

        this.trigger(StartMoveEnd.START, ed);

    }

    touchMoveHandler(e) {
        const touches = e.touches;
        const touchItem = touches[0];
        if (!touchItem) {
            // console.log('Not found touch item');
            return;
        }

        const ed = this.eventData;
        ed.e = e;
        // keep previous position
        ed.previousX = ed.currentX;
        ed.previousY = ed.currentY;
        // current position
        ed.currentX = touchItem.clientX;
        ed.currentY = touchItem.clientY;

        // current move offset from previous
        ed.moveX = ed.currentX - ed.previousX;
        ed.moveY = ed.currentY - ed.previousY;

        // current offset from start
        ed.offsetX = ed.currentX - ed.startX;
        ed.offsetY = ed.currentY - ed.startY;
        ed.changed = !(ed.offsetX === 0 && ed.offsetY === 0);

        ed.touchLength = touches.length;

        ed.direction = this.getDirection(ed);
        // console.log('direction', o.direction);

        this.addTrackingPoint(ed);

        // console.log(E.TOUCH_MOVE);
        this.trigger(StartMoveEnd.MOVE, ed);

    }

    touchEndHandler(e) {
        this.unbindEvents(this.touchEvents);

        const ed = this.eventData;
        ed.e = e;
        this.trigger(StartMoveEnd.END, ed);

        const changedTouches = e.changedTouches;
        const touchItem = changedTouches[0];
        if (!touchItem) {
            // console.log('Not found touch item');
            return;
        }

        const touches = e.touches;
        ed.touchLength = touches.length;

        // should no touches when leave, multiple and not all leave
        if (ed.touchLength > 0) {
            return;
        }

        ed.currentX = touchItem.clientX;
        ed.currentY = touchItem.clientY;

        this.addTrackingPoint(ed);

        this.motionStart();

    }

    touchCancelHandler(e) {
        // console.log(e.type, e);
        this.unbindEvents(this.touchEvents);
        // end for cancel
        const ed = this.eventData;
        ed.e = e;
        this.trigger(StartMoveEnd.END, ed);
    }

    // ====================================================================

    getDirection(ed) {
        const ox = ed.offsetX;
        const oy = ed.offsetY;

        const ax = Math.abs(ox);
        const ay = Math.abs(oy);

        const CONST = {
            UP: 'up',
            DOWN: 'down',
            LEFT: 'left',
            RIGHT: 'right'
        };

        // single direction
        if (ax < ay) {
            if (oy > 0) {
                return CONST.UP;
            }
            if (oy < 0) {
                return CONST.DOWN;
            }
        }

        if (ax > ay) {
            if (ox > 0) {
                return CONST.LEFT;
            }
            if (ox < 0) {
                return CONST.RIGHT;
            }
        }

        return '';
    }

    filterTrackingPoints(points) {
        points.reverse();
        const len = points.length;
        const t = Date.now();
        const inertiaTime = this.options.inertiaTime;
        for (let i = 0; i < len; i++) {
            // remove time > inertiaTime
            if (t - points[i].t > inertiaTime) {
                points.length = i;
                break;
            }
        }
        points.reverse();
        // console.log(points.length, points.map((it) => `${it.t - t}`));
    }

    addTrackingPoint(ed) {

        if (!this.options.inertia) {
            return;
        }

        const x = ed.currentX;
        const y = ed.currentY;
        const t = Date.now();

        const points = this.trackingPoints;

        points.push({
            x, y, t
        });

        // cache 100 points
        if (points.length > 100) {
            this.filterTrackingPoints(points);
        }

    }

    // ====================================================================

    getMotionInfo() {
        const points = this.trackingPoints;
        if (points.length < 2) {
            return;
        }

        this.filterTrackingPoints(points);
        if (points.length < 2) {
            return;
        }

        const fp = points[0];
        const lp = points[points.length - 1];

        const offsetTime = lp.t - fp.t;
        if (offsetTime <= 0) {
            return;
        }

        // calculate inertia

        let offsetX = lp.x - fp.x;
        let offsetY = lp.y - fp.y;

        const ax = Math.abs(offsetX);
        const ay = Math.abs(offsetY);

        // inertia only for one direction
        if (ax > ay) {
            offsetY = 0;
        } else {
            offsetX = 0;
        }

        // max offset distance
        const offsetDistance = Math.max(ax, ay);

        return {
            offsetDistance,
            offsetTime,
            offsetX,
            offsetY
        };

    }

    motionStart() {
        if (!this.options.inertia) {
            return;
        }

        const motionInfo = this.getMotionInfo();
        if (!motionInfo) {
            return;
        }

        const ed = this.eventData;

        // one time avg touch distance
        const baseDistance = 50;
        const baseDuration = 500;
        const expectDuration = baseDuration * motionInfo.offsetDistance / baseDistance;

        const minDuration = 20;
        const maxDuration = 2000;
        const duration = this.clamp(expectDuration, minDuration, maxDuration);

        // speed, px/ms
        const speedX = motionInfo.offsetX / motionInfo.offsetTime;
        const speedY = motionInfo.offsetY / motionInfo.offsetTime;

        // console.log('sx', sx, 'sy', sy, 'duration', duration);

        // fps 60/s = 1000/60 = 16.7ms / frame
        // fps 50/s = 20ms / frame
        const s = 20;

        // one frame offset
        const from = {
            x: speedX * s,
            y: speedY * s
        };
        const till = {
            x: 0,
            y: 0
        };

        this.motion = new Motion();
        this.motion.bind(Motion.MOVE, (e, d) => {
            ed.touchInertiaX = d.x;
            ed.touchInertiaY = d.y;
            this.trigger(StartMoveEnd.INERTIA, ed);
        });
        this.motion.start({
            duration: duration,
            from: from,
            till: till
        });
    }

    motionStop() {
        if (this.motion) {
            this.motion.destroy();
            this.motion = null;
        }
    }

    // ====================================================================
    // addEventListener()
    // removeEventListener()
    // dispatchEvent()

    // this.addEventListener('move', (e) => {
    //     console.log(e.detail);
    // });

    bind(eventType, handler, options) {
        this.addEventListener(eventType, handler, options);
    }

    unbind(eventType, handler, options) {
        this.removeEventListener(eventType, handler, options);
    }

    trigger(eventType, eventData) {
        this.dispatchEvent(new CustomEvent(eventType, {
            detail: eventData
        }));
    }

    // ====================================================================

    clamp(num, min, max) {
        return Math.max(Math.min(num, max), min);
    }

    preventDefault(e) {
        if (e && typeof e.preventDefault === 'function' && e.cancelable) {
            e.preventDefault();
        }
    }

    unbindEvents(events) {
        if (!events) {
            return;
        }
        Object.keys(events).forEach((type) => {
            const item = events[type];
            if (item.target) {
                item.target.removeEventListener(type, item.handler, item.options);
            }
        });
    }

    bindEvents(events, target) {
        if (!events) {
            return;
        }
        this.unbindEvents(events);
        Object.keys(events).forEach((type) => {
            const item = events[type];
            item.target = item.target || target;
            item.target.addEventListener(type, item.handler, item.options);
        });
    }

    // ====================================================================

    destroy() {
        this.unbindEvents(this.startEvents);
        this.unbindEvents(this.mouseEvents);
    }
}

export default StartMoveEnd;
