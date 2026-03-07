import * as THREE from 'three'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from '../shaders/portal/flies/vertex.glsl?raw'
import firefliesFragmentShader from '../shaders/portal/flies/fragment.glsl?raw'
import portalVertexShader from '../shaders/portal/portal/vertex.glsl?raw'
import portalFragmentShader from '../shaders/portal/portal/fragment.glsl?raw'

// ─────────────────────────────────────────
// GUI (created hidden by default)
// ─────────────────────────────────────────
const gui = new GUI({ width: 400, title: 'Portal Controls' })
gui.domElement.id = 'gui-portal'
gui.hide()

// ─────────────────────────────────────────
// Scene
// ─────────────────────────────────────────
const scene = new THREE.Scene()
const groundGeometry = new THREE.PlaneGeometry(50, 50)
const groundMaterial = new THREE.MeshBasicMaterial({ color: '#191609' })
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI * 0.5
ground.position.y = -0.01 // placed slightly below the main model to avoid z-fighting
scene.add(ground)

// ─────────────────────────────────────────
// Debug object
// ─────────────────────────────────────────
const debugObject = {}
debugObject.clearColor = '#191609'
debugObject.portalColorStart = '#fdd635'
debugObject.portalColorEnd = '#e28e1d'
debugObject.firefliesColor = '#fdd635'

// ─────────────────────────────────────────
// Loaders
// ─────────────────────────────────────────
const textureLoader = new THREE.TextureLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/portal/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// ─────────────────────────────────────────
// Textures
// ─────────────────────────────────────────
const bakedTexture = textureLoader.load('/FinalImage.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

// ─────────────────────────────────────────
// Materials
// ─────────────────────────────────────────
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

const portalLightMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
    },
})

// ─────────────────────────────────────────
// GLTF Model
// ─────────────────────────────────────────
gltfLoader.load(
    '/portal.glb',
    (gltf) => {
        const bakeMesh = gltf.scene.children.find((child) => child.name === 'baked')
        const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight')
        const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB')

        if (bakeMesh) bakeMesh.material = bakedMaterial
        if (portalLightMesh) portalLightMesh.material = portalLightMaterial
        if (poleLightAMesh) poleLightAMesh.material = poleLightMaterial
        if (poleLightBMesh) poleLightBMesh.material = poleLightMaterial

        gltf.scene.scale.set(1, 1, 1)

        // Auto-center the model using its bounding box
        const box = new THREE.Box3().setFromObject(gltf.scene)
        const center = box.getCenter(new THREE.Vector3())
        gltf.scene.position.sub(center)
        gltf.scene.position.y -= box.min.y - center.y  // keep feet on ground
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    (error) => {
        console.log('Portal model loading error:', error)
    }
)

// ─────────────────────────────────────────
// Fireflies
// ─────────────────────────────────────────
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4
    scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))
firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))

const firefliesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 60 },
        uColor: { value: new THREE.Color(debugObject.firefliesColor) },
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
})

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

// ─────────────────────────────────────────
// GUI Controls
// ─────────────────────────────────────────
gui.addColor(debugObject, 'portalColorStart').name('Portal Start').onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})
gui.addColor(debugObject, 'portalColorEnd').name('Portal End').onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})
gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('Fireflies Size')
gui.addColor(debugObject, 'firefliesColor').name('Fireflies Color').onChange(() => {
    firefliesMaterial.uniforms.uColor.value.set(debugObject.firefliesColor)
})

// ─────────────────────────────────────────
// Public API
// ─────────────────────────────────────────

/** Scene-specific clear color for the renderer */
const clearColor = debugObject.clearColor

function generate() {
    // Portal loads asynchronously via GLTFLoader, nothing extra needed
}

function update(elapsed) {
    firefliesMaterial.uniforms.uTime.value = elapsed
    portalLightMaterial.uniforms.uTime.value = elapsed
}

export { scene, gui, generate, update, clearColor }
