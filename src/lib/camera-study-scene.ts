import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createCinematicDirector, studyFocus, type FocusId, type JourneyFrame } from './cinematic-journey';
export type CameraStudyScene = {
    setProgress(progress: number): void;
    setPointer(x: number, y: number): void;
    setFocus(id: FocusId | null): void;
    setReducedMotion(reduced: boolean): void;
    setPaused(paused: boolean): void;
    dispose(): void;
};
/** A connected street and court staging set for reviewing camera direction, not the full city. */
export async function createCameraStudyScene(canvas: HTMLCanvasElement, hotspots: Map<FocusId, HTMLElement>, signal: AbortSignal, onFrame: (frame: JourneyFrame) => void, onLost: () => void, initialProgress = 0): Promise<CameraStudyScene> {
    const compact = innerWidth < 760;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.25 : 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    const scene = new T.Scene();
    scene.background = new T.Color('#081721');
    scene.fog = new T.FogExp2('#102b39', .013);
    const camera = new T.PerspectiveCamera(50, 1, .12, 220), director = createCinematicDirector(initialProgress);
    const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>(), textures = new Set<T.Texture>(), bitmaps = new Set<ImageBitmap>();
    const resources: {
        environment?: T.WebGLRenderTarget;
    } = {};
    let disposed = false, initialized = false, frame = 0, previous = 0, time = 0, paused = false, reduced = false, dirty = true, width = 1, height = 1;
    const geo = <G extends T.BufferGeometry>(g: G) => { geometries.add(g); return g; };
    const mat = <M extends T.Material>(m: M) => { materials.add(m); return m; };
    function mesh(g: T.BufferGeometry, m: T.Material, p: number[], r: number[] = [0, 0, 0], parent: T.Object3D = scene) { const o = new T.Mesh(geo(g), m); o.position.set(...p as [
        number,
        number,
        number
    ]); o.rotation.set(...r as [
        number,
        number,
        number
    ]); parent.add(o); return o; }
    const metal = mat(new T.MeshStandardMaterial({ color: '#3f5963', roughness: .4, metalness: .7 }));
    const trim = mat(new T.MeshStandardMaterial({ color: '#142630', roughness: .6, metalness: .3 }));
    const warm = mat(new T.MeshBasicMaterial({ color: '#e9b583', toneMapped: false })), cool = mat(new T.MeshBasicMaterial({ color: '#8ac5d0', toneMapped: false }));
    const paint = mat(new T.MeshStandardMaterial({ color: '#b7c9c5', roughness: .75 }));
    const box = (w: number, h: number, d: number, m: T.Material, p: number[], r?: number[], parent?: T.Object3D) => mesh(new T.BoxGeometry(w, h, d), m, p, r, parent);
    function line(points: number[][], m: T.Material = paint, radius = .025, parent: T.Object3D = scene) { return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p as [
        number,
        number,
        number
    ])), false, 'centripetal'), Math.max(2, points.length * 5), radius, 5, false), m, [0, 0, 0], undefined, parent); }
    function register(root: T.Object3D) { root.traverse(o => { if (o instanceof T.Mesh) {
        geometries.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            materials.add(m);
            for (const t of Object.values(m))
                if (t instanceof T.Texture) {
                    textures.add(t);
                    if (typeof ImageBitmap !== 'undefined' && t.source.data instanceof ImageBitmap)
                        bitmaps.add(t.source.data);
                }
        }
    } }); }
    function cleanup() { if (disposed)
        return; disposed = true; cancelAnimationFrame(frame); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility); canvas.removeEventListener('webglcontextlost', lost); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); bitmaps.forEach(b => b.close()); resources.environment?.dispose(); renderer.dispose(); scene.clear(); }
    signal.addEventListener('abort', cleanup, { once: true });
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder), texLoader = new T.TextureLoader();
    const names = ['facade', 'radio', 'relay', 'desk', 'lamp', 'optics', 'searchlight'];
    const results = await Promise.allSettled([...names.map(n => loader.loadAsync('/world/' + n + '.glb')), new HDRLoader().loadAsync('/world/city-light.hdr'), ...['diffuse', 'nor_gl', 'rough'].map(n => texLoader.loadAsync('/world/concrete-' + n + '.webp'))]);
    for (const r of results)
        if (r.status === 'fulfilled') {
            if ('scene' in r.value)
                register(r.value.scene);
            else if (r.value instanceof T.Texture)
                textures.add(r.value);
        }
    if (signal.aborted || results.some(r => r.status === 'rejected')) {
        disposed = false;
        cleanup();
        signal.removeEventListener('abort', cleanup);
        throw Error('Camera study assets unavailable');
    }
    const models = results.slice(0, names.length).map(r => (r as PromiseFulfilledResult<Awaited<ReturnType<GLTFLoader['loadAsync']>>>).value.scene);
    const hdri = (results[names.length] as PromiseFulfilledResult<T.DataTexture>).value;
    const pmrem = new T.PMREMGenerator(renderer);
    resources.environment = pmrem.fromEquirectangular(hdri);
    scene.environment = resources.environment.texture;
    scene.environmentIntensity = .16;
    pmrem.dispose();
    const maps = results.slice(names.length + 1).map(r => (r as PromiseFulfilledResult<T.Texture>).value);
    maps.forEach(t => { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(5, 24); t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); });
    maps[0].colorSpace = T.SRGBColorSpace;
    const asphalt = mat(new T.MeshStandardMaterial({ color: '#283c43', map: maps[0], normalMap: maps[1], normalScale: new T.Vector2(.4, .4), roughnessMap: maps[2], roughness: .65, metalness: .04 }));
    const pavement = mat(new T.MeshStandardMaterial({ color: '#4e6265', map: maps[0], roughness: .8, metalness: .02 }));
    const ground = mesh(new T.PlaneGeometry(64, 150), asphalt, [5, -.045, -43], [-Math.PI / 2, 0, 0]);
    ground.receiveShadow = true;
    for (const side of [-1, 1]) {
        box(2.6, .12, 83, pavement, [side * 5.2, .015, -25]);
        box(.1, .2, 83, pavement, [side * 3.87, .03, -25]);
    }
    for (let z = 10; z > -57; z -= 3.5)
        box(.08, .008, 1.25, paint, [0, .004, z]);
    // Spatial facade batches keep distant geometry out of the current view when possible.
    const facade = models[0];
    const blockers: T.Box3[] = [];
    const buildings: [
        number,
        number,
        number
    ][] = [[-1, -5, 3], [-1, -19, 4], [-1, -34, 3], [-1, -49, 4], [1, -4, 4], [1, -21, 3], [1, -36, 3]];
    for (const [side, z, floors] of buildings) {
        const group = new T.Group();
        group.position.set(side * 6.8, 0, z);
        group.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(group);
        const buckets = new Map<T.Material, T.BufferGeometry[]>();
        for (let row = 0; row < floors; row++)
            for (let col = 0; col < 3; col++)
                for (const part of facade.children) {
                    const clone = part.clone(true);
                    clone.position.x += -3 + col * 3;
                    clone.position.y += row * 3;
                    if (part.name.startsWith('window'))
                        clone.position.y += .3;
                    if (part.name.startsWith('cornice'))
                        clone.position.y += 2.8;
                    clone.updateMatrixWorld(true);
                    clone.traverse(o => {
                        if (o instanceof T.Mesh && !Array.isArray(o.material)) {
                            const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
                            for (const key of Object.keys(g.attributes)) {
                                if (!['position', 'normal', 'uv'].includes(key)) {
                                    g.deleteAttribute(key);
                                    continue;
                                }
                                const a = g.getAttribute(key), data = new Float32Array(a.count * a.itemSize);
                                for (let i = 0; i < a.count; i++) {
                                    data[i * a.itemSize] = a.getX(i);
                                    data[i * a.itemSize + 1] = a.getY(i);
                                    if (a.itemSize > 2)
                                        data[i * a.itemSize + 2] = a.getZ(i);
                                }
                                g.setAttribute(key, new T.BufferAttribute(data, a.itemSize));
                            }
                            g.applyMatrix4(o.matrixWorld);
                            if (!buckets.has(o.material))
                                buckets.set(o.material, []);
                            buckets.get(o.material)!.push(g);
                        }
                    });
                }
        for (const [m, gs] of buckets) {
            const g = mergeGeometries(gs);
            if (g) {
                const o = new T.Mesh(geo(g), m);
                o.castShadow = true;
                o.receiveShadow = true;
                group.add(o);
            }
            gs.forEach(g => g.dispose());
        }
        const body = box(7.8, floors * 3, 8, trim, [side * 10.85, floors * 1.5, z]);
        body.castShadow = true;
        body.receiveShadow = true;
        blockers.push(new T.Box3().setFromCenterAndSize(body.position, new T.Vector3(7.8, floors * 3, 8)));
        box(.2, .25, 9.3, metal, [side * 6.7, floors * 3 + .1, z]);
    }
    // Street-level glazing and awnings make the camera's approaches legible.
    function sign(text: string, x: number, y: number, z: number, side: number, color: string) {
        const cv = document.createElement('canvas');
        cv.width = 512;
        cv.height = 128;
        const c = cv.getContext('2d')!;
        c.fillStyle = '#0b222c';
        c.fillRect(0, 0, 512, 128);
        c.strokeStyle = color;
        c.lineWidth = 2;
        c.strokeRect(5, 5, 502, 118);
        c.fillStyle = color;
        c.font = '400 46px monospace';
        c.textAlign = 'center';
        c.fillText(text, 256, 80);
        const t = new T.CanvasTexture(cv);
        t.colorSpace = T.SRGBColorSpace;
        textures.add(t);
        mesh(new T.PlaneGeometry(3.1, .77), mat(new T.MeshBasicMaterial({ map: t, toneMapped: false })), [x, y, z], [0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
    }
    for (const [side, z] of [[-1, -15.4], [1, -31.4], [-1, -43]] as const) {
        box(.2, 2.7, 6.6, trim, [side * 6.5, 1.35, z]);
        box(.03, 2.05, 5.4, side < 0 ? warm : cool, [side * 6.36, 1.45, z]);
        for (const dz of [-2.6, 0, 2.6])
            box(.1, 2.3, .055, metal, [side * 6.2, 1.35, z + dz]);
        const awning = box(1.7, .13, 6.6, metal, [side * 5.9, 2.8, z]);
        awning.castShadow = true;
        sign(side < 0 ? (z === -43 ? 'AFTER HOURS' : 'WORKSHOP') : 'SERVICE BAY', side * 5.02, 2.55, z, side, side < 0 ? '#e2b286' : '#9bd2d8');
    }
    function prop(model: T.Group, height: number, p: number[], yaw = 0) { const group = new T.Group(), b = new T.Box3().setFromObject(model), size = b.getSize(new T.Vector3()), center = b.getCenter(new T.Vector3()); model.position.sub(new T.Vector3(center.x, b.min.y, center.z)); group.add(model); group.scale.setScalar(height / size.y); group.position.set(...p as [
        number,
        number,
        number
    ]); group.rotation.y = yaw; model.traverse(o => { if (o instanceof T.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
    } }); scene.add(group); return group; }
    prop(models[3].clone(true), 1.05, [-5.35, .08, -15.4], Math.PI / 2);
    prop(models[5], 1.3, [-5.1, 1.15, -16.1], Math.PI / 2);
    prop(models[4], 1.05, [-5.7, 1.15, -14.4], Math.PI / 2);
    prop(models[3], 1.05, [5.4, .08, -31.4], -Math.PI / 2);
    prop(models[1], .8, [5.3, 1.15, -31.4], -Math.PI / 2);
    prop(models[2], 2.6, [2.2, .1, -42], -.15);
    const plinth = box(1.7, .14, 1.35, trim, [2.2, .03, -42]);
    plinth.receiveShadow = true;
    for (const dz of [-.65, .65])
        box(1.7, .025, .04, cool, [2.2, .12, -42 + dz]);
    // Local contact shadows are cheap, world-space, and remain present on narrow screens.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const sc = shadowCanvas.getContext('2d')!, sg = sc.createRadialGradient(64, 64, 4, 64, 64, 64);
    sg.addColorStop(0, '#000b');
    sg.addColorStop(1, '#0000');
    sc.fillStyle = sg;
    sc.fillRect(0, 0, 128, 128);
    const shadowTexture = new T.CanvasTexture(shadowCanvas);
    textures.add(shadowTexture);
    const contact = mat(new T.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    for (const [x, z, w, d] of [[-5.35, -15.4, 3, 2], [5.4, -31.4, 3, 2], [2.2, -42, 2.6, 2]])
        mesh(new T.PlaneGeometry(w, d), contact, [x, .087, z], [-Math.PI / 2, 0, 0]);
    // A connected lane turns toward an open gate; the court is a separate quiet space ahead.
    const lane = mesh(new T.PlaneGeometry(12, 30), asphalt, [9, -.02, -62], [-Math.PI / 2, 0, -.28]);
    lane.receiveShadow = true;
    const courtMaterial = mat(new T.MeshStandardMaterial({ color: '#244c4f', roughness: .66, metalness: 0, normalMap: maps[1], normalScale: new T.Vector2(.2, .2) }));
    const court = mesh(new T.PlaneGeometry(15.4, 28.4), courtMaterial, [13, .015, -85], [-Math.PI / 2, 0, 0]);
    court.receiveShadow = true;
    const courtLines = mat(new T.MeshBasicMaterial({ color: '#c6d4ca' }));
    line([[5.5, .035, -71], [20.5, .035, -71], [20.5, .035, -99], [5.5, .035, -99], [5.5, .035, -71]], courtLines, .023);
    line([[5.5, .035, -85], [20.5, .035, -85]], courtLines, .023);
    mesh(new T.RingGeometry(1.775, 1.825, 64), courtLines, [13, .035, -85], [-Math.PI / 2, 0, 0]);
    for (const end of [-1, 1]) {
        const baseline = -85 + end * 14, basket = -85 + end * 12.425, freeThrow = -85 + end * 8.2;
        line([[10.55, .035, baseline], [10.55, .035, freeThrow], [15.45, .035, freeThrow], [15.45, .035, baseline]], courtLines, .023);
        const arc = [];
        for (let j = 0; j <= 56; j++) {
            const a = j / 56 * Math.PI;
            arc.push([13 + Math.cos(a) * 6.75, .036, basket - end * Math.sin(a) * 6.75]);
        }
        line(arc, courtLines, .023);
        line([[6.25, .035, baseline], [6.25, .035, basket]], courtLines, .023);
        line([[19.75, .035, baseline], [19.75, .035, basket]], courtLines, .023);
        mesh(new T.RingGeometry(1.775, 1.825, 48), courtLines, [13, .036, freeThrow], [-Math.PI / 2, 0, 0]);
        const poleZ = -85 + end * 14.7, boardZ = -85 + end * 12.9, rimZ = -85 + end * 12.425;
        const pole = box(.14, 3.85, .14, metal, [13, 1.925, poleZ]);
        pole.castShadow = true;
        line([[13, 3.75, poleZ], [13, 3.75, boardZ]], metal, .07);
        const board = box(1.8, 1.05, .06, paint, [13, 3.52, boardZ]);
        board.castShadow = true;
        line([[12.7, 3.05, boardZ - end * .04], [12.7, 3.57, boardZ - end * .04], [13.3, 3.57, boardZ - end * .04], [13.3, 3.05, boardZ - end * .04]], trim, .018);
        mesh(new T.TorusGeometry(.23, .022, 8, 40), mat(new T.MeshStandardMaterial({ color: '#c27c55', roughness: .6 })), [13, 3.05, rimZ], [Math.PI / 2, 0, 0]);
        const netPositions = [];
        for (let j = 0; j < 12; j++) {
            const a = j / 12 * Math.PI * 2, b = a + Math.PI / 6;
            netPositions.push(13 + Math.cos(a) * .23, 3.04, rimZ + Math.sin(a) * .23, 13 + Math.cos(b) * .14, 2.55, rimZ + Math.sin(b) * .14);
        }
        const ng = geo(new T.BufferGeometry());
        ng.setAttribute('position', new T.Float32BufferAttribute(netPositions, 3));
        scene.add(new T.LineSegments(ng, mat(new T.LineBasicMaterial({ color: '#a3bab6', transparent: true, opacity: .75 }))));
    }
    // Fence mesh is line geometry, not a full-screen decorative overlay. The gate stays open.
    const fenceVertices: number[] = [];
    function fence(x1: number, z1: number, x2: number, z2: number) { const len = Math.hypot(x2 - x1, z2 - z1), count = Math.ceil(len / .4); for (let i = 0; i <= count; i++) {
        const t = i / count, x = T.MathUtils.lerp(x1, x2, t), z = T.MathUtils.lerp(z1, z2, t);
        fenceVertices.push(x, .08, z, x, 3.1, z);
    } for (let y = .1; y < 3.15; y += .4)
        fenceVertices.push(x1, y, z1, x2, y, z2); for (let i = 0; i <= Math.ceil(len / 3); i++) {
        const t = i / Math.ceil(len / 3);
        box(.07, 3.3, .07, metal, [T.MathUtils.lerp(x1, x2, t), 1.65, T.MathUtils.lerp(z1, z2, t)]);
    } line([[x1, 3.22, z1], [x2, 3.22, z2]], metal, .035); }
    fence(5.2, -70.5, 5.2, -100);
    fence(20.8, -70.5, 20.8, -100);
    fence(5.2, -100, 20.8, -100);
    fence(5.2, -70.5, 10.3, -70.5);
    fence(15.2, -70.5, 20.8, -70.5);
    const fenceGeometry = geo(new T.BufferGeometry());
    fenceGeometry.setAttribute('position', new T.Float32BufferAttribute(fenceVertices, 3));
    scene.add(new T.LineSegments(fenceGeometry, mat(new T.LineBasicMaterial({ color: '#526d73', transparent: true, opacity: .58 }))));
    // A modest skyline and street motion establish activity; no traffic enters the court.
    const skyline = mat(new T.MeshStandardMaterial({ color: '#193342', roughness: .9 }));
    for (let i = 0; i < 24; i++) {
        const z = 10 - i * 5, x = (i % 2 ? 1 : -1) * ((z < -60 ? 29 : 17) + (i % 5) * 5), h = 9 + (i * 13) % 18;
        box(7, h, 7, skyline, [x, h / 2 - 1, z]);
        for (let j = 0; j < 4; j++)
            box(.03, .55, .9, j % 2 ? warm : cool, [x + (x > 0 ? -3.51 : 3.51), 2 + j * 2.4, z]);
    }
    const cars: T.Group[] = [];
    for (let i = 0; i < 2; i++) {
        const car = new T.Group();
        scene.add(car);
        box(1.5, .6, 3.3, trim, [0, .5, 0], undefined, car);
        box(1.3, .45, 1.8, metal, [0, 1.0, -.1], undefined, car);
        for (const x of [-.5, .5]) {
            box(.25, .14, .06, warm, [x, .6, -1.68], undefined, car);
            box(.24, .11, .06, mat(new T.MeshBasicMaterial({ color: '#a95544' })), [x, .62, 1.68], undefined, car);
        }
        mesh(new T.PlaneGeometry(2.5, 4), contact, [0, .02, 0], [-Math.PI / 2, 0, 0], car);
        cars.push(car);
    }
    scene.add(new T.HemisphereLight('#a6c8db', '#14282b', .48));
    const moon = new T.DirectionalLight('#a7c9df', 1.3);
    moon.position.set(12, 28, -15);
    moon.target.position.set(0, 0, -28);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    Object.assign(moon.shadow.camera, { left: -22, right: 22, top: 38, bottom: -38, near: .5, far: 110 });
    moon.shadow.normalBias = .025;
    scene.add(moon, moon.target);
    for (const [x, z, color] of [[-5, -15.4, '#e5b27e'], [5, -31.4, '#8bcbd5'], [2.2, -42, '#8dcbd2']] as const) {
        const light = new T.PointLight(color, 32, 13, 1.65);
        light.position.set(x, 2.6, z);
        scene.add(light);
    }
    const courtLight = new T.SpotLight('#d2dfd7', 380, 48, Math.PI * .29, .6, 1.65);
    courtLight.position.set(18, 9, -84);
    courtLight.target.position.set(13, 0, -86);
    courtLight.castShadow = true;
    courtLight.shadow.mapSize.set(1024, 1024);
    courtLight.shadow.normalBias = .025;
    scene.add(courtLight, courtLight.target);
    for (const [x, z] of [[6, -76], [20, -94]]) {
        box(.1, 8, .1, metal, [x, 4, z]);
        prop(models[6].clone(true), .45, [x, 7.8, z]);
        const light = new T.PointLight('#d1dcd4', 70, 24, 1.7);
        light.position.set(x, 7.7, z);
        scene.add(light);
    }
    // Every streak shares one wrapped anchor; endpoints cannot stretch across the volume.
    let seed = 71327;
    const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
    const rainCount = compact ? 650 : 1200, positions = new Float32Array(rainCount * 6), tips = new Float32Array(rainCount * 2);
    for (let i = 0; i < rainCount; i++) {
        const x = -13 + random() * 43, y = random() * 17, z = 17 - random() * 130;
        for (let j = 0; j < 2; j++) {
            const k = i * 6 + j * 3;
            positions[k] = x;
            positions[k + 1] = y;
            positions[k + 2] = z;
            tips[i * 2 + j] = j;
        }
    }
    const rainGeometry = geo(new T.BufferGeometry());
    rainGeometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    rainGeometry.setAttribute('aTip', new T.BufferAttribute(tips, 1));
    const rainMaterial = mat(new T.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 } }, vertexShader: 'attribute float aTip;uniform float uTime;varying float vDistance;void main(){vec3 p=position;float h=mod(position.y-uTime*7.0,17.0);p.y=h+aTip*.18;p.x+=sin(uTime*.15)*.4;vec4 mv=modelViewMatrix*vec4(p,1.);vDistance=-mv.z;gl_Position=projectionMatrix*mv;}', fragmentShader: 'varying float vDistance;void main(){float f=exp(-.0003*vDistance*vDistance);gl_FragColor=vec4(.46,.65,.72,.16*f);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }));
    // Preprocessor directives need their own lines for every WebGL compiler.
    rainMaterial.fragmentShader = rainMaterial.fragmentShader.replace(';#include', ';\n#include');
    const rain = new T.LineSegments(rainGeometry, rainMaterial);
    rain.frustumCulled = false;
    scene.add(rain);
    renderer.shadowMap.needsUpdate = true;
    const projection = new T.Vector3(), markerDirection = new T.Vector3(), hitPoint = new T.Vector3(), occlusionRay = new T.Raycaster();
    const markerPositions = Object.fromEntries(Object.entries(studyFocus).map(([id, f]) => [id, new T.Vector3(...f.object)])) as Record<FocusId, T.Vector3>;
    let lastFov = 0;
    function resize() { width = canvas.clientWidth || innerWidth; height = canvas.clientHeight || innerHeight; renderer.setSize(width, height, false); camera.aspect = width / height; director.setAspect(camera.aspect); camera.updateProjectionMatrix(); dirty = true; wake(); }
    function visibility() { if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
    }
    else
        wake(); }
    function lost(event: Event) { event.preventDefault(); cleanup(); signal.removeEventListener('abort', cleanup); onLost(); }
    function wake() { if (initialized && !disposed && !frame && !document.hidden)
        frame = requestAnimationFrame(tick); }
    function tick(stamp: number) {
        frame = 0;
        if (disposed || document.hidden)
            return;
        const dt = Math.min(previous ? (stamp - previous) / 1000 : 1 / 60, .1);
        previous = stamp;
        const state = director.update(dt), ambient = !paused && !reduced && !state.focus;
        if (ambient)
            time += dt;
        if (dirty || state.moving || ambient) {
            camera.position.copy(state.pose.position);
            camera.quaternion.copy(state.pose.quaternion);
            if (Math.abs(lastFov - state.pose.fov) > .0001) {
                camera.fov = state.pose.fov;
                camera.updateProjectionMatrix();
                lastFov = state.pose.fov;
            }
            camera.updateMatrixWorld();
            rainMaterial.uniforms.uTime.value = time;
            cars.forEach((car, i) => { car.position.set(-2.1 - i * .25, 0, 8 - ((time * 2.1 + i * 22) % 60)); });
            renderer.render(scene, camera);
            dirty = false;
            canvas.dataset.progress = state.progress.toFixed(6);
            canvas.dataset.shot = state.shot.id;
            canvas.dataset.position = camera.position.toArray().map(n => n.toFixed(4)).join(',');
            canvas.dataset.quaternion = camera.quaternion.toArray().map(n => n.toFixed(6)).join(',');
            canvas.dataset.draws = String(Number(canvas.dataset.draws ?? 0) + 1);
            canvas.dataset.focus = state.focus ?? '';
            for (const [id, element] of hotspots) {
                const f = studyFocus[id], enabled = state.progress >= f.from && state.progress <= f.to && state.focusBlend < .05;
                projection.copy(markerPositions[id]).project(camera);
                let visible = enabled && projection.z < 1 && projection.z > -1 && Math.abs(projection.x) < .84 && Math.abs(projection.y) < .65;
                if (visible) {
                    const distance = camera.position.distanceTo(markerPositions[id]);
                    markerDirection.copy(markerPositions[id]).sub(camera.position).normalize();
                    occlusionRay.set(camera.position, markerDirection);
                    for (const bounds of blockers) {
                        const hit = occlusionRay.ray.intersectBox(bounds, hitPoint);
                        if (hit && camera.position.distanceTo(hit) < distance - .2) {
                            visible = false;
                            break;
                        }
                    }
                }
                element.hidden = !visible;
                element.style.transform = `translate3d(${(projection.x * .5 + .5) * width}px,${(-projection.y * .5 + .5) * height}px,0)`;
            }
            onFrame(state);
        }
        if (ambient || state.moving)
            wake();
    }
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('webglcontextlost', lost);
    resize();
    const first = director.update(0);
    camera.position.copy(first.pose.position);
    camera.quaternion.copy(first.pose.quaternion);
    camera.fov = first.pose.fov;
    camera.updateProjectionMatrix();
    try {
        await renderer.compileAsync(scene, camera);
    } catch (error) {
        cleanup();
        signal.removeEventListener('abort', cleanup);
        throw error;
    }
    if (signal.aborted) {
        cleanup();
        throw Error('Aborted');
    }
    initialized = true;
    wake();
    return { setProgress(p) { director.setTarget(p); dirty = true; wake(); }, setPointer(x, y) { director.setPointer(x, y); wake(); }, setFocus(id) { director.setFocus(id); dirty = true; wake(); }, setReducedMotion(v) { reduced = v; director.setReducedMotion(v); dirty = true; wake(); }, setPaused(v) { paused = v; dirty = true; wake(); }, dispose() { signal.removeEventListener('abort', cleanup); cleanup(); } };
}
