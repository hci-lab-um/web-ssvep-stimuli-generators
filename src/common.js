export const calculateCycleDurationInSeconds = frequency => 1 / frequency; 


export const getRefreshRateReadings = async (bufferSize = 10, samples = 300) => {

    var rafTimestamps = [], refreshRates = [];

    return new Promise(resolve => {

      const run = (now) => {
          rafTimestamps.unshift(now); // place current timestamp (passed each time requestAnimationFrame is invoked) at the start of the array
    
          if (rafTimestamps.length > bufferSize) { // once 'timestamps' array contains 11 elements
      
              var firstTime = rafTimestamps.pop();
              var refreshRate = 1000 * bufferSize / (now - firstTime);
              refreshRates.unshift(refreshRate);
          
              if (refreshRates.length == samples) {
                  cancelAnimationFrame(id);
                  resolve(refreshRates)
                  return;
              }
          }
          
          var id = window.requestAnimationFrame(run);
      }

        var id = window.requestAnimationFrame(run);
    })

};

export const calculateRefreshRate = async (bufferSize=10, samples=300) => {

    const refreshRates = await getRefreshRateReadings(bufferSize, samples)

    var refreshRateCount = {}, maxCount = [];
  
    for (var i = 0; i < refreshRates.length; i++) {
  
      if (!refreshRateCount[refreshRates[i]])
        refreshRateCount[refreshRates[i]] = 0;
  
      refreshRateCount[refreshRates[i]] += 1;
    }
  
    maxCount = Object.keys(refreshRateCount).map(Number).filter(r => refreshRateCount[r] == Math.max.apply(null, Object.values(refreshRateCount))); //may contain list of strings

    if (maxCount.length > 1) maxCount = [maxCount.reduce((a, b) => a + b) / maxCount.length];
  
    return maxCount.shift().toFixed(7)  
}
  