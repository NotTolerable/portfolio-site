import * as T from 'three';
/** Camera study only. Translation, orientation and lens have independently authored tracks. */
export const cinematicShots = [
    { id: 'street', at: 0, start: 0, title: 'The city is still awake.', label: 'Street level', description: 'An eye-level approach through warm shop windows and a rain-washed street.' },
    { id: 'workshop', at: .22, start: .15, title: 'A closer look.', label: 'Workshop approach', description: 'The camera turns left and settles on the workshop, without leaving the street.' },
    { id: 'service', at: .39, start: .33, title: 'Look across the street.', label: 'Side-looking view', description: 'A deliberate rightward composition brings the service bay into view as the workshop passes behind.' },
    { id: 'orbit', at: .565, start: .475, title: 'Around the corner.', label: 'Corner orbit', description: 'A rising arc around the relay changes height, pitch and framing together.' },
    { id: 'threshold', at: .80, start: .68, title: 'Leave the traffic behind.', label: 'Court threshold', description: 'A gentle crane and turn reveal the gate. The camera descends as it passes through.' },
    { id: 'court', at: 1, start: .875, title: 'Just the lights. And the rain.', label: 'Empty court', description: 'The journey settles inside an empty nighttime basketball court.' },
] as const;
export type CinematicShot = typeof cinematicShots[number];
export type FocusId = 'workshop' | 'service' | 'relay';
export const studyFocus = {
    workshop: { title: 'The workshop', caption: 'A low oblique approach to the project console.', position: [-1.1, 1.65, -13.3], yaw: 65, pitch: -4, fov: 45, object: [-5.4, 1.7, -15.4], from: .16, to: .29 },
    service: { title: 'The service bay', caption: 'A side composition with the radio and cabinet in the same frame.', position: [.8, 1.8, -29.2], yaw: -65, pitch: -5, fov: 46, object: [5.4, 1.5, -31.4], from: .34, to: .45 },
    relay: { title: 'The corner relay', caption: 'A lower, tighter composition after the rising orbit.', position: [5.1, 1.65, -40.7], yaw: 66, pitch: -4, fov: 44, object: [2.2, 1.65, -42], from: .49, to: .65 },
} as const;
const points = [
    [0, 1.7, 12], [0, 1.7, 5], [.2, 1.7, -3], [.7, 1.65, -9],
    [1.6, 1.6, -13], [1.4, 1.8, -19], [.4, 2, -24], [-.5, 2, -28],
    [-.3, 1.95, -32], [-.3, 2, -36], [-.6, 2.1, -38], [1.5, 2.8, -38.9],
    [3.5, 2.8, -39.3], [5.2, 2.2, -41.1], [5.8, 1.8, -44.5], [5.6, 1.75, -49],
    [6.8, 2, -55], [10.5, 3.6, -60], [12, 4.6, -64], [12.7, 3, -68],
    [12.8, 1.8, -71], [13.1, 1.9, -75], [13, 2.15, -78.5],
];
const rail = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p as [
    number,
    number,
    number
])), false, 'centripetal');
rail.arcLengthDivisions = 1600;
rail.updateArcLengths();
const scratchPoint = new T.Vector3();
function distanceAtZ(z: number) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 32; i++) {
        const mid = (lo + hi) / 2;
        rail.getPointAt(mid, scratchPoint);
        if (scratchPoint.z > z)
            lo = mid;
        else
            hi = mid;
    }
    return (lo + hi) / 2;
}
type Key = readonly [
    number,
    number
];
/** Monotone cubic Hermite interpolation prevents pacing overshoot and is reversible. */
function monotoneTrack(keys: readonly Key[]) {
    const slopes = keys.slice(1).map((k, i) => (k[1] - keys[i][1]) / (k[0] - keys[i][0]));
    const tangent = keys.map((_, i) => {
        if (i === 0)
            return slopes[0];
        if (i === keys.length - 1)
            return slopes.at(-1)!;
        const a = slopes[i - 1], b = slopes[i];
        if (a * b <= 0)
            return 0;
        const h0 = keys[i][0] - keys[i - 1][0], h1 = keys[i + 1][0] - keys[i][0];
        const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
        return (w0 + w1) / (w0 / a + w1 / b);
    });
    return (progress: number) => {
        const p = T.MathUtils.clamp(progress, keys[0][0], keys.at(-1)![0]);
        let i = 0;
        while (i < keys.length - 2 && p > keys[i + 1][0])
            i++;
        const h = keys[i + 1][0] - keys[i][0], t = (p - keys[i][0]) / h, t2 = t * t, t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * keys[i][1] + (t3 - 2 * t2 + t) * h * tangent[i] + (-2 * t3 + 3 * t2) * keys[i + 1][1] + (t3 - t2) * h * tangent[i + 1];
    };
}
const travel = monotoneTrack(([
    [0, 12], [.10, 3], [.22, -14], [.30, -20], [.39, -29], [.46, -36.5],
    [.50, -38.2], [.60, -41.2], [.67, -51], [.80, -67], [.90, -73], [1, -78.5],
] as const).map(([p, z]) => [p, p === 0 ? 0 : p === 1 ? 1 : distanceAtZ(z)]));
const yawTrack = monotoneTrack([
    [0, -6], [.08, 0], [.17, 35], [.22, 63], [.27, 42], [.32, 4], [.37, -48], [.40, -62],
    [.44, -30], [.49, -30], [.53, -12], [.56, 24], [.60, 73], [.63, 45], [.67, -15],
    [.75, -14], [.80, -5], [.86, -1], [.93, 0], [1, 0],
]);
const pitchTrack = monotoneTrack([
    [0, 2], [.10, 0], [.22, -3], [.32, 1], [.40, -4], [.46, -1], [.50, -8],
    [.53, -20], [.56, -20], [.60, -9], [.67, 2], [.75, -12], [.80, -13], [.86, -3], [.93, 0], [1, 2],
]);
const lensTrack = monotoneTrack([[0, 50], [.22, 46], [.39, 49], [.55, 47], [.67, 51], [.80, 54], [1, 50]]);
const radians = T.MathUtils.degToRad;
const euler = new T.Euler(0, 0, 0, 'YXZ');
export type CameraPose = {
    position: T.Vector3;
    quaternion: T.Quaternion;
    fov: number;
};
export function createCameraPose(): CameraPose { return { position: new T.Vector3(), quaternion: new T.Quaternion(), fov: 50 }; }
export function sampleAuthoredCamera(progress: number, aspect = 16 / 9, out = createCameraPose()): CameraPose {
    const p = T.MathUtils.clamp(progress, 0, 1);
    rail.getPointAt(travel(p), out.position);
    out.quaternion.setFromEuler(euler.set(radians(pitchTrack(p)), radians(yawTrack(p)), 0, 'YXZ'));
    out.fov = lensTrack(p) + (aspect < .8 ? 8 : 0);
    return out;
}
export function shotAt(progress: number): CinematicShot {
    return cinematicShots.findLast(s => progress >= s.start) ?? cinematicShots[0];
}
export function captionOpacity(progress: number) {
    const current = shotAt(progress), next = cinematicShots[cinematicShots.indexOf(current) + 1];
    const enter = current.start === 0 ? 1 : T.MathUtils.smoothstep(progress, current.start, current.start + .026);
    const exit = next ? 1 - T.MathUtils.smoothstep(progress, next.start - .024, next.start) : 1;
    return enter * exit;
}
export type JourneyFrame = {
    progress: number;
    target: number;
    shot: CinematicShot;
    pose: CameraPose;
    captionOpacity: number;
    focus: FocusId | null;
    focusBlend: number;
    moving: boolean;
};
/** One render-clock authority for camera, captions, active landmarks and focus. */
export function createCinematicDirector(initialProgress = 0) {
    let target = initialProgress, progress = initialProgress, aspect = 16 / 9, reduced = false;
    let cursorX = 0, cursorY = 0, x = 0, y = 0;
    let desiredFocus: FocusId | null = null, lastFocus: FocusId | null = null, focusBlend = 0;
    const pose = createCameraPose(), focusPose = createCameraPose();
    const focusTarget = createCameraPose(), pointerQ = new T.Quaternion(), forward = new T.Vector3(), right = new T.Vector3();
    const frame: JourneyFrame = { progress: 0, target: 0, shot: cinematicShots[0], pose, captionOpacity: 1, focus: null, focusBlend: 0, moving: false };
    function levelHorizon() {
        forward.set(0, 0, -1).applyQuaternion(pose.quaternion);
        euler.set(Math.asin(T.MathUtils.clamp(forward.y, -1, 1)), Math.atan2(-forward.x, -forward.z), 0, 'YXZ');
        pose.quaternion.setFromEuler(euler);
    }
    return {
        frame,
        setTarget(value: number) { target = T.MathUtils.clamp(value, 0, 1); },
        setAspect(value: number) { aspect = value; },
        setReducedMotion(value: boolean) { reduced = value; },
        setPointer(px: number, py: number) { cursorX = T.MathUtils.clamp(px, -1, 1); cursorY = T.MathUtils.clamp(py, -1, 1); },
        setFocus(id: FocusId | null) {
            if (id && id !== lastFocus) {
                const f = studyFocus[id];
                focusTarget.position.set(f.position[0], f.position[1], f.position[2]);
                focusTarget.quaternion.setFromEuler(euler.set(radians(f.pitch), radians(f.yaw), 0, 'YXZ'));
                focusTarget.fov = f.fov;
                if (focusBlend < .001) {
                    focusPose.position.copy(focusTarget.position);
                    focusPose.quaternion.copy(focusTarget.quaternion);
                    focusPose.fov = focusTarget.fov;
                }
                lastFocus = id;
            }
            desiredFocus = id;
        },
        update(delta: number) {
            const dt = Math.max(0, Math.min(delta, .1)), blend = reduced ? 1 : 1 - Math.exp(-5.5 * dt);
            progress += (target - progress) * blend;
            if (Math.abs(progress - target) < .000001)
                progress = target;
            x += ((reduced ? 0 : cursorX) - x) * blend;
            y += ((reduced ? 0 : cursorY) - y) * blend;
            focusBlend += ((desiredFocus ? 1 : 0) - focusBlend) * blend;
            if (Math.abs(focusBlend - (desiredFocus ? 1 : 0)) < .00001)
                focusBlend = desiredFocus ? 1 : 0;
            sampleAuthoredCamera(progress, aspect, pose);
            if (lastFocus && focusBlend > 0) {
                focusPose.position.lerp(focusTarget.position, blend);
                focusPose.quaternion.slerp(focusTarget.quaternion, blend);
                focusPose.fov += (focusTarget.fov - focusPose.fov) * blend;
                pose.position.lerp(focusPose.position, focusBlend);
                pose.quaternion.slerp(focusPose.quaternion, focusBlend);
                pose.fov += (focusPose.fov + (aspect < .8 ? 8 : 0) - pose.fov) * focusBlend;
            }
            const amplitude = reduced ? 0 : 1 - focusBlend;
            right.set(1, 0, 0).applyQuaternion(pose.quaternion);
            pose.position.addScaledVector(right, x * .075 * amplitude);
            pose.position.y -= y * .035 * amplitude;
            pointerQ.setFromEuler(euler.set(-y * .008 * amplitude, -x * .013 * amplitude, 0, 'YXZ'));
            pose.quaternion.multiply(pointerQ);
            levelHorizon();
            frame.progress = progress;
            frame.target = target;
            frame.shot = shotAt(progress);
            frame.captionOpacity = captionOpacity(progress);
            frame.focus = desiredFocus;
            frame.focusBlend = focusBlend;
            const focusChanging = !!desiredFocus && (focusPose.position.distanceToSquared(focusTarget.position) > .000001 || 1 - Math.abs(focusPose.quaternion.dot(focusTarget.quaternion)) > .000001 || Math.abs(focusPose.fov - focusTarget.fov) > .001);
            frame.moving = focusChanging || Math.abs(progress - target) > .000001 || Math.abs(focusBlend - (desiredFocus ? 1 : 0)) > .00001 || (!reduced && (Math.abs(x - cursorX) > .0001 || Math.abs(y - cursorY) > .0001));
            return frame;
        },
    };
}
