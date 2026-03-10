import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import GUI from 'lil-gui'
import terrainVertexShader from '../shaders/terrain/vertex.glsl'
import terrainFragmentShader from '../shaders/terrain/fragment.glsl'

const gui = new GUI({ width: 340, title: 'Terrain Controls' })
gui.domElement.id = 'gui-terrain'
gui.hide()

const scene = new THREE.Scene()
const rgbeLoader = new RGBELoader()

const debugObject = {
  clearColor: '#88b6ff',
  colorWaterDeep: '#002b3d',
  colorWaterSurface: '#66a8ff',
  colorSand: '#ffe894',
  colorGrass: '#85d534',
  colorSnow: '#ffffff',
  colorRock: '#bfbd8d',
}

rgbeLoader.load('/spruit_sunrise.hdr', (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = environmentMap
  scene.backgroundBlurriness = 0.5
  scene.environment = environmentMap
})

const terrainGeometry = new THREE.PlaneGeometry(10, 10, 500, 500)
terrainGeometry.deleteAttribute('uv')
terrainGeometry.deleteAttribute('normal')
terrainGeometry.rotateX(-Math.PI * 0.5)

const uniforms = {
  uTime: new THREE.Uniform(0),
  uPositionFrequency: new THREE.Uniform(0.2),
  uStrength: new THREE.Uniform(2),
  uWarpFrequency: new THREE.Uniform(5),
  uWarpStrength: new THREE.Uniform(0.5),
  uColorWaterDeep: new THREE.Uniform(new THREE.Color(debugObject.colorWaterDeep)),
  uColorWaterSurface: new THREE.Uniform(new THREE.Color(debugObject.colorWaterSurface)),
  uColorSand: new THREE.Uniform(new THREE.Color(debugObject.colorSand)),
  uColorGrass: new THREE.Uniform(new THREE.Color(debugObject.colorGrass)),
  uColorSnow: new THREE.Uniform(new THREE.Color(debugObject.colorSnow)),
  uColorRock: new THREE.Uniform(new THREE.Color(debugObject.colorRock)),
}

gui.add(uniforms.uPositionFrequency, 'value', 0, 1, 0.001).name('uPositionFrequency')
gui.add(uniforms.uStrength, 'value', 0, 10, 0.001).name('uStrength')
gui.add(uniforms.uWarpFrequency, 'value', 0, 10, 0.001).name('uWarpFrequency')
gui.add(uniforms.uWarpStrength, 'value', 0, 1, 0.001).name('uWarpStrength')
gui.addColor(debugObject, 'colorWaterDeep').name('Deep Water').onChange(() => uniforms.uColorWaterDeep.value.set(debugObject.colorWaterDeep))
gui.addColor(debugObject, 'colorWaterSurface').name('Surface Water').onChange(() => uniforms.uColorWaterSurface.value.set(debugObject.colorWaterSurface))
gui.addColor(debugObject, 'colorSand').name('Sand').onChange(() => uniforms.uColorSand.value.set(debugObject.colorSand))
gui.addColor(debugObject, 'colorGrass').name('Grass').onChange(() => uniforms.uColorGrass.value.set(debugObject.colorGrass))
gui.addColor(debugObject, 'colorSnow').name('Snow').onChange(() => uniforms.uColorSnow.value.set(debugObject.colorSnow))
gui.addColor(debugObject, 'colorRock').name('Rock').onChange(() => uniforms.uColorRock.value.set(debugObject.colorRock))

const terrainMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
  uniforms,
  metalness: 0,
  roughness: 0.5,
  color: debugObject.colorGrass,
})

const terrainDepthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader: terrainVertexShader,
  uniforms,
  depthPacking: THREE.RGBADepthPacking,
})

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial)
terrain.customDepthMaterial = terrainDepthMaterial
terrain.castShadow = true
terrain.receiveShadow = true
scene.add(terrain)

const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11))
const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10))
const boardEvaluator = new Evaluator()
const board = boardEvaluator.evaluate(boardFill, boardHole, SUBTRACTION)
board.geometry.clearGroups()
board.material = new THREE.MeshStandardMaterial({
  color: '#f5f5f3',
  metalness: 0,
  roughness: 0.3,
})
board.castShadow = true
board.receiveShadow = true
scene.add(board)

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 1, 1),
  new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.3,
  }),
)
water.rotation.x = -Math.PI * 0.5
water.position.y = -0.1
water.receiveShadow = true
scene.add(water)

const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

function generate() {
  // Terrain is fully created on import.
}

function update(elapsedTime) {
  uniforms.uTime.value = elapsedTime
}

const clearColor = debugObject.clearColor

export { scene, gui, generate, update, clearColor }
