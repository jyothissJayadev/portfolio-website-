# Imported 3D components

Put 3D pieces taken from other projects or examples here.

- **R3F/drei components:** use them as they are, inside `<Canvas>` in `../Scene.tsx`.
- **Vanilla Three.js code:** follow `VanillaThreeExample.tsx`. Build the objects in `useMemo`,
  render them with `<primitive object={...} />`, move the animation loop into `useFrame`,
  and dispose of geometries and materials on unmount. Drop the code that creates the
  renderer, scene, camera and resize handler, because R3F already does that.
- **Models:** put `.glb` files in `public/models/` and load them with `useGLTF("/models/x.glb")`.
  Compress them first with `npx gltf-transform optimize in.glb out.glb`.
