import * as approximation from './webgl/approximation/index.js'
import * as periodic from './webgl/periodic/index.js'
import * as webgl from './webgl/webgl.js'

import SSVEP from './SSVEP.js'

export class WebGL extends SSVEP{

    gl = null
    texCoordLocation = null
    canvas = null

    constructor(method = 'periodic', canvas, samples = 10) {
        super({approximation, periodic}, method, samples)
        this.canvas = canvas
    }

    onstart = () => {
        this.gl = this.canvas.getContext("webgl", { powerPreference: "high-performance", alpha: false });
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

    onclear = () => {
       this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
    }

    // Return Element Info
    getElementInfo = (o) => {
        var darkColour = o.element.getAttribute("data-dark-color").split(',').map(Number); 
    	var lightColour = o.element.getAttribute("data-light-color").split(',').map(Number); 
    	var offScreenCanvases = webgl.setUpOffScreenCanvases(darkColour, lightColour);

    	var stimulusFrequency = Number(o.element.getAttribute("data-frequency")); 
		var phaseShift = Number(o.element.getAttribute("data-phase-shift")); 

    	const intensities = this.technique.calculateStimuliIntensities({stimulusFrequency, phaseShift}, this.refreshRate)

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
            counter: 0
        };
    }

    animate = (o) => {

        // Set Element Animation
        const elementInfo = this.getElementInfo(o)
        o.animate = () => {

            if (elementInfo.stimulusCycle.intensities[elementInfo.counter] === 1){
            
                webgl.setStimulusColour(this.gl, {
                                    element: elementInfo.element, 
                                    coordBuffer: elementInfo.coordBuffers.lightTexCoordBuffer,
                                    texCoordLoc: elementInfo.textures.texCoordLocation, 
                                    texture: elementInfo.textures.lightTexture
                                });
        
            } else {
        
                webgl.setStimulusColour(this.gl,  {
                                    element: elementInfo.element, 
                                    coordBuffer: elementInfo.coordBuffers.darkTexCoordBuffer,
                                    texCoordLoc: elementInfo.textures.texCoordLocation, 
                                    texture: elementInfo.textures.darkTexture
                                });
            }
        
            (elementInfo.counter < elementInfo.stimulusCycle.maxFrames - 1 ? elementInfo.counter++ : elementInfo.counter = 0);  
            o.animationId = window.requestAnimationFrame((now) => o.animate());
        }

        // Start Loop
        o.animate()

    }
}