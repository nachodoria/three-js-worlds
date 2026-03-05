import './style.css'
import * as THREE from 'three'
import { renderer, camera, controls } from './core/renderer.js'
import * as Galaxy from './scenes/galaxy.js'
import * as Sea from './scenes/sea.js'
import * as Portal from './scenes/portal.js'

// ─────────────────────────────────────────
// INIT SCENES
// ─────────────────────────────────────────
Galaxy.generate()
Sea.generate()
Portal.generate()

// ─────────────────────────────────────────
// SCENE REGISTRY
// ─────────────────────────────────────────
const btnGalaxy = document.getElementById('btn-galaxy')
const btnSea = document.getElementById('btn-sea')
const btnPortal = document.getElementById('btn-portal')
const overlay = document.getElementById('overlay')
const sceneLabel = document.getElementById('scene-label')

const SCENES = {
  galaxy: {
    label: '// Galaxy Generator',
    btn: btnGalaxy,
    scene: Galaxy.scene,
    gui: Galaxy.gui,
    camPos: new THREE.Vector3(3, 3, 3),
    controlsConfig: { maxPolarAngle: Math.PI, minPolarAngle: 0, enablePan: false },
    clearColor: null,            // use default dark bg
    update: Galaxy.update,
  },
  sea: {
    label: '// Raging Sea',
    btn: btnSea,
    scene: Sea.scene,
    gui: Sea.gui,
    camPos: new THREE.Vector3(1, 1, 1),
    controlsConfig: { maxPolarAngle: Math.PI / 2 - 0.2, minPolarAngle: 0.1, enablePan: false },
    clearColor: null,
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
    update: Portal.update,
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

    // Set scene-specific clear color
    renderer.setClearColor(cfg.clearColor || DEFAULT_CLEAR)

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
btnSea.addEventListener('click', () => switchTo('sea'))
btnPortal.addEventListener('click', () => switchTo('portal'))

window.addEventListener('keydown', (e) => {
  if (e.key === '1') switchTo('galaxy')
  if (e.key === '2') switchTo('sea')
  if (e.key === '3') switchTo('portal')
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
