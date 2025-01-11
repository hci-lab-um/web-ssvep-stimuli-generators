import * as approximation from './css/approximation/index.js'
import * as periodic from './css/periodic/index.js'
import SSVEP from './SSVEP.js'

export class CSS extends SSVEP {

    style = document.createElement('style');

    constructor(method = 'periodic', samples = 10) {
        super({ approximation, periodic }, method, samples)
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

    animate = async (o) => {
        let updatedSvgText = ''

        // Apply Inline Styling
        if (o.light) {
            if (o.pattern !== 'dot') {
                const rgbaVals = o.light.split(',')
                const rgb = rgbaVals.slice(0, 3).map(v => 255 * (v ?? 1))
                o.element.style.backgroundColor = `rgba(${rgb},${rgbaVals?.[3] ?? 1})`;
            }
            else {
                // Functionality to be able to change colour of dots in Patterns.DOT 
                o.element.style.backgroundColor = `rgba(255,255,255,1)`;

                await fetch('./dist/src/resources/random-dot-stimuli.svg')
                    .then(response => response.text())
                    .then(svgText => {
                        // Parse SVG
                        const parser = new DOMParser();
                        const svgDocument = parser.parseFromString(svgText, "image/svg+xml");
                        const svgElement = svgDocument.documentElement;

                        const mainColor = `rgb(${o.light.slice(0, -2)})`;
                        const secondaryColor = `rgb(${o.dark.slice(0, -2)})`;

                        // Find the <style> block                        
                        const styleElement = svgElement.querySelector('style');
                        if (styleElement) {
                            // Update the CSS variables
                            const updatedStyle = styleElement.textContent
                                .replace(/--main-color:[^;]+;/, `--main-color:${mainColor};`)
                                .replace(/--secondary-color:[^;]+;/, `--secondary-color:${secondaryColor};`);
                            styleElement.textContent = updatedStyle;
                        }

                        updatedSvgText = new XMLSerializer().serializeToString(svgDocument);
                    });
            }
            o.element.style.visibility = "visible"

            // Get Animation Info
            var animationInfo = this.technique.getAnimationInfo(o, this.refreshRate, o.id, updatedSvgText);
            var cycleDurationString = String(animationInfo.duration).concat("s ", animationInfo.name, animationInfo.type);

            // Apply Animation
            this.style.sheet.insertRule(animationInfo.rule, this.style.cssRules?.length ?? 0);
            o.element.style.animation = cycleDurationString;

        }
    }
}