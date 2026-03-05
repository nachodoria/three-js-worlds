import * as THREE from 'three'
import GUI from 'lil-gui'
import waterVertexShader from '../shaders/water/vertex.glsl'
import waterFragmentShader from '../shaders/water/fragment.glsl'

// ─────────────────────────────────────────
// GUI (created hidden by default)
// ─────────────────────────────────────────
const gui = new GUI({ width: 340, title: 'Sea Controls' })
gui.domElement.id = 'gui-sea'
gui.hide()

// ─────────────────────────────────────────
// Scene
// ─────────────────────────────────────────
const scene = new THREE.Scene()

// ─────────────────────────────────────────
// Debug object for color pickers
// ─────────────────────────────────────────
const debugObject = {}
debugObject.depthColor = '#ff4000'
debugObject.surfaceColor = '#171921'

// ─────────────────────────────────────────
// Water
// ─────────────────────────────────────────
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)
waterGeometry.deleteAttribute('normal')

const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms:
  {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },

    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.925 },
    uColorMultiplier: { value: 1 }

  }
})

const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI * 0.5
scene.add(water)

// ─────────────────────────────────────────
// GUI Controls
// ─────────────────────────────────────────
gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })
gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')
gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')
gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations')

// ─────────────────────────────────────────
// Public API
// ─────────────────────────────────────────
function generate() {
  // Sea is ready at import time, nothing extra to generate
}

function update(elapsed) {
  waterMaterial.uniforms.uTime.value = elapsed
}

export { scene, gui, generate, update }