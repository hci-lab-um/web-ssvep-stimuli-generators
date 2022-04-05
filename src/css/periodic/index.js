import { getRefreshRateReadings, calculateRefreshRate, calculateCycleDurationInSeconds } from '../../common.js';

//css_script.js - generates CSS keyframes for each stimulus to be presented on-screen

function getStimulusCycleDuration(screenRefreshRate, frequencyToSet) {

  var refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate);
  var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);

  var numberOfFrames = Math.ceil(stimulusCycleDuration / refreshRateCycleDuration);
  return numberOfFrames * refreshRateCycleDuration;
}


export function start(elements, screenRefreshRate) {

  const seconds = "s ", animationType = " step-end infinite", keyframeName = "flicker";

  for (var counter = 0; counter < elements.length; counter++) {

    // var dark = elements[counter].getAttribute("data-dark-color");
    // var light = elements[counter].getAttribute("data-light-color");

    var frequencyToSet = elements[counter].getAttribute("data-frequency");
    var cycleDurationInSeconds = getStimulusCycleDuration(screenRefreshRate, frequencyToSet).toString();

    var cycleDurationString = cycleDurationInSeconds.concat(seconds, keyframeName, animationType);

    elements[counter].style.animation = cycleDurationString;
  }
}