"use strict";

var rafTimestamps = [], refreshRates = [], refreshRateCycleDuration;

const calculateCycleDurationInSeconds = frequency => 1 / frequency; 

function getRefreshRateReadings(now) 
{
    
	rafTimestamps.unshift(now); // place current timestamp (passed each time requestAnimationFrame is invoked) at the start of the array
    
	if (rafTimestamps.length > 10) 
	{ // once 'timestamps' array contains 11 elements

    	var firstTime = rafTimestamps.pop(); // remove last element from 'timestamps' array and place in 'time' variable
    	var refreshRate = 1000 * 10 / (now - firstTime);
    	refreshRates.unshift(refreshRate);

    	if (refreshRates.length == 300)
    	{

      		cancelAnimationFrame(id);

      		// proceed with calculation for screen's refresh rate 
      		calculateRefreshRate();
      		return;
    	}
	}

	var id = window.requestAnimationFrame(getRefreshRateReadings);
};


window.requestAnimationFrame(getRefreshRateReadings);

function calculateRefreshRate() 
{

    var refreshRateCount = {}, maxCount = [];

    for(var i = 0; i < refreshRates.length; i++) 
    {

        if (!refreshRateCount[refreshRates[i]]) 
          refreshRateCount[refreshRates[i]] = 0;

        refreshRateCount[refreshRates[i]] += 1;
    }

    var frequentRefreshRates = Object.keys(refreshRateCount).filter(
                        r => refreshRateCount[r] == Math.max.apply(null, Object.values(refreshRateCount))); //may contain list of strings

    maxCount = frequentRefreshRates.map(Number);

    if (maxCount.length > 1) maxCount = [maxCount.reduce((a, b) => a + b) / maxCount.length];

    refreshRateCycleDuration = calculateCycleDurationInSeconds(maxCount.shift().toFixed(7));
    setUpFlickerAnimation();

} 

function getTotalNumberOfFrames(frequencyToSet)
{

	var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);
	return Math.round(stimulusCycleDuration / refreshRateCycleDuration);
}   

function setUpFlickerAnimation()
{
	var elements = document.getElementsByClassName("SSVEP");

	for (var counter = 0; counter < elements.length; counter ++)
	{	
		var intensities = [];

		var darkColour = elements[counter].getAttribute("data-dark-color").split(',').map(Number); 
    	var lightColour = elements[counter].getAttribute("data-light-color").split(',').map(Number); 

    	var offScreenCanvases = setUpOffScreenCanvases(darkColour, lightColour);

    	var frequencyToSet = Number(elements[counter].getAttribute("data-frequency")); 

    	var halfCycle = getTotalNumberOfFrames(frequencyToSet) / 2; // result may be whole no. or decimal

    	intensities.push(...Array(Math.ceil(halfCycle)).fill(1)); // first cycle half
    	intensities.push(...Array(Math.floor(halfCycle)).fill(0)); // second cycle half

    	var glComponents = initWebGlRenderingComponents(offScreenCanvases.darkOffScreenCanvas, offScreenCanvases.lightOffScreenCanvas);

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

    	animate(performance.now(), elementInfo);
	}
}

function animate(now, elementInfo)
{
	if (elementInfo.stimulusCycle.intensities[elementInfo.counter] === 1)
	{
	        
	    setStimulusColour({
							element: elementInfo.element, 
		    				coordBuffer: elementInfo.coordBuffers.lightTexCoordBuffer,
		    				texCoordLoc: elementInfo.textures.texCoordLocation, 
		    				texture: elementInfo.textures.lightTexture
	    				  });

	}
	else
	{

	    setStimulusColour({
							element: elementInfo.element, 
		    				coordBuffer: elementInfo.coordBuffers.darkTexCoordBuffer,
		    				texCoordLoc: elementInfo.textures.texCoordLocation, 
		    				texture: elementInfo.textures.darkTexture
		    			  });
	}

	(elementInfo.counter < elementInfo.stimulusCycle.maxFrames - 1 ? elementInfo.counter++ : elementInfo.counter = 0);

	window.requestAnimationFrame(function(now) { animate(now, elementInfo) });
}
