<template>
    <canvas ref="canvasRef" class="soft-liquid-wave-background" :style="{ zIndex }"></canvas>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
    speed: {
        type: Number,
        default: 0.065,
    },
    zoom: {
        type: Number,
        default: 0.64,
    },
    waveStrength: {
        type: Number,
        default: 0.18,
    },
    softness: {
        type: Number,
        default: 0.68,
    },
    mouseStrength: {
        type: Number,
        default: 0.025,
    },
    zIndex: {
        type: [String, Number],
        default: 0,
    },

    colorA: {
        type: Array,
        default: () => [0.0, 0.0, 0.0],
    },
    colorB: {
        type: Array,
        default: () => [0.12, 0.06, 0.32],
    },
    colorC: {
        type: Array,
        default: () => [0.32, 0.15, 1.0],
    },
    colorD: {
        type: Array,
        default: () => [0.52, 0.28, 0.99],
    },
    colorE: {
        type: Array,
        default: () => [0.78, 0.48, 0.98],
    },
    colorF: {
        type: Array,
        default: () => [1.0, 0.62, 0.99],
    },
});

const canvasRef = ref(null);

let gl = null;
let program = null;
let positionBuffer = null;
let animationId = null;

let aPositionLocation = null;

let uTimeLocation = null;
let uResolutionLocation = null;
let uMouseLocation = null;
let uSpeedLocation = null;
let uZoomLocation = null;
let uWaveStrengthLocation = null;
let uSoftnessLocation = null;
let uMouseStrengthLocation = null;

let uColorALocation = null;
let uColorBLocation = null;
let uColorCLocation = null;
let uColorDLocation = null;
let uColorELocation = null;
let uColorFLocation = null;

const mouse = {
    x: 0.5,
    y: 0.5,
};

const smoothMouse = {
    x: 0.5,
    y: 0.5,
};

