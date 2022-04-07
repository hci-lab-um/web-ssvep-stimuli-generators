"use strict";
import Decimal from '../../external/decimal.mjs';
import { calculateNumberOfSeconds, generateSquareWave, modulus, period} from '../../common.js';

function setUpKeyframe(keyframeString, keyframeName){
	  var keyframe = `@keyframes ${keyframeName} { ${keyframeString} }`;

  	return keyframe;
}

function calculateStimuliIntensities(stimulusInfo, screenRefreshRate){ 

    var noOfSeconds = calculateNumberOfSeconds(stimulusInfo.stimulusFrequency),
        currentInterval = new Decimal(0), 
        keyframeString = "", 
        lastOpacity = 0;
    const totalNumberOfFrames = new Decimal(noOfSeconds).times(screenRefreshRate).ceil().toNumber(), keyframeInterval = new Decimal(100).div(new Decimal(totalNumberOfFrames));
       

    for (var frame = 0; frame < totalNumberOfFrames; frame ++){
        var squareWaveResult = generateSquareWave(
              new Decimal(period).times(stimulusInfo.stimulusFrequency).times(new Decimal(frame).div(screenRefreshRate)).add(stimulusInfo.phaseShift)
        );

        var intensity = new Decimal(0.5).times(new Decimal(1).add(squareWaveResult)).toNumber();

        if (keyframeString === "" || lastOpacity != intensity){
          keyframeString += `${currentInterval.toNumber()}% { opacity: ${intensity}; } `;
          lastOpacity = intensity;
        }

        currentInterval = currentInterval.add(keyframeInterval);
    }

    var singleFrameDuration = new Decimal(1).div(screenRefreshRate);
    var animationDuration = singleFrameDuration.times(totalNumberOfFrames).toNumber();

    return { keyframe: setUpKeyframe(keyframeString, stimulusInfo.keyframeName), animationDuration: animationDuration };
}

export function start(elements, screenRefreshRate) {
  	try {
     	const animationType = " step-end infinite", baseKframeName = "stimulus_";
    	var styleSheet = document.styleSheets[1]; // Assumption: Grab first stylesheet

    	for (var counter = 0; counter < elements.length; counter ++){
    		  var kframeName = baseKframeName.concat(counter); 

          
          // Apply Colors
          // var dark = elements[counter].getAttribute("data-dark-color"); 
          var light = elements[counter].getAttribute("data-light-color");
          const rgbaVals =  light.split(',')
          const rgb = rgbaVals.slice(0,3).map(v => 255*(v ?? 1))
          elements[counter].style.backgroundColor = `rgba(${rgb},${rgbaVals[3]})`;
          elements[counter].style.visibility = "visible"

	        var stimulusInfo = {
	        	stimulusFrequency: elements[counter].getAttribute("data-frequency"),
	        	phaseShift: elements[counter].getAttribute("data-phase-shift"),
	        	keyframeName: kframeName
	        };
	       	        
	        var animationInfo = calculateStimuliIntensities(stimulusInfo, screenRefreshRate);
	        var cycleDurationString = animationInfo.animationDuration + "s ".concat(kframeName, animationType);
       		
	        styleSheet.insertRule(animationInfo.keyframe, styleSheet.cssRules.length);					
	        elements[counter].style.animation = cycleDurationString;
    	}
  	} catch (ex) {
      console.log("Exception thrown: " + ex);
    	alert(ex);
  	}        
}

