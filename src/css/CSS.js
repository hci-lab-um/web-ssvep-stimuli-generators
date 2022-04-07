import { calculateRefreshRate } from '../common.js'
import * as css from './index.js'
import * as approximation from './approximation/index.js'
import * as periodic from './periodic/index.js'

const methods = {
    approximation,
    periodic
}

export class CSS {

    animationId = null
    method = null
    refreshRate = null
    canvas = null
    elements = new Map()
    samples = 10
    stop = null
    active = false
    style = document.createElement('style');

    constructor(method = 'periodic', samples = 10) {

        this.technique = methods[method] // From library
        this.samples = samples
        Array.from(options.elements ?? []).forEach(this.set)

    }

    // Start Stimuli Generation
    start = async () => {

        if (!this.active) {

            this.style.type = 'text/css';
            document.head.appendChild(this.style);

            // Calculate Refresh Rate
            this.refreshRate = await calculateRefreshRate(10, this.samples)

            // Apply Styling
            this.elements.forEach((o, id) => {
                
                const el = o.element

                 // Update Animations
                this.set(el)
                
                // Apply Inline Styling
                const rgbaVals = o.light.split(',')
                const rgb = rgbaVals.slice(0, 3).map(v => 255 * (v ?? 1))
                el.style.backgroundColor = `rgba(${rgb},${rgbaVals[3]})`;
                el.style.visibility = "visible"

                // Get Animation Info
                var animationInfo = this.technique.getAnimationInfo(o, this.refreshRate, id);
                var cycleDurationString = animationInfo.duration.concat("s ", animationInfo.name, animationInfo.type);

                // Apply Animation
                if (animationInfo.rule) this.style.sheet.insertRule(animationInfo.rule, this.style.cssRules?.length ?? 0);
                el.style.animation = cycleDurationString;

            })

            this.active = true // toggle active
        }
    }


    set = async (el) => {

            const o = Array.from(this.elements.values()).find(o => o.element === el) ?? {}
            o.element = el

            // Get Info
            o.id = o.id ?? Math.floor(1000000*Math.random())
            o.frequency = el.getAttribute('data-frequency') ?? '0'
            o.light = el.getAttribute('data-light-color') ?? '1,1,1,1'
            o.dark = el.getAttribute('data-dark-color') ?? '0,0,0,1'
            o.phaseShift = el.getAttribute('data-phase-shift') ?? '0'

            this.elements.set(o.id, o)

    }

    // Remove Inline Styling
    delete = (el, remove=true) => {
        el.style.animation = '';
        el.style.visibility = '';
        el.style.backgroundColor = '';

        if (remove) Array.from(this.elements).find((arr, i) => {
            if (arr[1].element === el) return this.elements.delete(arr[0])
        })
    }

    // Stop Stimuli Generation
    stop = () => {
        this.style.remove()
        this.elements.forEach(o => this.delete(o.element, false))

        this.active = false
    }

    clear = () => {
        this.stop()
        this.elements.forEach(o => this.delete(o.element))
    }

    calculateRefreshRate = calculateRefreshRate

    // _animate = () => {

    //     this.animationId = window.requestAnimationFrame((now) => _animate(now));

    // }


}