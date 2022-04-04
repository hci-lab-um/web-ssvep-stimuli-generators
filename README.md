# SSVEP Stimuli-Generator Libraries

CSS and WebGL were adopted to implement four cross-platform Steady State Visually Evoked Potential (SSVEP) stimuli-generator libraries, whose stimuli are produced via constant-period and square wave approximation techniques, for use in a Brain-Computer Interface (BCI) context. These libraries are configured to run as spellers, yet can easily be altered to cater for a wide range of use cases.

These libraries were developed by Alison Camilleri to fulfill part of the requirements for the award of a Master of Science in Computer Information Systems degree.

## Usage
To run a specific library, the stimulator's files must be served locally, e.g. using Microsoft Internet Information Services (IIS). ```http://localhost``` should be used as the first part of the web address to launch the library's relevant HTML file within the browser.

## Generating on-page stimuli

``` 
   <button type="button" id="button1" data-frequency="6.67" data-dark-color="black" data-light-color="white" data-phase-shift="0">Content</button>
   <button type="button" id="button2" data-frequency="7" data-dark-color="black" data-light-color="white" data-phase-shift="0">Content</button>
   <button type="button" id="button3" data-frequency="8.57" data-dark-color="black" data-light-color="white" data-phase-shift="0">Content</button>
```
