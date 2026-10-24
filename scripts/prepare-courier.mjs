/** Rebuild the compact static pose from the licensed source idle clip.
 * Runtime walking is authored procedurally; no animation FBX is downloaded. */
import { readFile, writeFile } from "node:fs/promises";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
const bytes = await readFile(new URL("../public/models/courier/idle.fbx", import.meta.url));
const source = new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const clip = source.animations.find((item) => /\|Idle$/i.test(item.name));
if (!clip) throw new Error("The source idle clip was not found.");
const pose = {};
for (const track of clip.tracks) {
  const [name, property] = track.name.split(".");
  pose[name] ??= {};
  pose[name][property] = Array.from(track.values.slice(0, track.getValueSize()), (value) => +value.toFixed(7));
}
await writeFile(new URL("../public/models/courier/idle-pose.json", import.meta.url), JSON.stringify(pose));
console.log(`Prepared ${Object.keys(pose).length} pose channels from ${clip.name}.`);
