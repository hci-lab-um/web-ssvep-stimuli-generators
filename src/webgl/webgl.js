"use strict";
import Patterns from '../patterns.js';

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

function createChequeredTexture(gl, renderingInfo, flicker, lightColor, darkColor) {
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
				? (isWhite ? lightColor : darkColor)
				: (isWhite ? darkColor : lightColor);

			// RGBA channels
			imageData[index] = color[0];       		  // Red channel
			imageData[index + 1] = color[1];   	      // Green channel
			imageData[index + 2] = color[2];   		  // Blue channel
			imageData[index + 3] = 255;               // Alpha channel
		}
	}

	// Upload the checkerboard pattern to the texture
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		textureSize,
		textureSize,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		imageData
	);

	// Set texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	return texture;
}

const textureSize = 512; // Texture dimensions (must be powers of two)
const dotCount = 750; // Total number of dots
const lineCount = 40; // Total number of lines
const buttonPositions = {}; // Dictionary to store positions for each button
const buttonIds = []; // List to store button IDs

// Function to generate random positions
function generateRandomPositions() {
	const pos = [];
	for (let i = 0; i < dotCount; i++) {
		const x = Math.random() * textureSize; // Range: [0, textureSize)
		const y = Math.random() * textureSize; // Range: [0, textureSize)
		pos.push({ x, y });
	}
	return pos;
}

function generateRandomPositionsAndAngle() {
	const pos = [];
	for (let i = 0; i < lineCount; i++) {
		const x = Math.random() * textureSize; // Range: [0, textureSize)
		const y = Math.random() * textureSize; // Range: [0, textureSize)
		const angle = Math.random() * 2 * Math.PI;
		pos.push({ x, y, angle });
	}
	return pos;
}

// Function to get positions for a specific button
function getPositionsForButton(buttonId, pattern) {
	if (!buttonPositions[buttonId]) {
		buttonPositions[buttonId] = pattern === 'line' ? generateRandomPositionsAndAngle() : generateRandomPositions();
	}
	return buttonPositions[buttonId];
}

function createDotTexture(gl, renderingInfo, flicker, lightColor, darkColor, positions) {
	const dotRadius = 8; // Radius of each dot in pixels

	// Create a new texture
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const imageData = new Uint8Array(textureSize * textureSize * 4);
	if (flicker) {
		// Create blank image data with a white background		
		for (let i = 0; i < imageData.length; i += 4) {
			imageData[i] = 255; // Red
			imageData[i + 1] = 255; // Green
			imageData[i + 2] = 255; // Blue
			imageData[i + 3] = 255; // Alpha
		}
	}
	else {
		// Helper function to draw a dot
		function drawDot(x, y, radius, color) {
			const centerX = Math.round(x);
			const centerY = Math.round(y);

			for (let offsetY = -radius; offsetY <= radius; offsetY++) {
				for (let offsetX = -radius; offsetX <= radius; offsetX++) {
					const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
					if (distance <= radius) {
						const pixelX = centerX + offsetX;
						const pixelY = centerY + offsetY;

						// Ensure the pixel is within bounds
						if (pixelX >= 0 && pixelX < textureSize && pixelY >= 0 && pixelY < textureSize) {
							const index = (pixelY * textureSize + pixelX) * 4;
							imageData[index] = color[0]; // Red
							imageData[index + 1] = color[1]; // Green
							imageData[index + 2] = color[2]; // Blue
							imageData[index + 3] = 255; // Alpha
						}
					}
				}
			}
		}

		// Draw dots using alternating colors
		positions.forEach((pos, index) => {
			const color = index < dotCount / 2 ? lightColor : darkColor;
			drawDot(pos.x, pos.y, dotRadius, color);
		});
	}
	// Upload the texture data to WebGL
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		textureSize,
		textureSize,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		imageData
	);

	// Set texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	return texture;
}

