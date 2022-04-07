import { calculateRefreshRate } from './common.js'

export default class SSVEP {

    method = null
    refreshRate = null
    canvas = null
    elements = new Map()
    samples = 10
    active = false

    constructor(methods, method = 'periodic', samples = 10) {

        this.technique = methods[method] // From library
        this.samples = samples
        Array.from(options.elements ?? []).forEach(this.set)

    }

    // Start Stimuli Generation
    start = async () => {

        if (!this.active) {

            this.onstart()

            // Calculate Refresh Rate
            this.refreshRate = await calculateRefreshRate(10, this.samples)

            // Apply Styling
            this.elements.forEach((o, id) => {
                
                const el = o.element

                 // Update Animations
                this.set(el)
                
                // Start Animation
                this.animate(o)
            })

            this.active = true // toggle active
        }
    }


    // Set Element
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
    delete = (element) => {
        const found = Array.from(this.elements).find((arr, i) => {
            if (arr[1].element === element) {
                this._delete(arr[1])
                return this.elements.delete(arr[0])
            }
        })

        if (!found) this._delete({element})
    }

    // Stop Stimuli Generation
    stop = () => {
        this.onstop()
        this.elements.forEach(o => this.ondelete(o)) // Only method-specific deletion (not from instance itself)
        this.active = false
    }

    // Clear All Stimuli
    clear = () => {
        this.onclear()
        this.stop()
    }

    // Reset Elements
    reset = () => {
        this.clear()
        this.elements.forEach(o => this.delete(o.element))
    }

    onstart = () => {}
    ondelete = () => {}
    onstop = () => {}
    onclear = () => {}

    calculateRefreshRate = calculateRefreshRate

}