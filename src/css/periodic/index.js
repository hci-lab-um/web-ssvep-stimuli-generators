import { getRefreshRateReadings, calculateRefreshRate, calculateCycleDurationInSeconds } from '../../common.js';
import Patterns from '../../patterns.js';

// css_script.js - generates CSS keyframes for each stimulus to be presented on-screen

function getStimulusCycleDuration(screenRefreshRate, frequencyToSet) {
  var refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate);
  var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);

  var numberOfFrames = Math.ceil(stimulusCycleDuration / refreshRateCycleDuration);
  return numberOfFrames * refreshRateCycleDuration;
}

export function getAnimationInfo(stimulusInfo, screenRefreshRate, id, updatedSvgText) {
  const randomX = Math.floor(Math.random() * 101) + '%';
  const randomY = Math.floor(Math.random() * 101) + '%';

  const updatedSvgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(updatedSvgText)}`

  const stimulusPatterns = {
    [Patterns.SOLID]: (id) => `
    @keyframes solid-${id} {
      0%  { background-color: rgba(${stimulusInfo.light}); }
      50% { background-color: rgba(${stimulusInfo.dark}); }
    }`,

    [Patterns.DOT]: (id) => `
    @keyframes dot-${id} {
      0%  { 
            background-image: url('${updatedSvgDataUrl}'); 
            background-position: ${randomX} ${randomY};
            transition: none;
          }
      50% { 
            background-image: none;
            background-size: auto; 
            background-position: initial;
          }
    }`,

    [Patterns.DOT_CONT]: (id) => `
    @keyframes dot-cont-${id} {
      0%  { 
            background-image: url('random-dot-stimuli.webp'); 
            background-size: 300%;
            background-position: var(--random2-x, 50%) var(--random2-y, 50%);
            transition: none;
          }
      50% { 
            background-image: url('random-dot-stimuli.webp');
            background-size: 300%;
            background-position: var(--random2-x, 50%) var(--random2-y, 50%);
          }
      100% {
            background-image: url('random-dot-stimuli.webp');
            background-size: 300%;
            background-position: var(--random2-x, 50%) var(--random2-y, 50%);
          }
    }`,

    [Patterns.CHEQUERED]: (id) => `
    @keyframes chequered-${id} {
      0%  { background-image: linear-gradient(45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(-45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%), linear-gradient(-45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%); 
            background-size: 40px 40px;
            background-position: 0 0, 0 20px, 20px -20px, -20px 0px; 
          }
      50% { background-image: linear-gradient(-45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(-45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%), linear-gradient(45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%); 
            background-size: 40px 40px;
            background-position: 0 0, 0 20px, 20px -20px, -20px 0px; 
          }
    }`,
  };

  const seconds = "s ", type = " step-end infinite", name = stimulusInfo.pattern || Patterns.SOLID;

  var duration = getStimulusCycleDuration(screenRefreshRate, stimulusInfo.frequency).toString();

  // Select the CSS rule based on the pattern type
  const rule = (stimulusPatterns[name] || stimulusPatterns[Patterns.SOLID])(id); // Default to 'SOLID' if no pattern is specified

  return {
    duration,
    name: `${name}-${id}`, // Unique animation name
    type,
    rule
  };
}