import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#house-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1020);
scene.fog = new THREE.Fog(0x0a1020, 18, 44);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
camera.position.set(9, 7.2, 10.5);
const viewerMessage = document.querySelector("#viewer-message");

function canUseWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(window.WebGL2RenderingContext && probe.getContext("webgl2"));
  } catch {
    return false;
  }
}

function showViewerMessage(message) {
  viewerMessage.hidden = false;
  viewerMessage.textContent = message;
}

if (canUseWebGL()) {
  initializeViewer();
} else {
  showViewerMessage("当前浏览器或设备未启用 WebGL 2，暂时无法显示 3D 模型。请尝试更新浏览器、开启硬件加速，或换用支持 WebGL 的设备。");
}

function initializeViewer() {
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
} catch (error) {
  console.error(error);
  showViewerMessage("3D 渲染初始化失败。请确认浏览器支持 WebGL 2，并已开启硬件加速。");
  return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 1.1, 0);
controls.listenToKeyEvents(window);
controls.minDistance = 3.2;
controls.maxDistance = 40;
controls.minPolarAngle = Math.PI * 0.03;
controls.maxPolarAngle = Math.PI * 0.88;
controls.screenSpacePanning = true;

const house = new THREE.Group();
const wallGroup = new THREE.Group();
const roofGroup = new THREE.Group();
const labelGroup = new THREE.Group();
const furnitureGroup = new THREE.Group();
scene.add(house, wallGroup, roofGroup, labelGroup, furnitureGroup);

const wallHeight = 2.8;
const wallThickness = 0.18;

const materials = {
  slab: new THREE.MeshStandardMaterial({ color: 0x26334a, roughness: 0.82 }),
  wall: new THREE.MeshStandardMaterial({
    color: 0xf3efe4,
    roughness: 0.72,
    metalness: 0.02,
    transparent: true,
    opacity: 0.92,
  }),
  roof: new THREE.MeshStandardMaterial({
    color: 0x3b465c,
    roughness: 0.7,
    transparent: true,
    opacity: 0.62,
  }),
  living: new THREE.MeshStandardMaterial({ color: 0xf5bd4f, roughness: 0.7 }),
  bedroom: new THREE.MeshStandardMaterial({ color: 0x78d6a3, roughness: 0.72 }),
  service: new THREE.MeshStandardMaterial({ color: 0x8bb7ff, roughness: 0.72 }),
  hall: new THREE.MeshStandardMaterial({ color: 0xd7bfa1, roughness: 0.72 }),
  outdoor: new THREE.MeshStandardMaterial({ color: 0x5ebf8a, roughness: 0.75 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xa86837, roughness: 0.58 }),
  darkWood: new THREE.MeshStandardMaterial({ color: 0x65412a, roughness: 0.62 }),
  textile: new THREE.MeshStandardMaterial({ color: 0x335f8f, roughness: 0.85 }),
  bed: new THREE.MeshStandardMaterial({ color: 0xe7dccf, roughness: 0.9 }),
  counter: new THREE.MeshStandardMaterial({ color: 0x323b4f, roughness: 0.56 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xc8d1dc, roughness: 0.35, metalness: 0.18 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x9bdcff,
    transmission: 0.2,
    transparent: true,
    opacity: 0.38,
    roughness: 0.04,
    metalness: 0,
  }),
};

function addBox(group, { width, height, depth, x, y, z, material, name, castShadow = true }) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.name = name ?? "";
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addZone({ label, width, depth, x, z, material }) {
  addBox(house, {
    width,
    height: 0.045,
    depth,
    x,
    y: 0.085,
    z,
    material,
    name: `${label} 地面`,
    castShadow: false,
  });
}

function addWallX(x, z, width) {
  return addBox(wallGroup, {
    width,
    height: wallHeight,
    depth: wallThickness,
    x,
    y: wallHeight / 2 + 0.1,
    z,
    material: materials.wall,
    name: "横向墙体",
  });
}

function addWallZ(x, z, depth) {
  return addBox(wallGroup, {
    width: wallThickness,
    height: wallHeight,
    depth,
    x,
    y: wallHeight / 2 + 0.1,
    z,
    material: materials.wall,
    name: "纵向墙体",
  });
}

function addGlassX(x, z, width, y = 1.55) {
  return addBox(wallGroup, {
    width,
    height: 1.15,
    depth: 0.035,
    x,
    y,
    z,
    material: materials.glass,
    name: "窗户",
    castShadow: false,
  });
}

