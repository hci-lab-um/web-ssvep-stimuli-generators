"use strict";
import Decimal from '../../external/decimal.mjs';
import { calculateNumberOfSeconds, generateSquareWave, modulus, period} from '../../common.js';

function setUpKeyframe(keyframeString, keyframeName){
	  var keyframe = `@keyframes ${keyframeName} { ${keyframeString} }`;

  	return keyframe;
}

export function getAnimationInfo(stimulusInfo, screenRefreshRate, id=Math.floor(1000000*Math.random())){ 

  const type = " step-end infinite", name = "stimulus_" + id 

    var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.frequency),
        currentInterval = new Decimal(0), 
        keyframeString = "", 
        lastOpacity = 0;
    const totalNumberOfFrames = new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(), keyframeInterval = new Decimal(100).div(new Decimal(totalNumberOfFrames));
       

    for (var frame = 0; frame < totalNumberOfFrames; frame ++){
        var squareWaveResult = generateSquareWave(
              new Decimal(period).times(stimulusInfo.frequency).times(new Decimal(frame).div(screenRefreshRate)).add(stimulusInfo.phaseShift)
        );

        var intensity = new Decimal(0.5).times(new Decimal(1).add(squareWaveResult)).toNumber();

        if (keyframeString === "" || lastOpacity != intensity){
          keyframeString += `${currentInterval.toNumber()}% { opacity: ${intensity}; } `;
          lastOpacity = intensity;
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
