import { expect, test } from '@playwright/test';
import { Euler, Vector3 } from 'three';
import { cinematicShots, createCinematicDirector, sampleAuthoredCamera, studyFocus } from '../../src/lib/cinematic-journey';
test('the authored journey advances physically through the city and has distinct compositions', () => {
    let previous = Infinity;
    const heights: number[] = [], yaws: number[] = [], pitches: number[] = [];
    for (let i = 0; i <= 4000; i++) {
        const pose = sampleAuthoredCamera(i / 4000), orientation = new Euler().setFromQuaternion(pose.quaternion, 'YXZ');
        expect(pose.position.z).toBeLessThanOrEqual(previous + 1e-7);
        previous = pose.position.z;
        expect(Math.abs(orientation.z)).toBeLessThan(1e-6);
        expect(pose.quaternion.length()).toBeCloseTo(1, 8);
        heights.push(pose.position.y);
        yaws.push(orientation.y);
        pitches.push(orientation.x);
    }
    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(2.8);
    expect(Math.max(...yaws) - Math.min(...yaws)).toBeGreaterThan(2.2);
    expect(Math.max(...pitches) - Math.min(...pitches)).toBeGreaterThan(.35);
    expect(sampleAuthoredCamera(0).position.z - sampleAuthoredCamera(1).position.z).toBeGreaterThan(90);
    const end = sampleAuthoredCamera(1);
    expect(end.position.x).toBeGreaterThan(5.5);
    expect(end.position.x).toBeLessThan(20.5);
    expect(end.position.z).toBeLessThan(-71);
    expect(end.position.z).toBeGreaterThan(-99);
});
test('pose evaluation is reversible, continuous and independent of evaluation history', () => {
    const forwards = Array.from({ length: 1001 }, (_, i) => sampleAuthoredCamera(i / 1000));
    for (let i = 1000; i >= 0; i--) {
        const backwards = sampleAuthoredCamera(i / 1000);
        expect(backwards.position.distanceTo(forwards[i].position)).toBeLessThan(1e-10);
        expect(backwards.quaternion.angleTo(forwards[i].quaternion)).toBeLessThan(1e-6);
        if (i > 0) {
            expect(backwards.position.distanceTo(forwards[i - 1].position)).toBeLessThan(.3);
            expect(backwards.quaternion.angleTo(forwards[i - 1].quaternion)).toBeLessThan(.05);
        }
    }
});
test('render-clock damping is consistent at 30, 60 and 120Hz and focus returns to the authored rail', () => {
    const results = [30, 60, 120].map(fps => { const d = createCinematicDirector(); d.setTarget(.60); for (let i = 0; i < fps; i++)
        d.update(1 / fps); return d.frame.progress; });
    for (const p of results)
        expect(p).toBeCloseTo(results[0], 8);
    const d = createCinematicDirector(.22);
    d.setFocus('workshop');
    for (let i = 0; i < 180; i++)
        d.update(1 / 60);
    expect(d.frame.pose.position.distanceTo(new Vector3(...studyFocus.workshop.position))).toBeLessThan(.001);
    d.setFocus(null);
    for (let i = 0; i < 180; i++)
        d.update(1 / 60);
    expect(d.frame.pose.position.distanceTo(sampleAuthoredCamera(.22).position)).toBeLessThan(.001);
    expect(new Vector3(...studyFocus.workshop.position).distanceTo(new Vector3(...studyFocus.service.position))).toBeGreaterThan(10);
});
test('reduced motion seeks immediately and cursor parallax cannot override the authored composition', () => {
    const d = createCinematicDirector();
    d.setReducedMotion(true);
    d.setPointer(1, 1);
    d.setTarget(.8);
    d.update(1 / 60);
    expect(d.frame.progress).toBe(.8);
    expect(d.frame.pose.position.distanceTo(sampleAuthoredCamera(.8).position)).toBeLessThan(1e-8);
    d.setReducedMotion(false);
    for (let i = 0; i < 180; i++)
        d.update(1 / 60);
    const base = sampleAuthoredCamera(.8);
    expect(d.frame.pose.position.distanceTo(base.position)).toBeLessThan(.09);
    expect(d.frame.pose.quaternion.angleTo(base.quaternion)).toBeLessThan(.025);
    expect(Math.abs(new Euler().setFromQuaternion(d.frame.pose.quaternion, 'YXZ').z)).toBeLessThan(1e-6);
});
test('all four required composition families are explicitly present', () => {
    expect(cinematicShots.map(s => s.id)).toEqual(['street', 'workshop', 'service', 'orbit', 'threshold', 'court']);
});
