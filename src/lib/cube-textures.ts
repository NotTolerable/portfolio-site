import * as THREE from "three";

export const TEXTURE_NAMES = ["Brushed metal", "Carbon weave", "Perforated graphite", "Contour stone", "Machined ribs", "Etched grid"];
export const TEXTURE_SHADES = [18, 27, 37, 49, 62, 76];

function drawTexture(kind: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas textures unavailable");
  const base = TEXTURE_SHADES[kind];
  const tone = (offset: number) => {
    const value = Math.max(0, Math.min(255, base + offset));
    return `rgb(${value},${value},${value})`;
  };
  ctx.fillStyle = tone(0);
  ctx.fillRect(0, 0, 256, 256);
  ctx.lineWidth = 1;
  if (kind === 0) {
    for (let y = 0; y < 256; y += 2) {
      ctx.strokeStyle = tone(Math.round(Math.sin(y * 17.3) * 8));
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
    }
  } else if (kind === 1) {
    for (let x = -16; x < 272; x += 16) {
      for (let y = -16; y < 272; y += 16) {
        const vertical = ((x + y) / 16) % 2 === 0;
        ctx.fillStyle = tone(vertical ? 6 : -6);
        ctx.fillRect(x, y, 15, 15);
        ctx.strokeStyle = tone(vertical ? 13 : 0);
        for (let i = 3; i < 16; i += 4) {
          ctx.beginPath(); ctx.moveTo(x + (vertical ? i : 0), y + (vertical ? 0 : i)); ctx.lineTo(x + (vertical ? i : 15), y + (vertical ? 15 : i)); ctx.stroke();
        }
      }
    }
  } else if (kind === 2) {
    for (let y = 10; y < 256; y += 20) {
      for (let x = 10; x < 256; x += 20) {
        ctx.beginPath(); ctx.arc(x + (y % 40 === 10 ? 0 : 10), y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = tone(-19); ctx.fill(); ctx.strokeStyle = tone(18); ctx.stroke();
      }
    }
  } else if (kind === 3) {
    ctx.strokeStyle = tone(17);
    for (let i = -12; i < 24; i++) {
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 3) {
        const y = i * 18 + Math.sin(x / 48 + i * 0.25) * 22 + Math.cos(x / 27) * 9;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (kind === 4) {
    for (let x = -256; x < 512; x += 16) {
      ctx.strokeStyle = tone(21); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 256, 256); ctx.stroke();
      ctx.strokeStyle = tone(-18); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x + 5, 0); ctx.lineTo(x + 261, 256); ctx.stroke();
    }
  } else {
    for (let x = 0; x < 256; x += 32) {
      for (let y = 0; y < 256; y += 32) {
        ctx.strokeStyle = tone(19); ctx.lineWidth = 1; ctx.strokeRect(x + 4, y + 4, 24, 24);
        ctx.fillStyle = tone(-13); ctx.fillRect(x + 13, y + 13, 6, 6);
      }
    }
  }
  return canvas;
}

export function createFaceMaterials(anisotropy: number) {
  const textures: THREE.CanvasTexture[] = [];
  const materials = TEXTURE_NAMES.map((name, index) => {
    const canvas = drawTexture(index);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(anisotropy, 8);
    // Height data has its own contrast so dark albedo does not flatten the relief.
    const height = document.createElement("canvas");
    height.width = height.height = 256;
    const context = height.getContext("2d");
    if (!context) throw new Error("Canvas height maps unavailable");
    context.drawImage(canvas, 0, 0);
    const pixels = context.getImageData(0, 0, 256, 256);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const value = Math.max(0, Math.min(255, 128 + (pixels.data[i] - TEXTURE_SHADES[index]) * 5));
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
    }
    context.putImageData(pixels, 0, 0);
    const bump = new THREE.CanvasTexture(height);
    bump.colorSpace = THREE.NoColorSpace;
    bump.anisotropy = map.anisotropy;
    textures.push(map, bump);
    return new THREE.MeshPhysicalMaterial({
      name,
      map,
      bumpMap: bump,
      bumpScale: [0.004, 0.018, 0.035, 0.045, 0.03, 0.014][index],
      metalness: [0.7, 0.15, 0.5, 0.02, 0.65, 0.35][index],
      roughness: [0.24, 0.4, 0.58, 0.86, 0.28, 0.42][index],
      clearcoat: [0.45, 0.9, 0.08, 0, 0.65, 0.3][index],
      clearcoatRoughness: [0.22, 0.12, 0.6, 0.8, 0.18, 0.34][index],
      envMapIntensity: 1,
    });
  });
  return { materials, dispose() { materials.forEach((material) => material.dispose()); textures.forEach((texture) => texture.dispose()); } };
}
