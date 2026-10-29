import * as T from "three";

/** A suspended measurement field around the particle identity; no stage or pedestal. */
export function createRuntimeCore() {
  const group = new T.Group();
  group.position.set(7, -30, -136);
  const vertices: number[] = [], size = 6.3, segment = 1.1;
  for (const x of [-1,1]) for (const y of [-1,1]) for (const z of [-1,1]) {
    for(const axis of [0,1,2]) {
      const p=[x*size,y*size,z*size];vertices.push(...p);
      p[axis]-=[x,y,z][axis]*segment;vertices.push(...p);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position",new T.Float32BufferAttribute(vertices,3));
  const material = new T.LineBasicMaterial({color:0xa8d4cf, transparent:true, opacity:0, depthWrite:false});
  const frame = new T.LineSegments(geometry,material);
  group.add(frame);
  return {
    group,
    update(time:number,presence:number) {
      group.visible=presence>.01;
      frame.rotation.set(.14,.4+time*.1,.04);
      material.opacity=presence*.16;
    },
    setSimple(simple:boolean) { frame.visible=!simple; },
  };
}
