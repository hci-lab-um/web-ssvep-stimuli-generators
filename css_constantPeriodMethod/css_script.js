//css_script.js - generates CSS keyframes for each stimulus to be presented on-screen

var rafTimestamps = [], refreshRates = [];

window.onload = function()
{

      function getRefreshRateReadings(now) 
      {
            
          rafTimestamps.unshift(now); // place current timestamp (passed each time requestAnimationFrame is invoked) at the start of the array
            
          if (rafTimestamps.length > 10) 
          { // once 'timestamps' array contains 11 elements

            var firstTime = rafTimestamps.pop();
            var refreshRate = 1000 * 10 / (now - firstTime);
            refreshRates.unshift(refreshRate);

            if (refreshRates.length == 300)
            {

              cancelAnimationFrame(id);
              calculateRefreshRate();
              return;
            }
          }

          var id = window.requestAnimationFrame(getRefreshRateReadings);
      };


      window.requestAnimationFrame(getRefreshRateReadings);


      function calculateRefreshRate() 
      {

          var refreshRateCount = {}, maxCount = [];

          for(var i = 0; i < refreshRates.length; i++) 
          {

            if (!refreshRateCount[refreshRates[i]]) 
              refreshRateCount[refreshRates[i]] = 0;

            refreshRateCount[refreshRates[i]] += 1;
          }

          maxCount = Object.keys(refreshRateCount).map(Number).filter(
                              r => refreshRateCount[r] == Math.max.apply(null, Object.values(refreshRateCount))); //may contain list of strings

          if (maxCount.length > 1) maxCount = [maxCount.reduce((a, b) => a + b)/maxCount.length];

          setFlickerAnimation(maxCount.shift().toFixed(7));

      }  


      function calculateCycleDurationInSeconds(frequency)  
      { 
          return 1 / frequency; 
      }   


      function getStimulusCycleDuration(screenRefreshRate, frequencyToSet)
      {

          var refreshRateCycleDuration = calculateCycleDurationInSeconds(screenRefreshRate);
          var stimulusCycleDuration = calculateCycleDurationInSeconds(frequencyToSet);

          var numberOfFrames = Math.ceil(stimulusCycleDuration / refreshRateCycleDuration);
          return numberOfFrames * refreshRateCycleDuration;
      }  
      

      function setFlickerAnimation(screenRefreshRate)
      {

          const seconds = "s ", animationType = " step-end infinite", keyframeName = "flicker"; 

          var elements = document.getElementsByClassName("SSVEP"); 

          for (var counter = 0; counter < elements.length; counter ++)
          {

              var dark = elements[counter].getAttribute("data-dark-color"); 
              var light = elements[counter].getAttribute("data-light-color"); 

              var frequencyToSet = elements[counter].getAttribute("data-frequency"); 
              var cycleDurationInSeconds = getStimulusCycleDuration(screenRefreshRate, frequencyToSet).toString();
        
              var cycleDurationString = cycleDurationInSeconds.concat(seconds, keyframeName, animationType);

              elements[counter].style.animation = cycleDurationString; 
          }
      }
}; 



