import * as THREE from 'three'
import GUI from 'lil-gui'

// ─────────────────────────────────────────
// GUI (created hidden by default)
// ─────────────────────────────────────────
const gui = new GUI({ width: 400, title: 'Galaxy Controls' })
gui.domElement.id = 'gui-galaxy'
gui.hide()

// ─────────────────────────────────────────
// Scene
// ─────────────────────────────────────────
const scene = new THREE.Scene()

// ─────────────────────────────────────────
// Galaxy parameters
// ─────────────────────────────────────────
const parameters = {}
parameters.count = 100000
parameters.size = 0.002
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomnessPower = 3
parameters.randomness = 0.2
parameters.insideColor = '#172bc2'
parameters.outsideColor = '#ba1ee6'

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
  // Destroy old galaxy
  if (points !== null) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }

  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)
  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3
    const radius = Math.random() * parameters.radius
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
    const spinAngle = radius * parameters.spin
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
    positions[i3 + 1] = randomY
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

    const mixedColor = colorInside.clone()
    mixedColor.lerp(colorOutside, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  material = new THREE.PointsMaterial({
    size: parameters.size,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)
}

// ─────────────────────────────────────────
// GUI Controls
// ─────────────────────────────────────────
gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(0.5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

// ─────────────────────────────────────────
// Public API
// ─────────────────────────────────────────
function generate() {
  generateGalaxy()
}

function update(elapsed) {
  if (points) {
    points.rotation.y = elapsed * 0.1
  }
}

export { scene, gui, generate, update }