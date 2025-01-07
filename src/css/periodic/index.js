import { getRefreshRateReadings, calculateRefreshRate, calculateCycleDurationInSeconds } from '../../common.js';
import Patterns from '../../patterns.js';

// css_script.js - generates CSS keyframes for each stimulus to be presented on-screen

function getStimulusCycleDuration(screenRefreshRate, frequencyToSet) {
  var refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate);
  var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);

  var numberOfFrames = Math.ceil(stimulusCycleDuration / refreshRateCycleDuration);
  return numberOfFrames * refreshRateCycleDuration;
}

function setRandomPositionUpdater(variablePrefix, frequency) {
  const interval = 1000 / frequency; // Interval in milliseconds based on frequency
  setInterval(() => {
    const randomX = Math.floor(Math.random() * 91) + '%';
    const randomY = Math.floor(Math.random() * 91) + '%';
    document.documentElement.style.setProperty(`--${variablePrefix}-x`, randomX);
    document.documentElement.style.setProperty(`--${variablePrefix}-y`, randomY);
  }, interval);
}

export function getAnimationInfo(stimulusInfo, screenRefreshRate, id) {
  const stimulusPatterns = {
    [Patterns.SOLID]: (id) => `
    @keyframes solid-${id} {
      0%  { background-color: rgba(${stimulusInfo.light}); }
      50% { background-color: rgba(${stimulusInfo.dark}); }
    }`,

    [Patterns.DOT]: (id) => `
    @keyframes dot-${id} {
      0%  { 
            background-image: url('random-dot-stimuli.webp'); 
            background-size: 300%;
            background-position: var(--random-x, 50%) var(--random-y, 50%);
            transition: none;
          }
      50% { 
            background-image: none;
            background-size: auto; 
            background-position: initial;
          }
      100% {
            background-image: url('random-dot-stimuli.webp');
            background-size: 300%;
            background-position: var(--random-x, 50%) var(--random-y, 50%);
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

  // Set up position updaters for patterns that require it
  if (name === Patterns.DOT) {
    setRandomPositionUpdater('random', stimulusInfo.frequency);
  } else if (name === Patterns.DOT_CONT) {
    setRandomPositionUpdater('random2', stimulusInfo.frequency);
  }

  return {
    duration,
    name: `${name}-${id}`, // Unique animation name
    type,
    rule
  };
}