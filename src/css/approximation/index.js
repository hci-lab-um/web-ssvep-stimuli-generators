"use strict";
import Decimal from '../../external/decimal.mjs';
import { calculateNumberOfSeconds, generateSquareWave, modulus, period } from '../../common.js';

function setUpKeyframe(keyframeString, keyframeName) {
  var keyframe = `@keyframes ${keyframeName} { ${keyframeString} }`;

  return keyframe;
}

export function getAnimationInfo(stimulusInfo, screenRefreshRate, id = Math.floor(1000000 * Math.random())) {

  const type = " step-end infinite", name = "stimulus_" + id

  var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.frequency),
    currentInterval = new Decimal(0),
    keyframeString = "",
    lastOpacity = 0;
  const totalNumberOfFrames = new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(), keyframeInterval = new Decimal(100).div(new Decimal(totalNumberOfFrames));


  for (var frame = 0; frame < totalNumberOfFrames; frame++) {
    var squareWaveResult = generateSquareWave(
      new Decimal(period).times(stimulusInfo.frequency).times(new Decimal(frame).div(screenRefreshRate)).add(stimulusInfo.phaseShift)
    );

    switch (stimulusInfo.pattern) {
      case "solid":
        var intensity = new Decimal(0.5).times(new Decimal(1).add(squareWaveResult)).toNumber();

        if (keyframeString === "" || lastOpacity != intensity) {
          keyframeString += `${currentInterval.toNumber()}% { opacity: ${intensity}; } `;
          lastOpacity = intensity;
        }

        break;

      case "dot":
        const isDotVisible = squareWaveResult > 0;

        if (isDotVisible) {
          // Generate random background position to simulate a flicker effect
          const randomX = Math.floor(Math.random() * 91); // Random value between 0 and 90
          const randomY = Math.floor(Math.random() * 91); // Random value between 0 and 90

          keyframeString += `${currentInterval.toNumber()}% { 
                      background-image: url('rand_dot_5k.png'); 
                      background-size: cover; 
                      background-position: ${randomX}% ${randomY}%; 
                      transition: none;
                  }`;
        } else {
          keyframeString += `${currentInterval.toNumber()}% { 
                      background-image: none;
                  }`;
        }
        break;

      case "checkered":
        // Determine if it's a "light" or "dark" frame based on square wave
        const isLightFrame = squareWaveResult > 0;
        const checkeredBackground = isLightFrame
          ? `linear-gradient(45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(-45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%), linear-gradient(-45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%);`
          : `linear-gradient(-45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(45deg, rgba(${stimulusInfo.dark}) 25%, transparent 25%), linear-gradient(-45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%), linear-gradient(45deg, transparent 75%, rgba(${stimulusInfo.dark}) 75%);`;

        if (keyframeString === "" || lastOpacity != squareWaveResult) {
          keyframeString += `${currentInterval.toNumber()}% { 
                  background-image: ${checkeredBackground}; 
                  background-size: 20px 20px;
                  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
              }`;
          lastOpacity = squareWaveResult;
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