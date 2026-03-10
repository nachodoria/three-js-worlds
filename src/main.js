import './style.css'
import * as THREE from 'three'
import { renderer, camera, controls } from './core/renderer.js'
import * as Galaxy from './scenes/galaxy.js'
import * as Sea from './scenes/sea.js'
import * as Portal from './scenes/portal.js'
import * as Earth from './scenes/earth.js'
import * as Boat from './scenes/boat.js'
import * as Terrain from './scenes/terrain.js'

// ─────────────────────────────────────────
// INIT SCENES
// ─────────────────────────────────────────
Galaxy.generate()
Sea.generate()
Portal.generate()
Earth.generate()
Boat.generate()
Terrain.generate()

// ─────────────────────────────────────────
// SCENE REGISTRY
// ─────────────────────────────────────────
const btnGalaxy = document.getElementById('btn-galaxy')
const btnEarth = document.getElementById('btn-earth')
const btnSea = document.getElementById('btn-sea')
const btnPortal = document.getElementById('btn-portal')
const btnBoat = document.getElementById('btn-boat')
const btnTerrain = document.getElementById('btn-terrain')
const overlay = document.getElementById('overlay')
const sceneLabel = document.getElementById('scene-label')

const DEFAULT_CLEAR = '#04040a'
const DEFAULT_CAMERA_FOV = 75
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)

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
  terrain: {
    label: '// Procedural Terrain',
    btn: btnTerrain,
    scene: Terrain.scene,
    gui: Terrain.gui,
    camPos: new THREE.Vector3(-10, 6, -2),
    camTarget: new THREE.Vector3(0, 0.6, 0),
    cameraFov: 35,
    controlsConfig: {
      maxPolarAngle: Math.PI / 2 - 0.05,
      minPolarAngle: 0.15,
      enablePan: false,
      minDistance: 5,
      maxDistance: 18,
    },
    clearColor: Terrain.clearColor,
    toneMapping: THREE.ACESFilmicToneMapping,
    update: Terrain.update,
  },
}

let currentKey = 'galaxy'
let activeScene = SCENES.galaxy.scene

function applySceneConfig(cfg) {
  sceneLabel.textContent = cfg.label
  camera.position.copy(cfg.camPos)
  camera.fov = cfg.cameraFov ?? DEFAULT_CAMERA_FOV
  camera.updateProjectionMatrix()
  controls.target.copy(cfg.camTarget ?? DEFAULT_TARGET)
  camera.lookAt(controls.target)
  controls.maxPolarAngle = cfg.controlsConfig.maxPolarAngle
  controls.minPolarAngle = cfg.controlsConfig.minPolarAngle
  controls.enablePan = cfg.controlsConfig.enablePan ?? false
  controls.minDistance = cfg.controlsConfig.minDistance ?? 0
  controls.maxDistance = cfg.controlsConfig.maxDistance ?? Infinity
  controls.update()

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

  Object.values(SCENES).forEach((c) => c.btn.classList.remove('active'))
  cfg.btn.classList.add('active')

  Object.values(SCENES).forEach((c) => c.gui.hide())
  cfg.gui.show()
}

applySceneConfig(SCENES[currentKey])

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
    applySceneConfig(cfg)
    overlay.classList.remove('flash')
  }, 450)
}

btnGalaxy.addEventListener('click', () => switchTo('galaxy'))
btnEarth.addEventListener('click', () => switchTo('earth'))
btnSea.addEventListener('click', () => switchTo('sea'))
btnPortal.addEventListener('click', () => switchTo('portal'))
btnBoat.addEventListener('click', () => switchTo('boat'))
btnTerrain.addEventListener('click', () => switchTo('terrain'))

window.addEventListener('keydown', (e) => {
  if (e.key === '1') switchTo('galaxy')
  if (e.key === '2') switchTo('earth')
  if (e.key === '3') switchTo('sea')
  if (e.key === '4') switchTo('portal')
  if (e.key === '5') switchTo('boat')
  if (e.key === '6') switchTo('terrain')
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
