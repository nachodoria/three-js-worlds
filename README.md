# THREE.JS WORLDS

An interactive WebGL showcase built with Three.js — featuring two immersive scenes you can switch between in real-time.

## Scenes

| Key | Scene | Description |
|-----|-------|-------------|
| `1` | **Galaxy Generator** | 100k particle spiral galaxy with additive blending |
| `2` | **Raging Sea** | Animated ocean using custom GLSL Perlin noise shaders |

**Controls:** Drag to orbit · Scroll to zoom

---

## Project Structure

```
threejs-worlds/
├── index.html                  # Entry point
├── vite.config.js              # Vite bundler config
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.js                 # App bootstrap, scene switcher, render loop
    ├── style.css               # Global styles & HUD
    ├── core/
    │   └── renderer.js         # WebGLRenderer, camera, OrbitControls
    ├── scenes/
    │   ├── galaxy.js           # Galaxy scene (geometry, particles, update)
    │   └── sea.js              # Sea scene (ShaderMaterial, update)
    └── shaders/
        └── water/
            ├── vertex.glsl     # Perlin noise + wave displacement
            └── fragment.glsl   # Depth/surface color mix
```

## Getting Started

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build
```

## Vercel Deployment

This project is configured to automatically deploy to Vercel. Simply push your changes to GitHub and connect the repository to a new Vercel project. Vercel will automatically detect the Vite build settings and run `npm run build` using the provided `vercel.json` configuration file.

## Tech Stack

- [Three.js](https://threejs.org/) r160
- [Vite](https://vitejs.dev/) 7 — dev server & bundler
- Custom GLSL shaders (Perlin noise, wave displacement)