const vertexShaderSource = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uSpeed;
uniform float uZoom;
uniform float uWaveStrength;
uniform float uSoftness;
uniform float uMouseStrength;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform vec3 uColorE;
uniform vec3 uColorF;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x)
       + (c - a) * u.y * (1.0 - u.x)
       + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;

  p.x *= uResolution.x / uResolution.y;
  p *= uZoom;

  vec2 mouse = uMouse * 2.0 - 1.0;
  mouse.x *= uResolution.x / uResolution.y;
  mouse *= uZoom;

  float time = uTime * uSpeed;
  float slowTime = time * 0.55;

  float mouseDistance = distance(p, mouse);
  float mouseField = smoothstep(1.1, 0.0, mouseDistance);

  vec2 q = p;

  float n1 = fbm(q * 0.55 + vec2(slowTime * 0.018, -slowTime * 0.014));
  float n2 = fbm(q * 0.90 + vec2(-slowTime * 0.014, slowTime * 0.012));

  q.x += sin(q.y * 1.65 + slowTime * 0.38 + n1 * 1.8) * (uWaveStrength * 0.72);
  q.y += cos(q.x * 1.05 - slowTime * 0.32 + n2 * 1.6) * (uWaveStrength * 0.52);

  q.x += sin((q.y + q.x) * 0.95 - slowTime * 0.24) * (uWaveStrength * 0.24);
  q.y += cos((q.x - q.y) * 0.85 + slowTime * 0.22) * (uWaveStrength * 0.18);

  vec2 mousePush = normalize(p - mouse + 0.0001);
  q += mousePush * mouseField * uMouseStrength;

  float largeMass = fbm(q * 0.50 + vec2(slowTime * 0.008, -slowTime * 0.006));
  float mediumMass = fbm(q * 0.85 - vec2(slowTime * 0.007, slowTime * 0.006));
  float softWaves = sin(q.x * 1.4 + q.y * 0.8 + slowTime * 0.28) * 0.5 + 0.5;
  float softWaves2 = cos(q.y * 1.1 - q.x * 0.7 - slowTime * 0.24) * 0.5 + 0.5;

  float field = largeMass * 0.42
              + mediumMass * 0.28
              + softWaves * 0.18
              + softWaves2 * 0.12;

  field = smoothstep(0.06, 0.94, field);

  float s1 = smoothstep(0.04, 0.20 + uSoftness * 0.10, field);
  float s2 = smoothstep(0.18, 0.36 + uSoftness * 0.10, field);
  float s3 = smoothstep(0.34, 0.54 + uSoftness * 0.10, field);
  float s4 = smoothstep(0.50, 0.72 + uSoftness * 0.10, field);
  float s5 = smoothstep(0.66, 0.88 + uSoftness * 0.08, field);

  vec3 color = uColorA;
  color = mix(color, uColorB, s1);
  color = mix(color, uColorC, s2 * 0.95);
  color = mix(color, uColorD, s3 * 0.90);
  color = mix(color, uColorE, s4 * 0.85);
  color = mix(color, uColorF, s5 * 0.72);

  float glossyBand = sin(q.x * 2.1 + q.y * 1.2 - slowTime * 0.34) * 0.5 + 0.5;
  glossyBand = smoothstep(0.58, 0.92, glossyBand);
  color += glossyBand * 0.025;

  float haze = fbm(q * 0.32 + vec2(slowTime * 0.004, slowTime * 0.005));
  color = mix(color, (color + uColorA) * 0.5, haze * 0.055);

  color += mouseField * 0.012;

  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Erro ao compilar shader: ${error}`);
    }

    return shader;
}

function createProgram() {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(shaderProgram);

        gl.deleteProgram(shaderProgram);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        throw new Error(`Erro ao linkar programa WebGL: ${error}`);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return shaderProgram;
}

function resizeCanvas() {
    const canvas = canvasRef.value;

    if (!canvas || !gl) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);
}

function handlePointerMove(event) {
    mouse.x = event.clientX / window.innerWidth;
    mouse.y = 1.0 - event.clientY / window.innerHeight;
}

function render(time) {
    animationId = requestAnimationFrame(render);

    if (!gl || !program || !canvasRef.value) return;

    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.025;
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.025;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.uniform1f(uTimeLocation, time * 0.001);
    gl.uniform2f(
        uResolutionLocation,
        canvasRef.value.width,
        canvasRef.value.height
    );
    gl.uniform2f(uMouseLocation, smoothMouse.x, smoothMouse.y);
    gl.uniform1f(uSpeedLocation, props.speed);
    gl.uniform1f(uZoomLocation, props.zoom);
    gl.uniform1f(uWaveStrengthLocation, props.waveStrength);
    gl.uniform1f(uSoftnessLocation, props.softness);
    gl.uniform1f(uMouseStrengthLocation, props.mouseStrength);

    gl.uniform3f(
        uColorALocation,
        props.colorA[0],
        props.colorA[1],
        props.colorA[2]
    );
    gl.uniform3f(
        uColorBLocation,
        props.colorB[0],
        props.colorB[1],
        props.colorB[2]
    );
    gl.uniform3f(
        uColorCLocation,
        props.colorC[0],
        props.colorC[1],
        props.colorC[2]
    );
    gl.uniform3f(
        uColorDLocation,
        props.colorD[0],
        props.colorD[1],
        props.colorD[2]
    );
    gl.uniform3f(
        uColorELocation,
        props.colorE[0],
        props.colorE[1],
        props.colorE[2]
    );
    gl.uniform3f(
        uColorFLocation,
        props.colorF[0],
        props.colorF[1],
        props.colorF[2]
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: true,
    });

    if (!gl) {
        console.error('WebGL não está disponível neste navegador.');
        return;
    }

    program = createProgram();

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,

        -1, 1,
        1, -1,
        1, 1,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    aPositionLocation = gl.getAttribLocation(program, 'aPosition');

    uTimeLocation = gl.getUniformLocation(program, 'uTime');
    uResolutionLocation = gl.getUniformLocation(program, 'uResolution');
    uMouseLocation = gl.getUniformLocation(program, 'uMouse');
    uSpeedLocation = gl.getUniformLocation(program, 'uSpeed');
    uZoomLocation = gl.getUniformLocation(program, 'uZoom');
    uWaveStrengthLocation = gl.getUniformLocation(program, 'uWaveStrength');
    uSoftnessLocation = gl.getUniformLocation(program, 'uSoftness');
    uMouseStrengthLocation = gl.getUniformLocation(program, 'uMouseStrength');

    uColorALocation = gl.getUniformLocation(program, 'uColorA');
    uColorBLocation = gl.getUniformLocation(program, 'uColorB');
    uColorCLocation = gl.getUniformLocation(program, 'uColorC');
    uColorDLocation = gl.getUniformLocation(program, 'uColorD');
    uColorELocation = gl.getUniformLocation(program, 'uColorE');
    uColorFLocation = gl.getUniformLocation(program, 'uColorF');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', handlePointerMove);

    animationId = requestAnimationFrame(render);
});

onBeforeUnmount(() => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('pointermove', handlePointerMove);

    if (gl && positionBuffer) {
        gl.deleteBuffer(positionBuffer);
    }

    if (gl && program) {
        gl.deleteProgram(program);
    }

    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    gl = null;
    program = null;
    positionBuffer = null;
});
</script>

<style scoped>
.soft-liquid-wave-background {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    display: block;
    background: #000000;
    pointer-events: none;
}
</style>