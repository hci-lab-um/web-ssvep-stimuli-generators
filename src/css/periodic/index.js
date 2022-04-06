import { getRefreshRateReadings, calculateRefreshRate, calculateCycleDurationInSeconds } from '../../common.js';

//css_script.js - generates CSS keyframes for each stimulus to be presented on-screen

function getStimulusCycleDuration(screenRefreshRate, frequencyToSet) {

  var refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate);
  var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);

  var numberOfFrames = Math.ceil(stimulusCycleDuration / refreshRateCycleDuration);
  return numberOfFrames * refreshRateCycleDuration;
}


export function start(elements, screenRefreshRate) {

  // Insert Stylesheet with Keyframe
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  document.head.appendChild(styleSheet);
  styleSheet.sheet.insertRule(`
  @keyframes flicker {
      0% { opacity: 0; }
      50% { opacity: 1; }
  }`, styleSheet.length);

  // Start Function
  const seconds = "s ", animationType = " step-end infinite", keyframeName = "flicker";

  for (var counter = 0; counter < elements.length; counter++) {

    // Apply Colors
    // var dark = elements[counter].getAttribute("data-dark-color"); 
    var light = elements[counter].getAttribute("data-light-color");
    const rgbaVals =  light.split(',')
    const rgb = rgbaVals.slice(0,3).map(v => 255*(v ?? 1))
    elements[counter].style.backgroundColor = `rgba(${rgb},${rgbaVals[3]})`;
    elements[counter].style.visibility = "visible"

    var frequencyToSet = elements[counter].getAttribute("data-frequency");
    var cycleDurationInSeconds = getStimulusCycleDuration(screenRefreshRate, frequencyToSet).toString();

    var cycleDurationString = cycleDurationInSeconds.concat(seconds, keyframeName, animationType);

    elements[counter].style.animation = cycleDurationString;
  }
}