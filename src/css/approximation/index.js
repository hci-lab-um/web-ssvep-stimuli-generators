"use strict";
import Decimal from '../../external/decimal.mjs';
import { calculateNumberOfSeconds, generateSquareWave, modulus, period } from '../../common.js';
import Patterns from '../../patterns.js';

let changePosition = true;
let changePosition2 = true;

function setUpKeyframe(keyframeString, keyframeName) {
  var keyframe = `@keyframes ${keyframeName} { ${keyframeString} }`;

  return keyframe;
}

export function getAnimationInfo(stimulusInfo, screenRefreshRate, id = Math.floor(1000000 * Math.random())) {

  const type = " step-end infinite", name = "stimulus_" + id

  var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.frequency),
    currentInterval = new Decimal(0),
    keyframeString = "",
    lastState;
  const totalNumberOfFrames = new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(), keyframeInterval = new Decimal(100).div(new Decimal(totalNumberOfFrames));


  for (var frame = 0; frame < totalNumberOfFrames; frame++) {
    var squareWaveResult = generateSquareWave(
      new Decimal(period).times(stimulusInfo.frequency).times(new Decimal(frame).div(screenRefreshRate)).add(stimulusInfo.phaseShift)
    );

    switch (stimulusInfo.pattern) {
      case Patterns.SOLID:
        var isLight = squareWaveResult > 0;

        // Define light and dark colors
        var lightColor = `rgba(${stimulusInfo.light})`;
        var darkColor = `rgba(${stimulusInfo.dark})`;

        // Create keyframe string based on the flicker effect
        if (keyframeString === "" || lastState !== isLight) {
          var color = isLight ? lightColor : darkColor;
          keyframeString += `${currentInterval.toNumber()}% { background-color: ${color}; } `;
          lastState = isLight;
        }

        break;

      case Patterns.DOT:
        const isDotVisible = squareWaveResult > 0;
        let randomX, randomY;

        if (isDotVisible) {
          // Generate random background position to simulate a flicker effect
          if (changePosition) {
            changePosition = false;
            randomX = Math.floor(Math.random() * 91); // Random value between 0 and 90
            randomY = Math.floor(Math.random() * 91); // Random value between 0 and 90
          }

          keyframeString += `${currentInterval.toNumber()}% { 
                    background-image: url('random-dot-stimuli.webp'); 
                    background-size: 300%;
                    background-position: ${randomX}% ${randomY}%; /* This line will only be printed if randomX and randomY are defined */
                    transition: none;
                }`;
        } else {
          changePosition = true;
          keyframeString += `${currentInterval.toNumber()}% { 
                    background-image: none;
                    background-size: auto; 
                    background-position: initial;
                }`;
        }
        break;

      case Patterns.DOT_CONT:
        const isDotVisibleCont = squareWaveResult > 0;
        let randomXCont, randomYCont;

        if (isDotVisibleCont) {
          // Generate random background position to simulate a flicker effect
          if (changePosition2) {
            changePosition2 = false;
            randomXCont = Math.floor(Math.random() * 91); // Random value between 0 and 90
            randomYCont = Math.floor(Math.random() * 91); // Random value between 0 and 90
          }

          keyframeString += `${currentInterval.toNumber()}% { 
                          background-image: url('random-dot-stimuli.webp'); 
                          background-size: 300%;
                          background-position: ${randomXCont}% ${randomYCont}%; /* This line will only be printed if randomXCont and randomYCont are defined */
                          transition: none;
                      }`;
        } else {
          changePosition2 = true;
        }
        break;

      case Patterns.CHEQUERED:
        // Determine if it's a "light" or "dark" frame based on square wave
        const isLightFrame = squareWaveResult > 0;
        const checkeredBackground = isLightFrame
          ? `linear-gradient(45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(-45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%), linear-gradient(-45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%);`
          : `linear-gradient(-45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(-45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%), linear-gradient(45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%);`;

        if (keyframeString === "" || lastState != squareWaveResult) {
          keyframeString += `${currentInterval.toNumber()}% { 
                    background-image: ${checkeredBackground}; 
                    background-size: 40px 40px;
                    background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
                }`;
          lastState = squareWaveResult;
        }
        break;

      default:
        throw new Error(`Unknown pattern: ${stimulusInfo.pattern}`);
    }

    currentInterval = currentInterval.add(keyframeInterval);
  }

  var singleFrameDuration = new Decimal(1).div(screenRefreshRate);
  var duration = singleFrameDuration.times(totalNumberOfFrames).toNumber();

  return {
    rule: setUpKeyframe(keyframeString, name),
    duration,
    type,
    name
  };
}