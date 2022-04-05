"use strict";

import { calculateCycleDurationInSeconds } from '../../common.js';

// ------------------- Helper Functions -------------------

function getTotalNumberOfFrames(frequencyToSet, refreshRateCycleDuration) {
	var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);
	return Math.round(stimulusCycleDuration / refreshRateCycleDuration);
}   

export function calculateStimuliIntensities(stimulusInfo, screenRefreshRate)
{

	const intensities = []
	const refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate); // NOTE: Moved inside to minimize redundant code

	var halfCycle = getTotalNumberOfFrames(stimulusInfo.stimulusFrequency, refreshRateCycleDuration) / 2; // result may be whole no. or decimal

	intensities.push(...Array(Math.ceil(halfCycle)).fill(1)); // first cycle half
	intensities.push(...Array(Math.floor(halfCycle)).fill(0)); // second cycle half


    return intensities;
}


