import './style.css'
import * as THREE from 'three'
import { renderer, camera, controls } from './core/renderer.js'
import * as Galaxy from './scenes/galaxy.js'
import * as Sea from './scenes/sea.js'
import * as Portal from './scenes/portal.js'
import * as Earth from './scenes/earth.js'
import * as Boat from './scenes/boat.js'

// ─────────────────────────────────────────
// INIT SCENES
// ─────────────────────────────────────────
Galaxy.generate()
Sea.generate()
Portal.generate()
Earth.generate()
Boat.generate()

// ─────────────────────────────────────────
// SCENE REGISTRY
// ─────────────────────────────────────────
const btnGalaxy = document.getElementById('btn-galaxy')
const btnEarth = document.getElementById('btn-earth')
const btnSea = document.getElementById('btn-sea')
const btnPortal = document.getElementById('btn-portal')
const btnBoat = document.getElementById('btn-boat')
const overlay = document.getElementById('overlay')
const sceneLabel = document.getElementById('scene-label')

const SCENES = {
  galaxy: {
    label: '// Galaxy Generator',
    btn: btnGalaxy,
    scene: Galaxy.scene,
    gui: Galaxy.gui,
    camPos: new THREE.Vector3(5, 2, 5),
    controlsConfig: { maxPolarAngle: Math.PI, minPolarAngle: 0, enablePan: false },
    clearColor: null,            // use default dark bg
    toneMapping: THREE.NoToneMapping,
    update: Galaxy.update,
  },
  earth: {
    label: '// Digital Earth',
    btn: btnEarth,
    scene: Earth.scene,
    gui: Earth.gui,
    camPos: new THREE.Vector3(6, 2, 3),
    controlsConfig: { maxPolarAngle: Math.PI, minPolarAngle: 0, enablePan: false },
    clearColor: '#000011',
    toneMapping: THREE.NoToneMapping,
    update: Earth.update,
  },
  sea: {
    label: '// Raging Sea',
    btn: btnSea,
    scene: Sea.scene,
    gui: Sea.gui,
    camPos: new THREE.Vector3(2.5, 0.8, 2.5),
    controlsConfig: { maxPolarAngle: Math.PI / 2 - 0.2, minPolarAngle: 0.1, enablePan: false },
    clearColor: null,
    toneMapping: THREE.ACESFilmicToneMapping,
    update: Sea.update,
  },
  portal: {
    label: '// Portal Scene',
    btn: btnPortal,
    scene: Portal.scene,
    gui: Portal.gui,
    camPos: new THREE.Vector3(-3, 2.5, -3),
    controlsConfig: { maxPolarAngle: Math.PI / 2 - 0.2, minPolarAngle: 0.1, enablePan: false },
    clearColor: Portal.clearColor,
    toneMapping: THREE.NoToneMapping,
    update: Portal.update,
  },
  boat: {
    label: '// GPGPU Boat',
    btn: btnBoat,
    scene: Boat.scene,
    gui: Boat.gui,
    camPos: new THREE.Vector3(4.5, 4, 11),
    controlsConfig: { maxPolarAngle: Math.PI / 2 - 0.2, minPolarAngle: 0.1, enablePan: false },
    clearColor: Boat.clearColor,
    toneMapping: THREE.NoToneMapping,
    update: Boat.update,
  },
}

const DEFAULT_CLEAR = '#04040a'

let currentKey = 'galaxy'
let activeScene = SCENES.galaxy.scene

// Show galaxy GUI on initial load
Galaxy.gui.show()

// ─────────────────────────────────────────
// SCENE SWITCHING
// ─────────────────────────────────────────
function switchTo(key) {
  if (key === currentKey) return
  currentKey = key
  const cfg = SCENES[key]

  overlay.classList.add('flash')

  setTimeout(() => {
    activeScene = cfg.scene
    sceneLabel.textContent = cfg.label
    camera.position.copy(cfg.camPos)
    controls.target.set(0, 0, 0)
    camera.lookAt(0, 0, 0)
    controls.maxPolarAngle = cfg.controlsConfig.maxPolarAngle
    controls.minPolarAngle = cfg.controlsConfig.minPolarAngle
    controls.update()

    // Set scene-specific clear color and tone mapping
    renderer.setClearColor(cfg.clearColor || DEFAULT_CLEAR)
    if (renderer.toneMapping !== cfg.toneMapping) {
      renderer.toneMapping = cfg.toneMapping
renderer.toneMappingExposure = 1
      cfg.scene.traverse((child) => {
        if (child.material) {
          child.material.needsUpdate = true
        }
      })
    }

    // Update button states
    Object.values(SCENES).forEach((c) => c.btn.classList.remove('active'))
    cfg.btn.classList.add('active')

    // Hide all GUIs, then show the active scene's GUI
    Object.values(SCENES).forEach((c) => c.gui.hide())
    cfg.gui.show()

    overlay.classList.remove('flash')
  }, 450)
}

btnGalaxy.addEventListener('click', () => switchTo('galaxy'))
btnEarth.addEventListener('click', () => switchTo('earth'))
btnSea.addEventListener('click', () => switchTo('sea'))
btnPortal.addEventListener('click', () => switchTo('portal'))
btnBoat.addEventListener('click', () => switchTo('boat'))

window.addEventListener('keydown', (e) => {
  if (e.key === '1') switchTo('galaxy')
  if (e.key === '2') switchTo('earth')
  if (e.key === '3') switchTo('sea')
  if (e.key === '4') switchTo('portal')
  if (e.key === '5') switchTo('boat')
})

// ─────────────────────────────────────────
// RENDER LOOP
// ─────────────────────────────────────────
const clock = new THREE.Clock()

function tick() {
  const elapsed = clock.getElapsedTime()

  SCENES[currentKey].update(elapsed)

  controls.update()
  renderer.render(activeScene, camera)
  requestAnimationFrame(tick)
}

tick()
