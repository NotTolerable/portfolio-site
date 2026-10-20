import * as THREE from "three";

export const TEXTURE_NAMES = ["Polished black", "Textured plastic", "Perforated graphite", "Rubber terrazzo", "Studio satin", "Grained plastic"];
const SIZE = 512;

function createSurfaceMaps(kind: number) {
  const canvases = Array.from({ length: 2 }, () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    return canvas;
  });
  const contexts = canvases.map((canvas) => {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas textures unavailable");
    return context;
  });
  const images = contexts.map((context) => context.createImageData(SIZE, SIZE));
  let seed = 9173 + kind * 331;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const grain = random() * 2 - 1;
      let color = 245;
      let height = 128;
      if (kind === 0) {
        // Almost unmarked black lacquer: reflections supply the detail.
        color = 255;
      } else if (kind === 1) {
        const u = (x + y) / Math.SQRT2;
        const v = (x - y) / Math.SQRT2;
        const fiber = Math.sin(u * Math.PI / 4.5);
        const bundle = Math.sin(v * Math.PI / 18);
        color += fiber * 5 + bundle * 1.5 + grain;
        height += fiber * 24 + bundle * 6;
      } else if (kind === 2) {
        const pitch = 30;
        const rowHeight = pitch * Math.sqrt(3) / 2;
        const row = Math.floor(y / rowHeight);
        const dx = ((x + (row % 2) * pitch / 2) % pitch) - pitch / 2;
        const dy = (y % rowHeight) - rowHeight / 2;
        const distance = Math.max(Math.abs(dx) * Math.sqrt(3) / 2 + Math.abs(dy) / 2, Math.abs(dy));
        const interior = x > 17 && x < SIZE - 17 && y > 17 && y < SIZE - 17;
        if (interior && distance < 10.5) {
          const rim = Math.max(0, (distance - 7.8) / 2.7);
          color = 8 + rim * 180;
          height = 20 + rim * 130;
        } else {
          color += grain * 2 - (interior ? 0 : 5);
          height += grain * 5;
        }
      } else if (kind === 3) {
        // Quiet stone grain and sparse mineral flecks, without contour lines.
        const mineral = Math.sin(x * 0.041 + Math.sin(y * 0.063)) * Math.sin(y * 0.037);
        const fleck = grain > 0.975 ? (grain - 0.975) * 900 : 0;
        color += mineral * 3 + grain * 3 + fleck;
        height += grain * 28 + mineral * 9 + fleck;
      } else if (kind === 4) {
        const brushing = Math.sin(y * 2.8 + Math.sin(x * 0.018) * 0.15);
        color += brushing * 2.5 + grain * 1.5;
        height += brushing * 12 + grain * 3;
      } else {
        color += grain * 3;
        height += grain * 30;
      }
      const values = [color, height];
      const offset = (y * SIZE + x) * 4;
      images.forEach((image, index) => {
        const value = Math.max(0, Math.min(255, values[index]));
        image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = value;
        image.data[offset + 3] = 255;
      });
    }
  }
  contexts.forEach((context, index) => context.putImageData(images[index], 0, 0));
  return canvases;
}

export async function createFaceMaterials(anisotropy: number) {
  const loader = new THREE.TextureLoader();
  const names = ["reflection-5", "roughness-2", "roughness-3", "roughness-4", "studio-light", "surface-grain", "terrazzo"];
  const loaded = await Promise.allSettled(names.map((name) => loader.loadAsync(`/textures/resend/${name}.png`)));
  if (loaded.some((result) => result.status === "rejected")) {
    loaded.forEach((result) => { if (result.status === "fulfilled") result.value.dispose(); });
    throw new Error("Cube material assets unavailable");
  }
  const source = loaded.map((result) => (result as PromiseFulfilledResult<THREE.Texture>).value);
  source.forEach((texture) => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(anisotropy, 8); });
  const grain = source[5].clone();
  grain.colorSpace = THREE.NoColorSpace;
  grain.wrapS = grain.wrapT = THREE.MirroredRepeatWrapping;
  grain.repeat.setScalar(1.6666666667);
  const textures: THREE.Texture[] = [...source, grain];
  const materials = TEXTURE_NAMES.map((name, index) => {
    const [map, bump] = createSurfaceMaps(index).slice(0, 2).map((canvas, channel) => {
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = channel === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.anisotropy = Math.min(anisotropy, 8);
      textures.push(texture);
      return texture;
    });
    return new THREE.MeshMatcapMaterial({
      name,
      matcap: source[[0, 2, 1, 3, 3, 4][index]],
      map: index === 3 ? source[6] : map,
      bumpMap: index === 5 ? grain : bump,
      bumpScale: [0.001, 0.024, 0.055, 0.006, 0.004, 0.035][index],
      color: [0xb0b0b0, 0xc8c8c8, 0x8a8a8a, 0xaaaaaa, 0xc0c0c0, 0xd0d0d0][index],
      toneMapped: false,
    });
  });
  return { materials, dispose() { materials.forEach((material) => material.dispose()); textures.forEach((texture) => texture.dispose()); } };
}
