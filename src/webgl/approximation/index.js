"use strict";
import Decimal from '../../external/decimal.mjs';
import * as webgl from  '../webgl.js'

// ------------------- Helper Functions -------------------
const period = new Decimal(2).times(Decimal.acos(-1));

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

export function calculateStimuliIntensities(stimulusInfo, screenRefreshRate)
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

