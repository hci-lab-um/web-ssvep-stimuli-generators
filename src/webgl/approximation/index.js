"use strict";
import Decimal from '../../external/decimal.mjs';
import * as webgl from  '../webgl.js'
import { calculateNumberOfSeconds, generateSquareWave, modulus, period } from '../../common.js';

export function calculateStimuliIntensities(stimulusInfo, screenRefreshRate){

    var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.stimulusFrequency), intensities = [];
    const totalNumberOfFrames = new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(); 
    
    for (var frame = 0; frame < totalNumberOfFrames; frame ++){	
    	var squareWaveResult = generateSquareWave(
			new Decimal(period).times(stimulusInfo.stimulusFrequency).times(new Decimal(frame).div(screenRefreshRate)).add(stimulusInfo.phaseShift)
		);

    	var intensity = new Decimal(0.5).times(new Decimal(1).add(squareWaveResult));
    	intensities.push(intensity.toNumber());
    }

    return intensities;
}

