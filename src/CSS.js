import * as approximation from './css/approximation/index.js'
import * as periodic from './css/periodic/index.js'
import SSVEP from './SSVEP.js'


export class CSS extends SSVEP {

    style = document.createElement('style');

    constructor(method = 'periodic', samples = 10) {
        super({approximation, periodic}, method, samples)
    }

    onstart = () => {
        this.style.type = 'text/css';
        document.head.appendChild(this.style);
    }

    ondelete = (o) => {
        o.element.style.animation = '';
        o.element.style.visibility = '';
        o.element.style.backgroundColor = '';
    }

    onstop = () => {
        this.style.remove()
    }

    animate = (o) => {

        // Apply Inline Styling
        const rgbaVals = o.light.split(',')
        const rgb = rgbaVals.slice(0, 3).map(v => 255 * (v ?? 1))
        o.element.style.backgroundColor = `rgba(${rgb},${rgbaVals[3]})`;
        o.element.style.visibility = "visible"

        // Get Animation Info
        var animationInfo = this.technique.getAnimationInfo(o, this.refreshRate, o.id);
        var cycleDurationString = String(animationInfo.duration).concat("s ", animationInfo.name, animationInfo.type);

        // Apply Animation
        this.style.sheet.insertRule(animationInfo.rule, this.style.cssRules?.length ?? 0);
        o.element.style.animation = cycleDurationString;

    }
}