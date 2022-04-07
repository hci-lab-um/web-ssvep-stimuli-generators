# SSVEP Stimuli-Generator Libraries

CSS and WebGL were adopted to implement four cross-platform Steady State Visually Evoked Potential (SSVEP) stimuli-generator libraries, whose stimuli are produced via constant-period and square wave approximation techniques, for use in a Brain-Computer Interface (BCI) context. These libraries are configured to run as spellers, yet can easily be altered to cater for a wide range of use cases.

More information about these libraries can be found in this peer reviewed publication by the same authors: [Towards Accurate Browser-based SSVEP Stimuli Generation](https://www.scitepress.org/Papers/2020/101594/pdf/index.html).

In alignment with [existing documentation](https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance), it was found that CSS animations are more stable and performant than their WebGL counterparts.

## Generating on-page stimuli
There are 4 stimuli generators in this repository, `CSS+Square Wave Approximation`, `CSS+Constant Period`, `WebGL+Square Wave Approximation` and `WebGL+Constant Period`.

After importing the library, you can create any number of stimuli on the page using the following `data-*` attributes:

1. `data-frequency`: specifying the SSVEP stimulus frequency
2. `data-light-color`: specifying the color of the SSVEP stimulus (N.B. `data-dark-color` currently defaults to `transparent`) **in RGBA format** (e.g. `1,1,1,1` for white)
3. `data-phase-shift`: specifying the phase shift (frames delay) for the SSVEP stimulus

Stimuli can be defined as follows:

```html
   <button data-frequency="6.67" data-dark-color="0,0,0,1" data-light-color="1,1,1,1" data-phase-shift="0">Content</button>
   <button data-frequency="7" data-dark-color="0,0,0,1" data-light-color="1,1,1,1" data-phase-shift="0">Content</button>
   <button data-frequency="8.57" data-dark-color="0,0,0,1" data-light-color="1,1,1,1" data-phase-shift="0">Content</button>
```

### Begin Stimuli Generation
To begin stimuli generation, you must select your HTML elements and add to the manager
```html
<script type="module">

  import * as stimuli from "./src/index.js"

   const elements = document.querySelectorAll('button')

   // ----------- CSS Methods -----------
   const manager = new stimuli.CSS('periodic', elements)
   // const manager = new stimuli.CSS('approximation', elements)

   // ----------- WebGL Methods -----------
   // const canvas = document.body.querySelector('canvas')
   // const manager = new stimuli.WebGL('periodic', elements, canvas)
   // const manager = new stimuli.WebGL('approximation', elements, canvas)

   elements.forEach(el => manager.set(el)) // Add Elements
   manager.start() // Start Stimuli Generation

</script>
```

You can add more stimuli (CSS manager only) by passing one or more elements to the `start()` method:

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

Or stop a subset by passing one or more elements as the first argument (CSS manager only):

``` javascript
  manager.stop(document.getElementById('new_element'))
//  manager.stop(document.body.querySelectorAll('.other'))
```

## Roadmap
- Add and remove single elements.
- Add and remove elements based on visibility in the window.
- Position WebGL Canvas behind arbitrary elements across an entire a webpage *with scrolling*.
- Dynamically change the frequency values applied to an element
   - Automatically assign to allow for maximum discriminability
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
