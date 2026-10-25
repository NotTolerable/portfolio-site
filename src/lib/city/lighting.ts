import * as T from 'three';
/** Fixed shader light count; authored fixtures never become an unbounded list of GPU lights. */
export function createCityLighting(scene: T.Scene, mobile: boolean) {
  const sources: T.Light[] = [], v = new T.Vector3(), q = new T.Quaternion();
  type Fixture = T.PointLight | T.RectAreaLight | T.SpotLight;
  type Slot = {
    light: Fixture;
    source?: Fixture;
    next?: Fixture;
  };
  const slots: Slot[] = [];
  for (let i = 0; i < 4; i++) {
    const light = new T.PointLight('#ffd2a0', 0, 12, 1.8);
    scene.add(light);
    slots.push({ light });
  }
  for (let i = 0; i < 2; i++) {
    const light = new T.RectAreaLight('#ffd2a0', 0, 8, 2);
    scene.add(light);
    slots.push({ light });
  }
  const spot = new T.SpotLight('#ffd2a0', 0, 17, Math.PI * .38, .7, 1.5);
  spot.castShadow = true;
  spot.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024);
  spot.shadow.normalBias = .025;
  scene.add(spot, spot.target);
  slots.push({ light: spot });
  let elapsed = 1;
  const kind = (l: T.Light) => l instanceof T.SpotLight ? 'spot' : l instanceof T.RectAreaLight ? 'area' : 'point';
  function assign(slot: Slot, source: Fixture | undefined) {
    slot.source = source;
    slot.next = source;
    if (!source)
      return;
    source.updateWorldMatrix(true, false);
    source.getWorldPosition(slot.light.position);
    source.getWorldQuaternion(q);
    slot.light.quaternion.copy(q);
    slot.light.color.copy(source.color);
    if (slot.light instanceof T.PointLight && source instanceof T.PointLight) {
      slot.light.distance = source.distance;
      slot.light.decay = source.decay;
    }
    if (slot.light instanceof T.RectAreaLight && source instanceof T.RectAreaLight) {
      slot.light.width = source.width;
      slot.light.height = source.height;
    }
    if (slot.light instanceof T.SpotLight && source instanceof T.SpotLight) {
      source.target.getWorldPosition(slot.light.target.position);
      slot.light.distance = source.distance;
      slot.light.angle = source.angle;
      slot.light.penumbra = source.penumbra;
      slot.light.decay = source.decay;
      slot.light.shadow.needsUpdate = true;
    }
  }
  return {
    register(root: T.Group) {
      root.updateMatrixWorld(true);
      root.traverse(o => {
        if (o instanceof T.Light) {
          sources.push(o);
          o.visible = false;
          o.castShadow = false;
        }
      });
      elapsed = 1;
    },
    update(dt: number, camera: T.Camera, initial = false) {
      elapsed += dt;
      if (elapsed > .35 || initial) {
        elapsed = 0;
        for (const type of ['point', 'area', 'spot']) {
          const nearby = (sources.filter(s => kind(s) === type) as Fixture[]).sort((a, b) => a.getWorldPosition(v).distanceToSquared(camera.position) - b.getWorldPosition(v).distanceToSquared(camera.position));
          const matching = slots.filter(s => kind(s.light) === type);
          const chosen = nearby.slice(0, matching.length);
          for (const slot of matching) {
            if (slot.source && chosen.includes(slot.source)) {
              slot.next = slot.source;
              chosen.splice(chosen.indexOf(slot.source), 1);
            }
            else
              slot.next = undefined;
          }
          for (const slot of matching)
            if (!slot.next)
              slot.next = chosen.shift();
        }
      }
      for (const slot of slots) {
        if (initial)
          assign(slot, slot.next);
        if (slot.next !== slot.source) {
          slot.light.intensity *= Math.exp(-10 * dt);
          if (slot.light.intensity < .015)
            assign(slot, slot.next);
        }
        const target = slot.source === slot.next && slot.source ? slot.source.intensity : 0;
        slot.light.intensity += (target - slot.light.intensity) * (1 - Math.exp(-5 * dt));
        if (initial)
          slot.light.intensity = target;
      }
    },
    freezeSettled() {
      return slots.every(s => s.next === s.source && Math.abs(s.light.intensity - (s.source?.intensity ?? 0)) < .005);
    },
    count: slots.length,
  };
}
