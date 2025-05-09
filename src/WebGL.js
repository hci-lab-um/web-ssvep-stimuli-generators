import * as approximation from './webgl/approximation/index.js'
import * as periodic from './webgl/periodic/index.js'
import * as webgl from './webgl/webgl.js'

import SSVEP from './SSVEP.js'

export class WebGL extends SSVEP {

    gl = null
    texCoordLocation = null
    canvas = null

    constructor(method = 'periodic', canvas, samples = 10) {
        super({ approximation, periodic }, method, samples)
        this.canvas = canvas
        this.canvas.style.pointerEvents = 'none';
    }

    onstart = () => {
        this.gl = this.canvas.getContext("webgl", { powerPreference: "high-performance", alpha: true });
        var shaderProgram = webgl.createShaderProgram(this.gl, webgl.vertex, webgl.fragment);
        var positionLocation = this.gl.getAttribLocation(shaderProgram, "a_position");
        this.texCoordLocation = this.gl.getAttribLocation(shaderProgram, "a_texCoord");
        var positionBuffer = webgl.setUpBuffer(this.gl);
        this.gl.useProgram(shaderProgram);
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    }

    ondelete = (o) => {
        window.cancelAnimationFrame(o.animationId)
        o.animate = null
    }

    onstop = () => {
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
    }

    // Return Element Info
    getElementInfo = (o) => {
        o.dark = o.element.getAttribute("data-dark-color") ?? '0,0,0,1'
        o.light = o.element.getAttribute("data-light-color") ?? '1,1,1,1'
        const dark = o.dark.split(',').map(Number);
        const light = o.light.split(',').map(Number);
        var offScreenCanvases = webgl.setUpOffScreenCanvases(dark, light);

        const intensities = this.technique.calculateStimuliIntensities(o, this.refreshRate)

        // Setup Dark Texture
        var darkTexCoordBuffer = webgl.setUpBuffer(this.gl);
        var darkTexture = webgl.setUpTexture(this.gl, offScreenCanvases.darkOffScreenCanvas);

        // Setup Light Texture
        var lightTexCoordBuffer = webgl.setUpBuffer(this.gl);
        var lightTexture = webgl.setUpTexture(this.gl, offScreenCanvases.lightOffScreenCanvas);

        return {
            element: o.element,
            stimulusCycle: {
                intensities,
                maxFrames: intensities.length,
            },
            textures: {
                darkTexture,
                lightTexture,
                texCoordLocation: this.texCoordLocation,
            },
            coordBuffers: {
                darkTexCoordBuffer,
                lightTexCoordBuffer
            },
            counter: 0,
            pattern: o.pattern,
            lightColor: light,
            darkColor: dark
        };
    }

    animate = (o) => {

        // Set Element Animation
        const elementInfo = this.getElementInfo(o)
        o.animate = () => {

            if (elementInfo.stimulusCycle.intensities[elementInfo.counter] === 1) {

                webgl.setStimulusColor(this.gl, {
                    element: elementInfo.element,
                    coordBuffer: elementInfo.coordBuffers.lightTexCoordBuffer,
                    texCoordLoc: elementInfo.textures.texCoordLocation,
                    texture: elementInfo.textures.lightTexture,
                    pattern: elementInfo.pattern,
                    flicker: true,
                    lightColor: elementInfo.lightColor,
                    darkColor: elementInfo.darkColor
                });

            } else {

                webgl.setStimulusColor(this.gl, {
                    element: elementInfo.element,
                    coordBuffer: elementInfo.coordBuffers.darkTexCoordBuffer,
                    texCoordLoc: elementInfo.textures.texCoordLocation,
                    texture: elementInfo.textures.darkTexture,
                    pattern: elementInfo.pattern,
                    flicker: false,
                    lightColor: elementInfo.lightColor,
                    darkColor: elementInfo.darkColor
                });
            }

            (elementInfo.counter < elementInfo.stimulusCycle.maxFrames - 1 ? elementInfo.counter++ : elementInfo.counter = 0);
            o.animationId = window.requestAnimationFrame((now) => o.animate());
        }

        // Start Loop
        o.animate()

    }
}