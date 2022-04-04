"use strict";

const period = new Decimal(2).times(Decimal.acos(-1));
var rafTimestamps = [], refreshRates = [], screenRefreshRate = 0;

function getRefreshRateReadings(now) 
{
    
  	rafTimestamps.unshift(now); // place current timestamp (passed each time requestAnimationFrame is invoked) at the start of the array
    
  	if (rafTimestamps.length > 10) 
  	{ // once 'timestamps' array contains 11 elements

  		var firstTime = rafTimestamps.pop(); 
  		var refreshRate = 1000 * 10 / (now - firstTime);
  		refreshRates.unshift(refreshRate);

    	if (refreshRates.length == 300)
    	{

    		  cancelAnimationFrame(id);
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

	maxCount = Object.keys(refreshRateCount).map(Number).filter(
                    r => refreshRateCount[r] == Math.max.apply(null, Object.values(refreshRateCount))); //may contain list of strings

	if (maxCount.length > 1) maxCount = [maxCount.reduce((a, b) => a + b) / maxCount.length];

	screenRefreshRate = maxCount.shift().toFixed(7);
	setFlickerAnimation();
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
          period = new Decimal(2).times(Decimal.acos(-1)), 
          halfPeriod = period.times(dutyCycle.div(100));

    var modulusValue = modulus(timeInstant, period);

    return 2 * (modulusValue.toNumber() < halfPeriod.toNumber() ? 1 : 0) - 1;
}

function setUpKeyframe(keyframeString, keyframeName)
{
	  var keyframe = `@keyframes ${keyframeName} { ${keyframeString} }`;

  	return keyframe;
}

function calculateStimuliIntensities(stimulusInfo)
{ 

    var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.stimulusFrequency),
        currentInterval = new Decimal(0), 
        keyframeString = "", 
        lastOpacity = 0;
    const totalNumberOfFrames = new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(), 
          keyframeInterval = new Decimal(100).div(new Decimal(totalNumberOfFrames));
       
    for (var frame = 0; frame < totalNumberOfFrames; frame ++)
    {
        var squareWaveResult = generateSquareWave(new Decimal(period).times(stimulusInfo.stimulusFrequency)
                                .times(new Decimal(frame).div(screenRefreshRate)).add(stimulusInfo.phaseShift));

        var intensity = new Decimal(0.5).times(new Decimal(1).add(squareWaveResult)).toNumber();

        if (keyframeString === "" || lastOpacity != intensity)
        {
          keyframeString += `${currentInterval.toNumber()}% { opacity: ${intensity}; } `;
          lastOpacity = intensity;
        }

        currentInterval = currentInterval.add(keyframeInterval);
    }

    var singleFrameDuration = new Decimal(1).div(screenRefreshRate);
    var animationDuration = singleFrameDuration.times(totalNumberOfFrames).toNumber();

    return { keyframe: setUpKeyframe(keyframeString, stimulusInfo.keyframeName), animationDuration: animationDuration };
}

function setFlickerAnimation()
{
  	try
  	{
     	const animationType = " step-end infinite", baseKframeName = "stimulus_";
    	var elements = document.getElementsByClassName("SSVEP"), styleSheet = document.styleSheets[1];

    	for (var counter = 0; counter < elements.length; counter ++)
    	{
    		  var kframeName = baseKframeName.concat(counter); 
	        var lightColor = elements[counter].getAttribute("data-light-color");

	        elements[counter].style.backgroundColor = lightColor;
	        elements[counter].style.visibility = "visible";

	        var stimulusInfo = {
	        	stimulusFrequency: elements[counter].getAttribute("data-frequency"),
	        	phaseShift: elements[counter].getAttribute("data-phase-shift"),
	        	keyframeName: kframeName
	        };
	       	        
	        var animationInfo = calculateStimuliIntensities(stimulusInfo);
	        var cycleDurationString = animationInfo.animationDuration + "s ".concat(kframeName, animationType);
       		
	        styleSheet.insertRule(animationInfo.keyframe, styleSheet.cssRules.length);					
	        elements[counter].style.animation = cycleDurationString;
    	}
  	}
  	catch (ex)
  	{
      console.log("Exception thrown: " + ex);
    	alert(ex);
  	}        
}
