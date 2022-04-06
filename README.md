# SSVEP Stimuli-Generator Libraries

CSS and WebGL were adopted to implement four cross-platform Steady State Visually Evoked Potential (SSVEP) stimuli-generator libraries, whose stimuli are produced via constant-period and square wave approximation techniques, for use in a Brain-Computer Interface (BCI) context. These libraries are configured to run as spellers, yet can easily be altered to cater for a wide range of use cases.

More information about these libraries can be found in this peer reviewed publication by the same authors: [Towards Accurate Browser-based SSVEP Stimuli Generation](https://www.scitepress.org/Papers/2020/101594/pdf/index.html).

## Usage
To run a specific library, the stimulator's files must be served locally, e.g. using Microsoft Internet Information Services (IIS). ```http://localhost``` should be used as the first part of the web address to launch the library's relevant HTML file within the browser.

## Generating on-page stimuli

There are 4 stimuli generators in this repository, `CSS+Square Wave Approximation`, `CSS+Constant Period`, `WebGL+Square Wave Approximation` and `WebGL+Constant Period`.

After importing the respective script into your HTML document, you can create any number of stimuli on the page using the following `data-*` attributes:

1. `data-frequency`: specifying the SSVEP stimulus frequency
2. `data-light-color`: specifying the color of the SSVEP stimulus (N.B. `data-dark-color` currently defaults to `transparent`) **in RGBA format** (e.g. `1,1,1,1` for white)
3. `data-phase-shift`: specifying the phase shift (frames delay) for the SSVEP stimulus

Stimuli can be defined as follows:

```html
   <button data-frequency="6.67" data-dark-color="0,0,0,1" data-light-color="1,1,1,1" data-phase-shift="0">Content</button>
   <button data-frequency="7" data-dark-color="0,0,0,1" data-light-color="1,1,1,1" data-phase-shift="0">Content</button>
   <button data-frequency="8.57" data-dark-color="0,0,0,1" data-light-color="1,1,1,1" data-phase-shift="0">Content</button>
```

You can then select your HTML elements from the page and begin using them as stimuli:
```html
<script type="module">

  import * as stimuli from "./src/index.js"

   const elements = document.querySelectorAll('button')

// ----------- CSS Methods -----------
  stimuli.css.start('periodic', elements)
//   ssvep.css.start('approximation', elements, attributes)

// ----------- WebGL Methods -----------
// Note: Requires a third option parameter with a canvas (HTML Canvas) key / value pair

// const canvas = document.body.querySelector('canvas')
//   ssvep.webgl.start('periodic', elements, attributes, {canvas})
//   ssvep.webgl.start('approximation', elements, attributes, {canvas})

</script>
```

Optionally, you may also define more key / value pairs in the `options` argument that can control the calculation of screen refresh rate:

``` javascript
const options = {
  canvas, // An HTML Canvas element (for WebGL methods)
  samples: 100, // For calculation of refresh rate
}

```

## Roadmap
- Position WebGL Canvas behind arbitrary elements across an entire a webpage *with scrolling*.
- Add stop command
- Implement CSS data-dark-color attribute changes

## Acknowledgments
These libraries were developed by [Alison Camilleri](https://github.com/alison-camilleri) to fulfill part of the requirements for the award of a Master of Science in Computer Information Systems degree.

### Supervisory Team
####  [Dr Chris Porter](https://www.um.edu.mt/profile/chrisporter)
Department of Computer Information Systems, Faculty of ICT

####  [Dr Tracey Camilleri](https://www.um.edu.mt/profile/traceycamilleri)
Department of Systems & Control Engineering, Faculty of Engineering

### Other Contributors
#### [Garrett Flynn](https://github.com/garrettmflynn)
Founding Partner at [Brains@Play](https://github.com/brainsatplay) 
  - Refactored the libraries for publication (April 2022)
