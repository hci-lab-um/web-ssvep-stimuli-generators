# ssvep
Steady-State Visually Evoked Potentials on the Browser

 > **Note:** Will rely on the [`hightime`](https://github.com/brainsatplay/hightime) library for calculating the selection from real-time EEG data.

## Features
- [x] Robust generation of SSVEP stimuli ([ssvep-stimuli](https://npmjs.com/ssvep-stimuli))
- [ ] On-browser SSVEP selection

## Usage 
## Generating Stimuli
There are 4 stimuli generators in this repository, `CSS+Square Wave Approximation`, `CSS+Constant Period`, `WebGL+Square Wave Approximation` and `WebGL+Constant Period`.

After importing the respective script into your HTML document, you can create any number of stimuli on the page using the following `data-*` attributes:

1. `data-frequency`: specifying the SSVEP stimulus frequency
2. `data-light-color`: specifying the color of the SSVEP stimulus (N.B. `data-dark-color` currently defaults to `transparent`)
3. `data-phase-shift`: specifying the phase shift (frames delay) for the SSVEP stimulus

Stimuli can be defined as follows:

```html
   <button type="button" id="button1" data-frequency="6.67" data-dark-color="black" data-light-color="white" data-phase-shift="0">Content</button>
   <button type="button" id="button2" data-frequency="7" data-dark-color="black" data-light-color="white" data-phase-shift="0">Content</button>
   <button type="button" id="button3" data-frequency="8.57" data-dark-color="black" data-light-color="white" data-phase-shift="0">Content</button>
```

Alternatively, you may dynamically select HTML elements from a page: 
<script type="module">

   const elements = document.getElementById('buttonDiv').querySelectorAll('button')

  const attributes = [
    {frequency: 6.67, "dark-color": "black", "light-color": "white", "phase-shift": "0"}, 
    {frequency: 7, darkColor: "black", lightColor: "white", phaseShift: "0"}, 
    {frequency: 8.57, darkColor: "black", lightColor: "white", phaseShift: "0"}
  ]

  ssvep.start'css', 'periodic', elements, attributes)
//   ssvep.start'css', 'approximation', elements, attributes)
//   ssvep.start'webgl', 'periodic', elements, attributes)
//   ssvep.start'webgl', 'approximation', elements, attributes)

</script>

## Acknowledgments
### Stimuli Generation
 The [ssvep-stimuli](https://npmjs.com/ssvep-stimuli) library with [peer-reviewed SSVEP stimuli-generation functions](https://www.scitepress.org/Papers/2020/101594/pdf/index.html) using constant-period and square wave approximation techniques (CSS and WebGL) was developed by Alison Camilleri at the [University of Malta's HCI Lab](https://github.com/hci-lab-um) under the supervision of [Dr Chris Porter](https://www.um.edu.mt/profile/chrisporter) and [Dr Tracey Camilleri](https://www.um.edu.mt/profile/traceycamilleri). 
 
 This library was packaged by [Garrett Flynn](https://github.com/garrettmflynn) as part of a collaboration between [Brains@Play](https://github.com/brainsatplay) and the [University of Malta's HCI Lab](https://github.com/hci-lab-um) in April 2022.