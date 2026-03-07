import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import { renderer } from '../core/renderer.js'
import boatVertexShader from '../shaders/boat/vertex.glsl'
import boatFragmentShader from '../shaders/boat/fragment.glsl'
import gpgpuParticlesShader from '../shaders/gpgpu/particles.glsl'

// ─────────────────────────────────────────
// GUI
// ─────────────────────────────────────────
const gui = new GUI({ width: 340, title: 'Boat Controls' })
gui.domElement.id = 'gui-boat'
gui.hide()

// ─────────────────────────────────────────
// Scene
// ─────────────────────────────────────────
const scene = new THREE.Scene()
const debugObject = {
    clearColor: '#29191f'
}

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/boat/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// ─────────────────────────────────────────
// GPGPU & Particles State
// ─────────────────────────────────────────
let gpgpu = {}
let particles = {}
let baseGeometry = {}

// ─────────────────────────────────────────
// Load Boat Model
// ─────────────────────────────────────────
gltfLoader.load(
    '/boat.glb',
    (gltf) => {
        // Find geometry
        gltf.scene.traverse((child) => {
            if (child.isMesh && !baseGeometry.instance) {
                baseGeometry.instance = child.geometry
            }
        })
        if (!baseGeometry.instance) {
            console.error('Boat model has no geometry')
            return
        }
        baseGeometry.count = baseGeometry.instance.attributes.position.count

        setupGPGPU()
        setupParticles()
        setupGUI()
    },
    undefined,
    (error) => {
        console.error('An error happened loading the boat model:', error)
    }
)

function setupGPGPU() {
    // Setup
    gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))
    gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer)

    // Base particles
    const baseParticlesTexture = gpgpu.computation.createTexture()

    for (let i = 0; i < baseGeometry.count; i++) {
        const i3 = i * 3
        const i4 = i * 4

        // Position based on geometry
        baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
        baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
        baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
        baseParticlesTexture.image.data[i4 + 3] = Math.random()
    }

    // Particles variable
    gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
    gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [gpgpu.particlesVariable])

    // Uniforms
    gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0)
    gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
    gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture)
    gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5)
    gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(2)
    gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5)

    // Init
    gpgpu.computation.init()
}

function setupParticles() {
    // Geometry
    const particlesUvArray = new Float32Array(baseGeometry.count * 2)
    const sizesArray = new Float32Array(baseGeometry.count)

    for (let y = 0; y < gpgpu.size; y++) {
        for (let x = 0; x < gpgpu.size; x++) {
            const i = (y * gpgpu.size + x)
            const i2 = i * 2

            const uvX = (x + 0.5) / gpgpu.size
            const uvY = (y + 0.5) / gpgpu.size

            particlesUvArray[i2 + 0] = uvX
            particlesUvArray[i2 + 1] = uvY

            sizesArray[i] = Math.random()
        }
    }

    particles.geometry = new THREE.BufferGeometry()
    particles.geometry.setDrawRange(0, baseGeometry.count)
    particles.geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))

    // Check if original geometry has colors
    if (baseGeometry.instance.attributes.color) {
        particles.geometry.setAttribute('aColor', baseGeometry.instance.attributes.color)
    } else {
        const colors = new Float32Array(baseGeometry.count * 3)
        for (let i = 0; i < baseGeometry.count; i++) {
            colors[i * 3 + 0] = 0.4
            colors[i * 3 + 1] = 0.8
            colors[i * 3 + 2] = 1.0
        }
        particles.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    }

    particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))

    // Material
    particles.material = new THREE.ShaderMaterial({
        vertexShader: boatVertexShader,
        fragmentShader: boatFragmentShader,
        uniforms:
        {
            uSize: new THREE.Uniform(0.07),
            uBoatScale: new THREE.Uniform(1.0),
            uResolution: new THREE.Uniform(new THREE.Vector2(window.innerWidth * Math.min(window.devicePixelRatio, 2), window.innerHeight * Math.min(window.devicePixelRatio, 2))),
            uParticlesTexture: new THREE.Uniform()
        },
        transparent: true,
        depthWrite: false
    })

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material)
    scene.add(particles.points)
}

function setupGUI() {
    gui.add(particles.material.uniforms.uSize, 'value').min(0).max(1).step(0.001).name('uSize')
    gui.add(particles.material.uniforms.uBoatScale, 'value').min(0).max(10).step(0.01).name('uBoatScale')
    gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value').min(0).max(1).step(0.001).name('Flow Influence')
    gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value').min(0).max(10).step(0.001).name('Flow Strength')
    gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value').min(0).max(1).step(0.001).name('Flow Frequency')
}

// ─────────────────────────────────────────
// Resize
// ─────────────────────────────────────────
window.addEventListener('resize', () => {
    if (particles.material) {
        particles.material.uniforms.uResolution.value.set(
            window.innerWidth * Math.min(window.devicePixelRatio, 2),
            window.innerHeight * Math.min(window.devicePixelRatio, 2)
        )
    }
})

// ─────────────────────────────────────────
// Public API
// ─────────────────────────────────────────
let previousTime = 0

export const clearColor = debugObject.clearColor

export function generate() {
    // Already loading via GLTFLoader
}

export function update(elapsedTime) {
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if (gpgpu.computation && gpgpu.particlesVariable) {
        gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime
        gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime
        gpgpu.computation.compute()
        particles.material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
    }
}

export { scene, gui }