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

export function start(elements, screenRefreshRate) {
  	try {
       
      // Insert Stylesheet with Keyframe
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      document.head.appendChild(styleSheet);

    	for (var counter = 0; counter < elements.length; counter ++){
          
          // Apply Colors
          // var dark = elements[counter].getAttribute("data-dark-color"); 
          var light = elements[counter].getAttribute("data-light-color");
          const rgbaVals =  light.split(',')
          const rgb = rgbaVals.slice(0,3).map(v => 255*(v ?? 1))
          elements[counter].style.backgroundColor = `rgba(${rgb},${rgbaVals[3]})`;
          elements[counter].style.visibility = "visible"

	        var stimulusInfo = {
	        	frequency: elements[counter].getAttribute("data-frequency"),
	        	phaseShift: elements[counter].getAttribute("data-phase-shift"),
	        };
	       	        
	        var animationInfo = getAnimationInfo(stimulusInfo, screenRefreshRate);
	        var cycleDurationString = animationInfo.duration + "s ".concat(animationInfo.name, animationInfo.type);

	        styleSheet.sheet.insertRule(animationInfo.rule, styleSheet.cssRules?.length ?? 0);					
          elements[counter].style.animation = cycleDurationString;
          console.log(animationInfo.rule, cycleDurationString)
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

  	} catch (ex) {
      console.log("Exception thrown: " + ex);
    	alert(ex);
  	}        
}

