import { calculateRefreshRate } from './common.js'

export default class SSVEP {

    refreshRate = null
    elements = new Map()
    samples = 10
    active = false

    constructor(methods, method = 'periodic', samples = 10) {
        this.technique = methods[method] // From library
        this.samples = samples
    }

    // Start Stimuli Generation
    start = async (elements = Array.from(this.elements.values())) => {

        if (!Array.isArray(elements))  elements = (elements instanceof HTMLElement) ? [elements] : Array.from(elements)

        if (!this.active) {

            this.onstart()

            // Calculate Refresh Rate
            this.refreshRate = await calculateRefreshRate(10, this.samples)
        }

        // Apply Styling
        elements.forEach((o, id) => {
            
            const el = (o instanceof HTMLElement) ? o : o.element

                // Update Animations
            o = this.set(el)
            
            // Start Animation
            this.animate(o)
        })

        this.active = true // toggle active
    }


    // Set Element
    set = (el) => {

            const o = Array.from(this.elements.values()).find(o => o.element === el) ?? {}
            o.element = el

            // Get Info
            o.id = o.id ?? Math.floor(1000000*Math.random())
            o.frequency = Number(el.getAttribute('data-frequency') ?? '0')
            o.light = el.getAttribute('data-light-color')
            o.dark = el.getAttribute('data-dark-color')
            o.phaseShift = Number(el.getAttribute('data-phase-shift') ?? '0')

            this.elements.set(o.id, o)
            return o
    }

    // Remove Inline Styling
    delete = (element) => {
        const found = Array.from(this.elements).find((arr, i) => {
            if (arr[1].element === element) {
                this.ondelete(arr[1])
                return this.elements.delete(arr[0])
            }
        })

        if (!found) this.ondelete({element})
    }

    // Stop Stimuli Generation
    stop = (elements = Array.from(this.elements.values()).map(o => o.element)) => {
        if (!Array.isArray(elements))  elements = (elements instanceof HTMLElement) ? [elements] : Array.from(elements)
        
        // Element-Specific
        this.elements.forEach(o => {
           if (elements.includes(o.element)) this.ondelete(o)
        })

        // When All Are Stopped
        if (elements.length === this.elements.size) {
            this.onstop()
            this.active = false
        }
    }

    // Reset Elements
    reset = () => {
        this.stop()
        this.elements.forEach(o => this.delete(o.element))
    }

    onstart = () => {}
    ondelete = () => {}
    onstop = () => {}

    calculateRefreshRate = calculateRefreshRate

}