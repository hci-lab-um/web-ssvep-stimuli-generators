import * as approximation from './approximation/index.js'
import * as periodic from './periodic/index.js'
import { calculateRefreshRate } from '../common.js'

const methods = {
    approximation,
    periodic
}

export async function start(method="periodic", elements, samples) {

    const screenRefreshRate = await calculateRefreshRate(10, samples) 
    if (!(method in methods)) throw 'Method not available for CSS!'
    else {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    document.head.appendChild(styleSheet);
  
    // Start Function
    
    for (var counter = 0; counter < elements.length; counter++) {
  
      // Apply Colors
      // var dark = elements[counter].getAttribute("data-dark-color"); 
      var light = elements[counter].getAttribute("data-light-color");
      if (light){
        const rgbaVals =  light.split(',')
        const rgb = rgbaVals.slice(0,3).map(v => 255*(v ?? 1))
        elements[counter].style.backgroundColor = `rgba(${rgb},${rgbaVals[3]})`;
      }
      elements[counter].style.visibility = "visible"
  
      var frequency = Number(elements[counter].getAttribute("data-frequency"));
      var phaseShift = Number(elements[counter].getAttribute("data-phase-shift"));

      var animationInfo = methods[method].getAnimationInfo({frequency, phaseShift}, screenRefreshRate)
      styleSheet.sheet.insertRule(animationInfo.rule, styleSheet.cssRules?.length ?? 0);
      var cycleDurationString = String(animationInfo.duration).concat("s ", animationInfo.name, animationInfo.type);
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
}