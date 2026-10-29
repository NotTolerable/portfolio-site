import * as T from "three";

/** One original text texture in the scene, behind the opening ice exhibit. */
export async function createIntroName() {
  await Promise.all([
    document.fonts.load('600 540px "Geist"'),
    document.fonts.load('500 190px "Geist"'),
  ]).catch(() => {});
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 640;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "white";
  context.textAlign = "center";
  const lines = [
    { text: "Babisan", weight: 600, size: 540 },
    { text: "Pirapakaran", weight: 500, size: 190 },
  ];
  const metrics = lines.map(line => {
    context.font = `${line.weight} ${line.size}px "Geist", Arial, sans-serif`;
    const width = context.measureText(line.text).width;
    line.size *= Math.min(1, (canvas.width - 100) / width);
    context.font = `${line.weight} ${line.size}px "Geist", Arial, sans-serif`;
    return context.measureText(line.text);
  });
  const gap = 28;
  const height = metrics.reduce((sum, m) => sum + m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, gap);
  let y = (canvas.height - height) / 2;
  lines.forEach((line, index) => {
    context.font = `${line.weight} ${line.size}px "Geist", Arial, sans-serif`;
    y += metrics[index].actualBoundingBoxAscent;
    context.fillText(line.text, canvas.width / 2, y);
    y += metrics[index].actualBoundingBoxDescent + gap;
  });
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const material = new T.MeshBasicMaterial({
    map: texture, color: 0xd3d9df, alphaTest: .003,
    depthTest: true, depthWrite: true, toneMapped: false, fog: false,
    // Retain the opaque render bucket so physical ice captures/refracts the
    // lettering. Explicit blending still gives its antialiasing/fade real alpha.
    transparent: false, blending: T.CustomBlending,
    blendEquation: T.AddEquation,
    blendSrc: T.SrcAlphaFactor, blendDst: T.OneMinusSrcAlphaFactor,
    blendSrcAlpha: T.OneFactor, blendDstAlpha: T.OneMinusSrcAlphaFactor,
  });
  const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), material);
  mesh.name = "Babisan Pirapakaran / opening scene name";
  const facing = new T.Vector3(), up = new T.Vector3();
  const rotation = new T.Matrix4();
  return {
    mesh,
    layout(eye: T.Vector3, target: T.Vector3, camera: T.PerspectiveCamera, narrow: boolean, compact: boolean) {
      const behind = 3.1;
      facing.subVectors(eye, target).normalize();
      rotation.lookAt(eye, target, T.Object3D.DEFAULT_UP);
      mesh.quaternion.setFromRotationMatrix(rotation);
      up.set(0, 1, 0).applyQuaternion(mesh.quaternion);
      const distance = eye.distanceTo(target) + behind;
      const viewHeight = 2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * distance;
      const width = Math.min(viewHeight * camera.aspect * (narrow ? .94 : .85), viewHeight * 1.5);
      mesh.position.copy(target).addScaledVector(facing, -behind)
        .addScaledVector(up, viewHeight * (compact ? .06 : narrow ? -.035 : .035));
      mesh.scale.set(width, width * canvas.height / canvas.width, 1);
    },
    update(progress: number, reveal: number) {
      material.opacity = (1 - T.MathUtils.smoothstep(progress, .006, .028)) * T.MathUtils.smoothstep(reveal, 0, .12);
      material.depthWrite = material.opacity > .99;
      mesh.visible = progress < .029;
    },
  };
}
