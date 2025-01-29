# SSVEP Stimuli-Generator Libraries

CSS and WebGL were adopted to implement four cross-platform Steady State Visually Evoked Potential (SSVEP) stimuli-generator libraries, whose stimuli are produced via constant-period and square wave approximation techniques, for use in a Brain-Computer Interface (BCI) context. These libraries are configured to run as spellers, yet can easily be altered to cater for a wide range of use cases.

More information about these libraries can be found in this peer reviewed publication by the same authors: [Towards Accurate Browser-based SSVEP Stimuli Generation](https://www.scitepress.org/Papers/2020/101594/pdf/index.html).

In alignment with [existing documentation](https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance), it was found that CSS animations are more stable and performant than their WebGL counterparts.

## Generating on-page stimuli
There are 4 stimuli generators in this repository, `CSS+Square Wave Approximation`, `CSS+Constant Period`, `WebGL+Square Wave Approximation` and `WebGL+Constant Period`.

After importing the library, you can create any number of stimuli on the page using the following `data-*` attributes:

1. `data-frequency`: specifying the SSVEP stimulus frequency
2. `data-light-color`: specifying the light color of the flickering SSVEP stimulus
3. `data-dark-color`: specifying the dark color of the flickering SSVEP stimulus 
4. `data-phase-shift`: specifying the phase shift (frames delay) for the SSVEP stimulus
5. `data-pattern`: specifying the flickering button's pattern. You can choose from `solid`, `dot` or `chequered` pattern types.

### Begin Stimuli Generation
To begin stimuli generation, you must select your HTML elements and add to the manager

### 1. CSS
Stimuli can be defined as follows for CSS:

```html
   <button data-frequency="6.67" data-dark-color="0,0,0,1" data-light-color="255,255,255,1" data-phase-shift="0" data-pattern="solid">Button 1</button>
   <button data-frequency="7" data-dark-color="0,255,0,1" data-light-color="0,0,255,1" data-phase-shift="0" data-pattern="chequered">Button 2</button>
   <button data-frequency="8.57" data-dark-color="255,0,0,1" data-light-color="0,0,255,1" data-phase-shift="0" data-pattern="dot">Button 3</button>
```

```html
<script type="module">

  import * as stimuli from "./dist/index.js"

  const elements = document.querySelectorAll('button')

  // ----------- CSS Methods -----------
  const manager = new window.stimuli.CSS('approximation', elements.length)
  // const manager = new window.stimuli.CSS('periodic', elements.length)   

  elements.forEach(el => manager.set(el)) // Add Elements
  manager.start() // Start Stimuli Generation

</script>
```


### 2. WebGL
Stimuli can be defined as follows for WebGL:

```html
   <canvas id="canvas"></canvas>
   <button data-frequency="6.67" data-dark-color="0,0,0,1" data-light-color="255,255,255,1" data-phase-shift="0" data-pattern="solid">
    <span class="button-text">Button 1</span>
   </button>
   <button data-frequency="7" data-dark-color="0,255,0,1" data-light-color="0,0,255,1" data-phase-shift="0" data-pattern="chequered">
    <span class="button-text">Button 2</span>
   </button>
   <button data-frequency="8.57" data-dark-color="255,0,0,1" data-light-color="0,0,255,1" data-phase-shift="0" data-pattern="dot">
    <span class="button-text">Button 3</span>
   </button>
```

```html
<script type="module">

  import * as stimuli from "./dist/index.js"

   const elements = document.querySelectorAll('button')

   // ----------- WebGL Methods -----------
   const canvas = document.body.querySelector('canvas')
   const manager = new window.stimuli.WebGL('approximation', canvas, elements.length)
   // const manager = new window.stimuli.WebGL('periodic', canvas, elements.length) 

   elements.forEach(el => manager.set(el)) // Add Elements
   manager.start() // Start Stimuli Generation

</script>
```

```css 
/* Styling the canvas so that it fills the whole screen and the button text above the canvas */
.button-text {
    position: relative;
    z-index: 2; /* Contains a higher z-index than the canvas */   
}

#canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1; /* Contains a lower z-index than the canvas */
}
```


### Add Stimuli
You can add more stimuli by passing one or more elements to the `start()` method:

``` javascript
  manager.start(document.getElementById('new_element'))
   //  manager.start(document.body.querySelectorAll('.other'))
```

This technique also allows you to selectively start a subset of elements.

### Cancel Stimuli Generation
You can cancel all ongoing stimuli generation by calling the `stop()` method:

``` javascript
  manager.stop()
```

Or stop a subset by passing one or more elements as the first argument:

``` javascript
  manager.stop(document.getElementById('new_element'))
//  manager.stop(document.body.querySelectorAll('.other'))
```


### Node.js Example (Using CSS)
To use the SSVEP stimuli library in a Node.js project:
  1. Install via npm. Run the following command: `npm install ssvep-stimuli`.
  2. Use the following code in your JavaScript file:

```javascript 
  const stimuli = require('./dist/index.js');

  // Simulating HTML button elements for the example
  const elements = [
    { frequency: 6.67, lightColor: '255,255,255,1', darkColor: '0,0,0,1', phaseShift: 0, pattern: 'solid' },
    { frequency: 7, lightColor: '0,0,255,1', darkColor: '0,255,0,1', phaseShift: 0, pattern: 'chequered' },
    { frequency: 8.57, lightColor: '0,0,255,1', darkColor: '255,0,0,1', phaseShift: 0, pattern: 'dot' }
  ];

  const manager = new stimuli.CSS('approximation', elements.length);
  // const manager = new window.stimuli.CSS('periodic', elements.length)   

  elements.forEach(el => manager.set(el));
  manager.start();
```


### Node.js Example (Using WebGL)
To use the SSVEP stimuli library in a Node.js project:
  1. Install via npm. Run the following command: `npm install ssvep-stimuli`.
  2. Use the following code in your JavaScript file:

```javascript 
  const stimuli = require('./dist/index.js');

  // For WebGL, you would typically need to initialise a WebGL context.
  // Here, we assume you're using a package like `headless-gl` or similar.

  const { createCanvas } = require('canvas'); // Example: 'canvas' package for WebGL context in Node.js
  const canvas = createCanvas(800, 600); // Create a canvas to simulate the WebGL context

  // Simulating HTML button elements for the example
  const elements = [
    { frequency: 6.67, lightColor: '255,255,255,1', darkColor: '0,0,0,1', phaseShift: 0, pattern: 'solid' },
    { frequency: 7, lightColor: '0,0,255,1', darkColor: '0,255,0,1', phaseShift: 0, pattern: 'chequered' },
    { frequency: 8.57, lightColor: '0,0,255,1', darkColor: '255,0,0,1', phaseShift: 0, pattern: 'dot' }
  ];

  const manager = new stimuli.WebGL('approximation', canvas, elements.length);
  // const manager = new window.stimuli.WebGL('periodic', canvas, elements.length) 

  elements.forEach(el => { manager.set(el); });
  manager.start();
```


## Roadmap
- Add and remove elements based on visibility in the window.
- Dynamically change the frequency values applied to an element
   - Automatically assign for maximum discriminability.
- Position WebGL Canvas behind arbitrary elements across an entire a webpage *with scrolling*.
- Expose a way to assign your own CSS rules and/or WebGL intensities


## Known Issues
### WebGL
1. Dynamically adding elements using WebGL techniques will create too many contexts and halt execution.

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

#### [Daniel Calleja](https://github.com/daniel-calleja17) & (https://github.com/dcalleja17)
Research Support Officer on the BrainWeb Project
  - Arranged the functionality of `data-dark-color` (December 2024)
  - Implemented different pattern types for stimuli for both CSS and WebGL (January 2025)