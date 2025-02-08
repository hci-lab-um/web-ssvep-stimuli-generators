import Decimal from './external/decimal.mjs';

export const calculateCycleDurationInSeconds = frequency => 1 / frequency;


// --------------------- Refresh Rate Helpers ---------------------
export const getRefreshRateReadings = async (bufferSize = 10, samples = 10) => {

  if (samples < 10) samples = 10 // Minimum ten samples

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

export const calculateRefreshRate = async (bufferSize = 10, samples = 10) => {

  const refreshRates = await getRefreshRateReadings(bufferSize, samples)

  var refreshRateCount = {}, maxCount = [];

  for (var i = 0; i < refreshRates.length; i++) {

    if (!refreshRateCount[refreshRates[i]])
      refreshRateCount[refreshRates[i]] = 0;

    refreshRateCount[refreshRates[i]] += 1;
  }

  maxCount = Object.keys(refreshRateCount).map(Number).filter(r => refreshRateCount[r] == Math.max.apply(null, Object.values(refreshRateCount))); //may contain list of strings

  if (maxCount.length > 1) maxCount = [maxCount.reduce((a, b) => a + b) / maxCount.length];

  const val = Number(maxCount.shift().toFixed(7))
  return val
}


// --------------------- Decimal.js Helpers ---------------------
export const period = new Decimal(2).times(Decimal.acos(-1));

export function calculateNumberOfSeconds(stimulusFrequency) {
  const maxSeconds =  20; // Reasonable upper limit (5 times the SSVEP response period (4 secs) -> 20 seconds)
  let bestNoOfSecs = null;
  let bestError = Number.MAX_VALUE;

  for (let noOfSecs = 1; noOfSecs <= maxSeconds; noOfSecs++) {
    let noOfCycles = noOfSecs * stimulusFrequency;
    let error = Math.abs(noOfCycles - Math.round(noOfCycles)); // How close it is to an integer

    if (error < 1e-6) { // Small error, meaning that it is close enough
      return noOfSecs;
    }

    // Track the closest match
    if (error < bestError) {
      bestError = error;
      bestNoOfSecs = noOfSecs;
    }
  }

  if (bestNoOfSecs !== null) {
    return bestNoOfSecs; // Return the best match
  }

  throw new Error(`Failed to calculate the required number of seconds for frequency: ${stimulusFrequency}`);
}

export function modulus(x, y) {
  var quotient = x.div(y);

  var quotientInt = new Decimal(quotient.toFixed(0));

  if ((quotient.minus(quotientInt)).div(quotientInt).abs().toNumber() < Number.EPSILON) {
    return new Decimal(0);
  }
  else {
    var n = quotient.floor();
    var temp = y.times(n);

    var signY = Math.sign(y.toNumber());
    var result = x.minus(temp);

    if (!x.equals(y) && !result.equals(0)) {
      if (Math.sign(result.toNumber()) != signY)
        result = result.abs().times(signY);
    }

    return result;
  }
}

export function generateSquareWave(timeInstant) {
  const dutyCycle = new Decimal(50),
    halfPeriod = period.times(dutyCycle.div(100));

  var modulusValue = modulus(timeInstant, period);

  return 2 * (modulusValue.toNumber() < halfPeriod.toNumber() ? 1 : 0) - 1;
}