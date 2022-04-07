import * as webgl from  './webgl.js'
import * as approximation from './approximation/index.js'
import * as periodic from './periodic/index.js'
import { calculateRefreshRate } from '../common.js'

const methods = {
    approximation,
    periodic
}

export async function start(method="periodic", elements, canvas, samples=10) {

	const screenRefreshRate = await calculateRefreshRate(10, samples) 
	let animationManagers = []

	if (!(method in methods)) throw 'Method not available for WebGL!'
	else if (!(canvas instanceof HTMLCanvasElement)) throw 'canvas argument is not an HTMLCanvasElement!'
    else {

		var gl = canvas.getContext("webgl", { powerPreference: "high-performance", alpha: false });
		var shaderProgram = webgl.createShaderProgram(gl, webgl.vertex, webgl.fragment); 
		var positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
		var texCoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");
		var positionBuffer = webgl.setUpBuffer(gl);

		// Note: Moved outside of webgl.initWebGlRenderingComponents
		gl.useProgram(shaderProgram);
		gl.enableVertexAttribArray(positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	for (var counter = 0; counter < elements.length; counter++) {
		var darkColour = elements[counter].getAttribute("data-dark-color").split(',').map(Number); 
    	var lightColour = elements[counter].getAttribute("data-light-color").split(',').map(Number); 
    	var offScreenCanvases = webgl.setUpOffScreenCanvases(darkColour, lightColour);

    	var stimulusFrequency = Number(elements[counter].getAttribute("data-frequency")); 
		var phaseShift = Number(elements[counter].getAttribute("data-phase-shift")); 

    	const intensities = methods[method].calculateStimuliIntensities({stimulusFrequency, phaseShift}, screenRefreshRate)

		// Setup Dark Texture
		var darkTexCoordBuffer = webgl.setUpBuffer(gl);
		var darkTexture = webgl.setUpTexture(gl, offScreenCanvases.darkOffScreenCanvas);

		// Setup Light Texture
		var lightTexCoordBuffer = webgl.setUpBuffer(gl);
		var lightTexture = webgl.setUpTexture(gl, offScreenCanvases.lightOffScreenCanvas);

    	var elementInfo = { 
							element: elements[counter],
			            	stimulusCycle: {
			            		intensities,
		               			maxFrames: intensities.length,
			            	},
			            	textures: {
			            		darkTexture,
		               			lightTexture,
		               			texCoordLocation, 
		               		},
		               		coordBuffers: {
								darkTexCoordBuffer, 
								lightTexCoordBuffer 
		               		},
		               		counter: 0
		            	};

		const manager = {id: null}
		animationManagers.push(animate(performance.now(), elementInfo, gl, manager))
	}
}

return () => {
	animationManagers.forEach(o => window.cancelAnimationFrame(o.id))
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
}
}

export function animate(now, elementInfo, gl, animationManager){
	if (elementInfo.stimulusCycle.intensities[elementInfo.counter] === 1){
	        
	    webgl.setStimulusColour(gl, {
							element: elementInfo.element, 
		    				coordBuffer: elementInfo.coordBuffers.lightTexCoordBuffer,
		    				texCoordLoc: elementInfo.textures.texCoordLocation, 
		    				texture: elementInfo.textures.lightTexture
	    				  });

	} else{

	    webgl.setStimulusColour(gl,  {
							element: elementInfo.element, 
		    				coordBuffer: elementInfo.coordBuffers.darkTexCoordBuffer,
		    				texCoordLoc: elementInfo.textures.texCoordLocation, 
		    				texture: elementInfo.textures.darkTexture
		    			  });
	}

	(elementInfo.counter < elementInfo.stimulusCycle.maxFrames - 1 ? elementInfo.counter++ : elementInfo.counter = 0);

	animationManager.id = window.requestAnimationFrame(function(now) { 
		animate(now, elementInfo, gl, animationManager) 
	});

	return animationManager
}
