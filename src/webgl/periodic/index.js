"use strict";
import { calculateCycleDurationInSeconds } from '../../common.js';

function getTotalNumberOfFrames(frequencyToSet, screenRefreshRate) {
	const refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate);
	var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);
	return Math.round(stimulusCycleDuration / refreshRateCycleDuration);
}   

export function calculateStimuliIntensities(stimulusInfo, screenRefreshRate) {
	
	const intensities = []
	var halfCycle = getTotalNumberOfFrames(stimulusInfo.frequency, screenRefreshRate) / 2; // result may be whole no. or decimal

	intensities.push(...Array(Math.ceil(halfCycle)).fill(1)); // first cycle half
	intensities.push(...Array(Math.floor(halfCycle)).fill(0)); // second cycle half
	
    return intensities;
}