function addGlassZ(x, z, depth, y = 1.55) {
  return addBox(wallGroup, {
    width: 0.035,
    height: 1.15,
    depth,
    x,
    y,
    z,
    material: materials.glass,
    name: "窗户",
    castShadow: false,
  });
}

function addDoorX(x, z, width) {
  return addBox(wallGroup, {
    width,
    height: 2.08,
    depth: 0.055,
    x,
    y: 1.14,
    z,
    material: materials.darkWood,
    name: "门",
  });
}

function addDoorZ(x, z, depth) {
  return addBox(wallGroup, {
    width: 0.055,
    height: 2.08,
    depth,
    x,
    y: 1.14,
    z,
    material: materials.darkWood,
    name: "门",
  });
}

function makeLabelTexture(text, color) {
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 420;
  canvas2d.height = 128;
  const context = canvas2d.getContext("2d");
  context.fillStyle = "rgba(8, 13, 25, 0.78)";
  context.roundRect(14, 18, 392, 92, 22);
  context.fill();
  context.strokeStyle = color;
  context.lineWidth = 5;
  context.stroke();
  context.fillStyle = "#ffffff";
  context.font = "700 34px Microsoft YaHei, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 210, 64);
  const texture = new THREE.CanvasTexture(canvas2d);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addLabel(text, x, z, color = "#62d8ff") {
  const material = new THREE.SpriteMaterial({
    map: makeLabelTexture(text, color),
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, 0.78, z);
  sprite.scale.set(2.1, 0.64, 1);
  labelGroup.add(sprite);
}

function addBed(x, z, rotation = 0) {
  const bed = new THREE.Group();
  bed.rotation.y = rotation;
  bed.position.set(x, 0.16, z);
  addBox(bed, { width: 1.75, height: 0.28, depth: 2.12, x: 0, y: 0.14, z: 0, material: materials.wood });
  addBox(bed, { width: 1.62, height: 0.22, depth: 1.86, x: 0, y: 0.38, z: 0.12, material: materials.bed });
  addBox(bed, { width: 0.72, height: 0.12, depth: 0.42, x: -0.42, y: 0.56, z: -0.62, material: materials.textile });
  addBox(bed, { width: 0.72, height: 0.12, depth: 0.42, x: 0.42, y: 0.56, z: -0.62, material: materials.textile });
  furnitureGroup.add(bed);
}

function addTable(x, z, width, depth, material = materials.wood) {
  addBox(furnitureGroup, { width, height: 0.12, depth, x, y: 0.56, z, material });
  addBox(furnitureGroup, { width: 0.09, height: 0.5, depth: 0.09, x: x - width / 2 + 0.18, y: 0.28, z: z - depth / 2 + 0.18, material });
  addBox(furnitureGroup, { width: 0.09, height: 0.5, depth: 0.09, x: x + width / 2 - 0.18, y: 0.28, z: z - depth / 2 + 0.18, material });
  addBox(furnitureGroup, { width: 0.09, height: 0.5, depth: 0.09, x: x - width / 2 + 0.18, y: 0.28, z: z + depth / 2 - 0.18, material });
  addBox(furnitureGroup, { width: 0.09, height: 0.5, depth: 0.09, x: x + width / 2 - 0.18, y: 0.28, z: z + depth / 2 - 0.18, material });
}

function addSofa() {
  addBox(furnitureGroup, { width: 2.45, height: 0.42, depth: 0.82, x: -3.2, y: 0.35, z: -2.45, material: materials.textile });
  addBox(furnitureGroup, { width: 2.55, height: 0.8, depth: 0.22, x: -3.2, y: 0.62, z: -2.86, material: materials.textile });
  addBox(furnitureGroup, { width: 0.24, height: 0.55, depth: 0.84, x: -4.6, y: 0.48, z: -2.45, material: materials.textile });
  addBox(furnitureGroup, { width: 0.24, height: 0.55, depth: 0.84, x: -1.8, y: 0.48, z: -2.45, material: materials.textile });
  addTable(-3.2, -1.42, 1.2, 0.62, materials.darkWood);
}

function addKitchen() {
  addBox(furnitureGroup, { width: 0.72, height: 0.88, depth: 3.0, x: -4.35, y: 0.54, z: 1.9, material: materials.counter });
  addBox(furnitureGroup, { width: 2.7, height: 0.88, depth: 0.72, x: -3.0, y: 0.54, z: 3.85, material: materials.counter });
  addBox(furnitureGroup, { width: 0.58, height: 0.08, depth: 0.42, x: -4.36, y: 1.02, z: 1.15, material: materials.metal, castShadow: false });
  addBox(furnitureGroup, { width: 0.7, height: 0.08, depth: 0.52, x: -2.36, y: 1.02, z: 3.84, material: materials.metal, castShadow: false });
}

function addBathroom() {
  addBox(furnitureGroup, { width: 0.72, height: 0.45, depth: 1.18, x: 2.0, y: 0.34, z: 3.56, material: materials.metal });
  addBox(furnitureGroup, { width: 0.42, height: 0.42, depth: 0.58, x: 3.05, y: 0.32, z: 3.88, material: materials.bed });
  addBox(furnitureGroup, { width: 0.82, height: 0.7, depth: 0.52, x: 3.1, y: 0.46, z: 2.72, material: materials.counter });
}

function addDesk(x, z) {
  addTable(x, z, 1.25, 0.62, materials.darkWood);
  addBox(furnitureGroup, { width: 0.56, height: 0.48, depth: 0.52, x: x + 0.9, y: 0.3, z, material: materials.textile });
}

function addDimensionLine() {
  const material = new THREE.LineBasicMaterial({ color: 0x62d8ff, transparent: true, opacity: 0.85 });
  const points = [
    new THREE.Vector3(-5, 0.13, 5.72),
    new THREE.Vector3(5, 0.13, 5.72),
    new THREE.Vector3(5, 0.13, 5.52),
    new THREE.Vector3(5, 0.13, 5.92),
    new THREE.Vector3(5, 0.13, 5.72),
    new THREE.Vector3(-5, 0.13, 5.72),
    new THREE.Vector3(-5, 0.13, 5.52),
    new THREE.Vector3(-5, 0.13, 5.92),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  house.add(new THREE.Line(geometry, material));
  addLabel("总宽 10m", 0, 5.82, "#62d8ff");
}

function buildHouse() {
  addBox(house, {
    width: 10,
    height: 0.16,
    depth: 10,
    x: 0,
    y: 0,
    z: 0,
    material: materials.slab,
    name: "100 平米主体地台",
    castShadow: false,
  });

  addZone({ label: "客餐厨", width: 5.7, depth: 6.05, x: -2.05, z: -1.6, material: materials.living });
  addZone({ label: "玄关厨房", width: 5.7, depth: 3.55, x: -2.05, z: 3.2, material: materials.hall });
  addZone({ label: "主卧", width: 4.0, depth: 3.55, x: 2.85, z: -3.05, material: materials.bedroom });
  addZone({ label: "次卧书房", width: 4.0, depth: 3.1, x: 2.85, z: 0.35, material: materials.bedroom });
  addZone({ label: "卫生间", width: 2.35, depth: 2.45, x: 1.98, z: 3.45, material: materials.service });
  addZone({ label: "储物家政", width: 1.45, depth: 2.45, x: 4.15, z: 3.45, material: materials.service });
  addZone({ label: "露台", width: 3.55, depth: 1.15, x: -3.0, z: -5.85, material: materials.outdoor });

  // 外墙用分段墙体留出窗门位置，便于从外部观察真实采光关系。
  addWallX(-4.65, -5, 0.7);
  addWallX(0.45, -5, 3.3);
  addWallX(4.6, -5, 0.8);
  addGlassX(-2.75, -5.02, 3.1, 1.35);
  addGlassX(3.15, -5.02, 2.1, 1.35);

  addWallX(-1.25, 5, 6.5);
  addWallX(3.35, 5, 2.6);
  addDoorX(-4.25, 5.02, 0.88);
  addGlassX(2.1, 5.02, 1.2, 1.45);

  addWallZ(-5, 0, 10);
  addWallZ(5, -2.2, 5.6);
  addWallZ(5, 3.7, 2.6);
  addGlassZ(5.02, 0.35, 1.8, 1.45);

  // 内部分区围绕中间走廊展开：公共区在西侧，私密卧室与卫浴在东侧。
  addWallZ(0.78, -3.28, 3.35);
  addWallZ(0.78, 0.85, 2.25);
  addWallZ(0.78, 3.65, 2.35);
  addDoorZ(0.76, -1.2, 0.88);
  addDoorZ(0.76, 2.25, 0.82);

  addWallX(2.9, -1.22, 4.2);
  addWallX(2.9, 2.15, 4.2);
  addWallZ(3.55, 3.48, 2.64);
  addDoorX(1.48, -1.22, 0.82);
  addDoorX(1.48, 2.15, 0.82);
  addDoorZ(3.54, 2.85, 0.72);

  addBox(roofGroup, {
    width: 10.45,
    height: 0.18,
    depth: 10.45,
    x: 0,
    y: 3.06,
    z: 0,
    material: materials.roof,
    name: "平屋顶",
  });
  addBox(roofGroup, { width: 10.7, height: 0.28, depth: 0.18, x: 0, y: 2.88, z: -5.35, material: materials.roof });
  addBox(roofGroup, { width: 10.7, height: 0.28, depth: 0.18, x: 0, y: 2.88, z: 5.35, material: materials.roof });

  addSofa();
  addTable(-1.02, 0.35, 1.42, 0.86);
  addKitchen();
  addBed(3.0, -3.45, 0);
  addBed(3.15, 0.15, Math.PI / 2);
  addDesk(4.0, 1.35);
  addBathroom();
  addBox(furnitureGroup, { width: 1.2, height: 1.95, depth: 0.52, x: 4.25, y: 1.04, z: 3.6, material: materials.darkWood });

  addLabel("客餐厨 34㎡", -2.05, -1.6, "#f5bd4f");
  addLabel("玄关/厨房/走廊 20㎡", -2.08, 3.1, "#d7bfa1");
  addLabel("主卧 14㎡", 2.82, -3.15, "#78d6a3");
  addLabel("次卧/书房 12㎡", 2.78, 0.35, "#78d6a3");
  addLabel("卫生间 6㎡", 2.0, 3.45, "#8bb7ff");
  addLabel("家政储物 4㎡", 4.12, 3.45, "#8bb7ff");
  addLabel("南向露台", -3.0, -5.82, "#9ae6b4");
  addDimensionLine();
}

function addEnvironment() {
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x182235, roughness: 0.92 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(38, 38), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.09;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(22, 22, 0x2fb8ec, 0x27364f);
  grid.position.y = 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.34;
  scene.add(grid);

  const hemisphere = new THREE.HemisphereLight(0xb8dcff, 0x1d2330, 1.55);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight(0xffffff, 3.4);
  sun.position.set(-5.5, 9.5, -4.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  scene.add(sun);

  const fill = new THREE.PointLight(0x62d8ff, 34, 24);
  fill.position.set(4, 4, 6);
  scene.add(fill);
}

function resizeRenderer() {
  const { clientWidth, clientHeight } = renderer.domElement;
  if (renderer.domElement.width !== clientWidth || renderer.domElement.height !== clientHeight) {
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }
}

function bindControls() {
  const resetButton = document.querySelector("#reset-view");
  const roofButton = document.querySelector("#toggle-roof");
  const wallsButton = document.querySelector("#toggle-walls");
  const labelsButton = document.querySelector("#toggle-labels");

  resetButton.addEventListener("click", () => {
    camera.position.set(9, 7.2, 10.5);
    controls.target.set(0, 1.1, 0);
    controls.update();
  });

  roofButton.addEventListener("click", () => {
    roofGroup.visible = !roofGroup.visible;
    roofButton.textContent = roofGroup.visible ? "隐藏屋顶" : "显示屋顶";
    roofButton.setAttribute("aria-pressed", String(!roofGroup.visible));
  });

  wallsButton.addEventListener("click", () => {
    materials.wall.opacity = materials.wall.opacity > 0.5 ? 0.34 : 0.92;
    wallsButton.textContent = materials.wall.opacity > 0.5 ? "半透明墙体" : "恢复墙体";
    wallsButton.setAttribute("aria-pressed", String(materials.wall.opacity <= 0.5));
  });

  labelsButton.addEventListener("click", () => {
    labelGroup.visible = !labelGroup.visible;
    labelsButton.textContent = labelGroup.visible ? "隐藏标注" : "显示标注";
    labelsButton.setAttribute("aria-pressed", String(!labelGroup.visible));
  });
}

function animate() {
  resizeRenderer();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

addEnvironment();
buildHouse();
bindControls();
animate();
}
