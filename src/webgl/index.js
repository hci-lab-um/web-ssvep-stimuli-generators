import * as webgl from  './webgl.js'
import * as approximation from './approximation/index.js'
import * as periodic from './periodic/index.js'

const methods = {
    approximation,
    periodic
}

export function start(method="periodic", elements, screenRefreshRate, canvas) {

    if (!(method in methods)) console.error('Method not available for WebGL')
    else {
	for (var counter = 0; counter < elements.length; counter++) {
		var darkColour = elements[counter].getAttribute("data-dark-color").split(',').map(Number); 
    	var lightColour = elements[counter].getAttribute("data-light-color").split(',').map(Number); 

    	var offScreenCanvases = webgl.setUpOffScreenCanvases(darkColour, lightColour);

    	var stimulusFrequency = Number(elements[counter].getAttribute("data-frequency")); 
		var phaseShift = Number(elements[counter].getAttribute("data-phase-shift")); 

    	const intensities = methods[method].calculateStimuliIntensities({stimulusFrequency, phaseShift}, screenRefreshRate)
    	var glComponents = webgl.initWebGlRenderingComponents(canvas, offScreenCanvases.darkOffScreenCanvas, offScreenCanvases.lightOffScreenCanvas);

    	var elementInfo = 
    					{ 
							element: elements[counter],
			            	stimulusCycle: {
			            		intensities: intensities,
		               			maxFrames: intensities.length,
			            	},
			            	textures: {
			            		darkTexture: glComponents.darkTexture,
		               			lightTexture: glComponents.lightTexture,
		               			texCoordLocation: glComponents.texCoordLocation, 
		               		},
		               		coordBuffers: {
		               			darkTexCoordBuffer: glComponents.darkTexCoordBuffer, 
								lightTexCoordBuffer: glComponents.lightTexCoordBuffer, 
		               		},
		               		counter: 0
		            	};

    	animate(performance.now(), elementInfo, glComponents);
	}
}
}

export function animate(now, elementInfo, glComponents)
{
	if (elementInfo.stimulusCycle.intensities[elementInfo.counter] === 1)
	{
	        
	    webgl.setStimulusColour(glComponents.gl, {
							element: elementInfo.element, 
		    				coordBuffer: elementInfo.coordBuffers.lightTexCoordBuffer,
		    				texCoordLoc: elementInfo.textures.texCoordLocation, 
		    				texture: elementInfo.textures.lightTexture
	    				  });

	}
	else
	{

	    webgl.setStimulusColour(glComponents.gl,  {
							element: elementInfo.element, 
		    				coordBuffer: elementInfo.coordBuffers.darkTexCoordBuffer,
		    				texCoordLoc: elementInfo.textures.texCoordLocation, 
		    				texture: elementInfo.textures.darkTexture
		    			  });
	}

	(elementInfo.counter < elementInfo.stimulusCycle.maxFrames - 1 ? elementInfo.counter++ : elementInfo.counter = 0);

	window.requestAnimationFrame(function(now) { animate(now, elementInfo, glComponents) });
}
