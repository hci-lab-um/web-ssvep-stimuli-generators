"use strict";

const period = new Decimal(2).times(Decimal.acos(-1));
var rafTimestamps = [], refreshRates = [], screenRefreshRate = 0;

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

    screenRefreshRate = maxCount.shift().toFixed(7);
    setUpFlickerAnimation();

}

function setUpFlickerAnimation()
{

	var elements = document.getElementsByClassName("SSVEP");

	for (var counter = 0; counter < elements.length; counter ++)
	{
		var darkColour = elements[counter].getAttribute("data-dark-color").split(',').map(Number); 
    	var lightColour = elements[counter].getAttribute("data-light-color").split(',').map(Number); 

    	var offScreenCanvases = setUpOffScreenCanvases(darkColour, lightColour);

    	var frequencyToSet = Number(elements[counter].getAttribute("data-frequency"));
    	var phaseShift = Number(elements[counter].getAttribute("data-phase-shift"));

    	var intensities = calculateStimuliIntensities({
    													stimulusFrequency: frequencyToSet,
    													phaseShift: phaseShift
    												  });

    	var glComponents = initWebGlRenderingComponents(offScreenCanvases.darkOffScreenCanvas, offScreenCanvases.lightOffScreenCanvas);

    	var elementInfo = 
    					{ 
							element: elements[counter],
			            	stimulusCycle: {
			            		intensities: intensities,
			            		maxFrames: intensities.length
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

function countDecimals(stimulusFrequency) 
{
  	if (Math.floor(stimulusFrequency) === Number(stimulusFrequency)) 
          return 0;

    var noOfDecimalPlaces = stimulusFrequency.toString().split(".")[1].length;

    if (noOfDecimalPlaces < 3)
      return noOfDecimalPlaces; 

    throw "Stimuli frequencies must have less than 3 decimal places."
}

function calculateNumberOfSeconds(stimulusFrequency)
{
    var maxSeconds = Math.pow(10, countDecimals(stimulusFrequency));

    for (var noOfSecs = 1; noOfSecs <= maxSeconds; noOfSecs += 1) 
    {
        var noOfCycles = new Decimal(noOfSecs).times(stimulusFrequency);

        if (noOfCycles.mod(1).toNumber() === 0)
           return noOfSecs;
    }

    throw "Failed to calculate the required number of seconds.";
}

function modulus(x, y)
{
	var quotient = x.div(y);
	var quotientInt = new Decimal(quotient.toFixed(0));

	if ((quotient.minus(quotientInt)).div(quotientInt).abs().toNumber() < Number.EPSILON)
	{
		return new Decimal(0);
	}
	else
	{
		var n = quotient.floor();
		var temp = y.times(n);

		var signY = Math.sign(y.toNumber());
		var result = x.minus(temp);

		if (!x.equals(y) && !result.equals(0))
		{
			if (Math.sign(result.toNumber()) != signY)
				result = result.abs().times(signY);
		}

		return result;
	}
}
									
function generateSquareWave(timeInstant)
{
	const dutyCycle = new Decimal(50), 
		  halfPeriod = period.times(dutyCycle.div(100));
		  
	var modulusValue = modulus(timeInstant, period);

	return 2 * (modulusValue.toNumber() < halfPeriod.toNumber() ? 1 : 0) - 1;
}

function calculateStimuliIntensities(stimulusInfo)
{
    var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.stimulusFrequency), intensities = [];
    const totalNumberOfFrames = new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(); 
    
    for (var frame = 0; frame < totalNumberOfFrames; frame ++)
    {	
    	var squareWaveResult = generateSquareWave(new Decimal(period).times(stimulusInfo.stimulusFrequency)
    								.times(new Decimal(frame).div(screenRefreshRate)).add(stimulusInfo.phaseShift));

    	var intensity = new Decimal(0.5).times(new Decimal(1).add(squareWaveResult));
    	intensities.push(intensity.toNumber());
    }

    return intensities;
}

