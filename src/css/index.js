import * as approximation from './approximation/index.js'
import * as periodic from './periodic/index.js'

const methods = {
    approximation,
    periodic
}

export function start(method="periodic", elements, screenRefreshRate) {
    if (!(method in methods)) console.error('Method not available for CSS')
    else methods[method].start(elements, screenRefreshRate)
        
}