function createLineTexture(gl, renderingInfo, flicker, rodColor, bgColor, positions) {
	const lineLength = 60;
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const imageData = new Uint8Array(textureSize * textureSize * 4);

	// Set the background color
	for (let i = 0; i < imageData.length; i += 4) {
		imageData[i] = bgColor[0]; // Red
		imageData[i + 1] = bgColor[1]; // Green
		imageData[i + 2] = bgColor[2]; // Blue
		imageData[i + 3] = 255; // Alpha
	}

	// Helper function to draw a line
	function drawLine(x, y, length, color, angle, thickness = 10) {
		const centerX = Math.round(x);
		const centerY = Math.round(y);
		const halfLength = length / 2;

		for (let i = -halfLength; i <= halfLength; i++) {
			const offsetX = Math.round(i * Math.cos(angle));
			const offsetY = Math.round(i * Math.sin(angle));

			for (let t = -Math.floor(thickness / 2); t <= Math.floor(thickness / 2); t++) {
				const pixelX = centerX + offsetX + Math.round(t * Math.sin(angle));
				const pixelY = centerY + offsetY - Math.round(t * Math.cos(angle));

				// Ensure the pixel is within bounds
				if (pixelX >= 0 && pixelX < textureSize && pixelY >= 0 && pixelY < textureSize) {
					const index = (pixelY * textureSize + pixelX) * 4;
					imageData[index] = color[0]; // Red
					imageData[index + 1] = color[1]; // Green
					imageData[index + 2] = color[2]; // Blue
					imageData[index + 3] = 255; // Alpha
				}
			}
		}
	}

	if (!flicker) {
		positions.forEach((pos, index) => {
			drawLine(pos.x, pos.y, lineLength, rodColor, pos.angle);
		});
	}

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		textureSize,
		textureSize,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		imageData
	);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	return texture;
}

export function setStimulusColour(gl, renderingInfo) {
	const lightColor = renderingInfo.lightColor;
	const darkColor = renderingInfo.darkColor;

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
		case Patterns.SOLID:
			gl.bindTexture(gl.TEXTURE_2D, renderingInfo.texture);
			break;
		case Patterns.CHEQUERED:
			// Set up chequered pattern texture
			let chequeredTexture;

			if (renderingInfo.flicker == true) {
				chequeredTexture = createChequeredTexture(gl, renderingInfo, true, lightColor, darkColor);
			} else {
				chequeredTexture = createChequeredTexture(gl, renderingInfo, false, lightColor, darkColor);
			}
			gl.bindTexture(gl.TEXTURE_2D, chequeredTexture);
			break;
		case Patterns.DOT:
			// Set up dot pattern texture
			if (!buttonIds.includes(renderingInfo.element.id)) {
				buttonIds.push(renderingInfo.element.id);
				positions = generateRandomPositions();
			}
			let positions = getPositionsForButton(renderingInfo.element.id, renderingInfo.pattern);
			let dotTexture;

			if (renderingInfo.flicker == true) {
				dotTexture = createDotTexture(gl, renderingInfo, true, lightColor, darkColor, positions);
			} else {
				dotTexture = createDotTexture(gl, renderingInfo, false, lightColor, darkColor, positions);
			}
			gl.bindTexture(gl.TEXTURE_2D, dotTexture);
			break;

		case Patterns.LINE:
			// Set up line pattern texture
			if (!buttonIds.includes(renderingInfo.element.id)) {
				buttonIds.push(renderingInfo.element.id);
				positions2 = generateRandomPositionsAndAngle();
			}
			let positions2 = getPositionsForButton(renderingInfo.element.id, renderingInfo.pattern);
			let lineTexture;

			if (renderingInfo.flicker == true) {
				lineTexture = createLineTexture(gl, renderingInfo, true, lightColor, darkColor, positions2);
			} else {
				lineTexture = createLineTexture(gl, renderingInfo, false, lightColor, darkColor, positions2);
			}
			gl.bindTexture(gl.TEXTURE_2D, lineTexture);
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