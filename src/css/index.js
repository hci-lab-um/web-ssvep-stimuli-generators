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
    else return await methods[method].start(elements, screenRefreshRate)
}