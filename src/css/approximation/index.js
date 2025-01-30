"use strict";
import Decimal from '../../external/decimal.mjs';
import { calculateNumberOfSeconds, generateSquareWave, modulus, period } from '../../common.js';
import Patterns from '../../patterns.js';

function setUpKeyframe(keyframeString, keyframeName) {
  var keyframe = `@keyframes ${keyframeName} { ${keyframeString} }`;

  return keyframe;
}

export function getAnimationInfo(stimulusInfo, screenRefreshRate, id, updatedSvgText) {

  const maxFrames = 120,
    type = " step-end infinite", name = "stimulus_" + id

  var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.frequency),
    currentInterval = new Decimal(0),
    keyframeString = "",
    lastState;

  const totalNumberOfFrames = Math.min(new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(), maxFrames),
    keyframeInterval = new Decimal(100).div(new Decimal(totalNumberOfFrames));

  const randomX = Math.floor(Math.random() * 101); // Random value from 0 to 100
  const randomY = Math.floor(Math.random() * 101); // Random value from 0 to 100

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

        if (isDotVisible) {
          const updatedSvgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(updatedSvgText)}`;

          keyframeString += `${currentInterval.toNumber()}% { 
                    background-image: url('${updatedSvgDataUrl}');
                    background-position: ${randomX}% ${randomY}%;
                    transition: none;
                }`;
        } else {
          keyframeString += `${currentInterval.toNumber()}% { 
                    background-image: none;
                    background-size: auto; 
                    background-position: initial;
                }`;
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