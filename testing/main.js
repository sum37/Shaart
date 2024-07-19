import * as THREE from 'three';

let scene, camera, renderer;
let line, lineMaterial, lineGeometry;
let mouse = new THREE.Vector2();

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 선의 색상을 빨간색으로 변경
  lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ]);
  line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);

  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function onMouseMove(event) {
  event.preventDefault();
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  let vector = new THREE.Vector3(mouse.x, mouse.y, -1).unproject(camera);
  
  lineGeometry.setFromPoints([
    new THREE.Vector3(0, 0, 0),
    vector
  ]);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
