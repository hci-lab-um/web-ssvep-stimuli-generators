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


export function start(elements, screenRefreshRate) {

  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  document.head.appendChild(styleSheet);

  // Insert Stylesheet with Keyframe
  styleSheet.sheet.insertRule(rule, styleSheet.length);

  // Start Function
  
  for (var counter = 0; counter < elements.length; counter++) {

    // Apply Colors
    // var dark = elements[counter].getAttribute("data-dark-color"); 
    var light = elements[counter].getAttribute("data-light-color");
    const rgbaVals =  light.split(',')
    const rgb = rgbaVals.slice(0,3).map(v => 255*(v ?? 1))
    elements[counter].style.backgroundColor = `rgba(${rgb},${rgbaVals[3]})`;
    elements[counter].style.visibility = "visible"

    var frequency = elements[counter].getAttribute("data-frequency");
    var animationInfo = getAnimationInfo({frequency}, screenRefreshRate)

    var cycleDurationString = animationInfo.duration.concat("s ", animationInfo.name, animationInfo.type);

    elements[counter].style.animation = cycleDurationString;
  }

  return () => {

    // Remove Stylesheet
    styleSheet.remove()

    // Remove Inline Styling
    elements.forEach(el => {
      el.style.animation = '';
      el.style.visibility = '';
      el.style.backgroundColor = '';
    })
  }
}