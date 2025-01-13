"use strict";

// off screen canvases
var lightOffScreenCanvas = document.createElement("canvas");
var glLight = lightOffScreenCanvas.getContext("webgl", { alpha: false });
lightOffScreenCanvas.width = 10, lightOffScreenCanvas.height = 10;

var darkOffScreenCanvas = document.createElement("canvas");
var glDark = darkOffScreenCanvas.getContext("webgl", { alpha: false });
darkOffScreenCanvas.width = 10, darkOffScreenCanvas.height = 10;


// webgl - vertex shader
export const vertex =
	'attribute vec2 a_position;' +
	'attribute vec2 a_texCoord;' +
	'varying vec2 v_texCoord;' +
	'void main() { gl_Position = vec4(a_position, 0, 1); v_texCoord = a_texCoord; }';

// webgl - fragment shader
export const fragment =
	'precision mediump float;' +
	'uniform sampler2D u_image;' +
	'varying vec2 v_texCoord;' +
	'void main() { gl_FragColor = texture2D(u_image, v_texCoord); }';

// (x, y) co-ordinate pairs, which serve to fill the entire on-screen canvas
const stimulusCoords = new Float32Array([-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]);

const isPowerOfTwo = dimension => (Math.log(dimension) / Math.log(2)) % 1 === 0;

export function setUpOffScreenCanvases(darkColour, lightColour) {
	glDark.clearColor(darkColour[0], darkColour[1], darkColour[2], darkColour[3]);
	glDark.clear(glDark.COLOR_BUFFER_BIT);

	glLight.clearColor(lightColour[0], lightColour[1], lightColour[2], lightColour[3]);
	glLight.clear(glLight.COLOR_BUFFER_BIT);

	return { darkOffScreenCanvas: darkOffScreenCanvas, lightOffScreenCanvas: lightOffScreenCanvas };
}

export function createShaderProgram(gl, vShaderString, fShaderString) {

	// create the shader program
	var shaderProgram = gl.createProgram();

	var vertexShader = createShader(gl, vShaderString, gl.VERTEX_SHADER);
	var fragmentShader = createShader(gl, fShaderString, gl.FRAGMENT_SHADER);

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	// program is linked to the attached vertex + fragment shaders
	gl.linkProgram(shaderProgram);

	// check program's linking status
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
		throw gl.getProgramInfoLog(shaderProgram);

	return shaderProgram;
}

function createShader(gl, shaderString, shaderType) {

	// create shader
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderString);
	gl.compileShader(shader);

	// check shader's compilation status
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		throw gl.getShaderInfoLog(shader);

	return shader;
}

export function setUpBuffer(gl) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, stimulusCoords, gl.STATIC_DRAW);

	return buffer;
}

export function setUpTexture(gl, offScreenCanvas) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offScreenCanvas);

	// handling for instances when the offScreenCanvas's width & height are not a power of 2
	if (!isPowerOfTwo(offScreenCanvas.width) || !isPowerOfTwo(offScreenCanvas.height)) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	}

	return texture;
}

function createChequeredTexture(gl, renderingInfo, flicker) {
	const textureSize = 256; // Size of the texture (width and height must be powers of two)
	const checkerSize = 128;  // Size of each checker square

	// Create a new texture
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Generate checkerboard pattern data
	const imageData = new Uint8Array(textureSize * textureSize * 4); // RGBA format
	for (let y = 0; y < textureSize; y++) {
		for (let x = 0; x < textureSize; x++) {
			const index = (y * textureSize + x) * 4;
			// Determine if the current pixel is in a black or white square
			const isWhite = ((Math.floor(x / checkerSize) + Math.floor(y / checkerSize)) % 2) === 0;
			const color = flicker
				? (isWhite ? 255 : 0) // Normal black and white
				: (isWhite ? 0 : 255); // Swapped black and white
			imageData[index] = color;       // Red channel
			imageData[index + 1] = color;   // Green channel
			imageData[index + 2] = color;   // Blue channel
			imageData[index + 3] = 255;     // Alpha channel
		}
	}

	// Upload the checkerboard pattern to the texture
	gl.texImage2D(
		gl.TEXTURE_2D,     // Target
		0,                 // Level of detail
		gl.RGBA,           // Internal format
		textureSize,       // Width
		textureSize,       // Height
		0,                 // Border
		gl.RGBA,           // Format
		gl.UNSIGNED_BYTE,  // Data type
		imageData          // Pixel data
	);

	// Set texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	return texture;
}

function createDotTexture(gl, renderingInfo) {
	// Create and set up the dot pattern texture
	const dotCanvas = document.createElement('canvas');
	dotCanvas.width = 10;
	dotCanvas.height = 10;
	const ctx = dotCanvas.getContext('2d');

	// Draw dot pattern
	ctx.fillStyle = `rgba(${renderingInfo.dark})`;
	ctx.fillRect(0, 0, 10, 10);
	ctx.fillStyle = `rgba(${renderingInfo.light})`;
	ctx.beginPath();
	ctx.arc(5, 5, 3, 0, 2 * Math.PI);
	ctx.fill();

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dotCanvas);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	return texture;
}

export function setStimulusColour(gl, renderingInfo) {

	resizeCanvasToDisplaySize(gl.canvas);
	gl.enable(gl.SCISSOR_TEST);

	gl.canvas.style.transform = `translateY(${window.scrollY}px)`;

	const divElement = renderingInfo.element.getBoundingClientRect();

	const width = divElement.right - divElement.left;
	const height = divElement.bottom - divElement.top;
	const left = divElement.left;
	const bottom = gl.canvas.clientHeight - divElement.bottom - 1;

	gl.viewport(left, bottom, width, height);
	gl.scissor(left, bottom, width, height);

	gl.clear(gl.COLOR_BUFFER_BIT);

	// Determine the pattern type and set the appropriate texture
	switch (renderingInfo.pattern) {
		case 'solid':
			gl.bindTexture(gl.TEXTURE_2D, renderingInfo.texture);
			break;
		case 'chequered':
			// Set up chequered pattern texture
			let chequeredTexture;

			if (renderingInfo.flicker == true) {
				chequeredTexture = createChequeredTexture(gl, renderingInfo, true);
			} else {
				chequeredTexture = createChequeredTexture(gl, renderingInfo, false);
			}
			gl.bindTexture(gl.TEXTURE_2D, chequeredTexture);
			break;
		case 'dot':
			// Set up dot pattern texture
			const dotTexture = createDotTexture(gl, renderingInfo);
			gl.bindTexture(gl.TEXTURE_2D, dotTexture);
			break;
		default:
			gl.bindTexture(gl.TEXTURE_2D, renderingInfo.texture);
			break;
	}
	gl.enableVertexAttribArray(renderingInfo.texCoordLoc);

	gl.bindBuffer(gl.ARRAY_BUFFER, renderingInfo.coordBuffer);
	gl.vertexAttribPointer(renderingInfo.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // to draw 4 vertices
}

function resizeCanvasToDisplaySize(canvas) {
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
}