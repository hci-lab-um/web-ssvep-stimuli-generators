import { getRefreshRateReadings, calculateRefreshRate, calculateCycleDurationInSeconds } from '../../common.js';

//css_script.js - generates CSS keyframes for each stimulus to be presented on-screen

function getStimulusCycleDuration(screenRefreshRate, frequencyToSet) {

  var refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate);
  var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);
  // console.log(screenRefreshRate, frequencyToSet, refreshRateCycleDuration, stimulusCycleDuration)

  var numberOfFrames = Math.ceil(stimulusCycleDuration / refreshRateCycleDuration);
  return numberOfFrames * refreshRateCycleDuration;
}
const rule = `
@keyframes flicker {
    0% { opacity: 0; }
    50% { opacity: 1; }
}`

export function getAnimationInfo(stimulusInfo, screenRefreshRate){ 

  const seconds = "s ", type = " step-end infinite", name = "flicker";

  var duration = getStimulusCycleDuration(screenRefreshRate, stimulusInfo.frequency).toString();

  return {
    duration,
    name,
    type,
    rule
  }

}