import * as approximation from './css/approximation/index.js'
import * as periodic from './css/periodic/index.js'
import SSVEP from './SSVEP.js'
import dotSvg from './resources/random-dot-stimuli.svg';
import lineSvg from './resources/random-line-stimuli.svg';

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
        function setBackgroundColor(element, color) {
            const rgbaVals = color.split(',');
            const rgb = rgbaVals.slice(0, 3).map(v => {
                const num = parseFloat(v ?? 1);
                return num <= 1 ? 255 * num : num;
            });
            element.style.backgroundColor = `rgba(${rgb},${rgbaVals?.[3] ?? 1})`;
        }

        function updateSvgColors(svgText, lightColor, darkColor, mainColorVar, secondaryColorVar) {
            const parser = new DOMParser();
            const svgDocument = parser.parseFromString(svgText, "image/svg+xml");
            const svgElement = svgDocument.documentElement;

            const mainColor = `rgb(${lightColor.slice(0, -2)})`;
            const secondaryColor = `rgb(${darkColor.slice(0, -2)})`;

            const styleElement = svgElement.querySelector('style');
            if (styleElement) {
                const updatedStyle = styleElement.textContent
                    .replace(new RegExp(`--${mainColorVar}:[^;]+;`), `--${mainColorVar}:${mainColor};`)
                    .replace(new RegExp(`--${secondaryColorVar}:[^;]+;`), `--${secondaryColorVar}:${secondaryColor};`);
                styleElement.textContent = updatedStyle;
            }

            return new XMLSerializer().serializeToString(svgDocument);
        }

        if (o.light) {
            if (o.pattern === 'line') {
                setBackgroundColor(o.element, o.dark);
                updatedSvgText = updateSvgColors(lineSvg, o.light, o.dark, 'line-color', 'background-color');
            } else if (o.pattern === 'dot') {
                o.element.style.backgroundColor = `rgba(255,255,255,1)`;
                updatedSvgText = updateSvgColors(dotSvg, o.light, o.dark, 'main-color', 'secondary-color');
            } else {
                setBackgroundColor(o.element, o.light);
            }

            o.element.style.visibility = "visible";

            var animationInfo = this.technique.getAnimationInfo(o, this.refreshRate, o.id, updatedSvgText);
            var cycleDurationString = String(animationInfo.duration).concat("s ", animationInfo.name, animationInfo.type);

            this.style.sheet.insertRule(animationInfo.rule, this.style.cssRules?.length ?? 0);
            o.element.style.animation = cycleDurationString;
        }
    }
}