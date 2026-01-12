import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const colorsTable = Object.values(THREE.Color.NAMES).filter( (c) => c > 0);
const materialsTable = colorsTable.map(c => new THREE.MeshLambertMaterial({color: c}));

const global = {
    toRender: null,
    models: null,
    geometry: null,
    camera: null,
    renderer: null,
    distance: 1,

    resizeObserver: null,
    controls: null
}

function animate( time ) {
    global.controls.update()
    global.renderer.render( global.toRender, global.camera );
}

function HandleWindowSize(width, height) {
    global.renderer.setSize(width, height);
    global.camera.aspect = width/height;
    global.camera.updateProjectionMatrix();
}

function InitGlobal(rootElement, width, height, radius, distance) {
    global.toRender = new THREE.Scene();
    global.models = new THREE.Group()
    global.toRender.add(global.models);
    global.geometry = new THREE.SphereGeometry(radius)
    global.camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, distance*10 );
    global.camera.position.z = distance * 5;
    global.distance = distance;
    global.renderer = new THREE.WebGLRenderer( { antialias: true } );
    
    const light1 = new THREE.DirectionalLight(0xffffff)
    light1.position.y = distance*2;
    global.toRender.add(light1);
    const light2 = new THREE.DirectionalLight(0x808080)
    light2.position.x = distance*2;
    global.toRender.add(light2);

    HandleWindowSize(width, height);
    global.renderer.setAnimationLoop( animate );
    global.controls = new OrbitControls(global.camera, rootElement)
    global.controls.update()
}

export function Init3D(rootId, radius = 1, distance = 1) {
    const root = document.getElementById(rootId);
    InitGlobal(root, root.innerWidth, root.innerHeight, radius, distance);
    root.appendChild( global.renderer.domElement );

    global.resizeObserver = new ResizeObserver(
        entries => HandleWindowSize(entries[0].target.clientWidth, entries[0].target.clientHeight)
        );
    global.resizeObserver.observe(root)
}

function AddMesh(position, mesh, materialIndex) {
    if (!mesh) {
        mesh = new THREE.Mesh( global.geometry);
        global.models.add( mesh );
    }
    mesh.material = materialsTable[materialIndex % materialsTable.length]
    mesh.position.set(global.distance*position.x, global.distance*position.y, global.distance*position.z);
}

const PositionPhiIncrement = Math.PI * (3 - Math.sqrt(5));

function GeneratePositions (n) {
    let result = new Array(n)
    const offset = 2 / n
    const halhOffset = offset / 2
    
    let x, y, z, r, phi
    for (let i = 0; i < n; ++i) {
      y = (i * offset - 1) + halhOffset
      r = Math.sqrt(1 - y * y)
      phi = i * PositionPhiIncrement
      x = Math.cos(phi) * r
      z = Math.sin(phi) * r
      result[i] = new THREE.Vector3(x, y, z)
    }
    return result
  } 

export function SetCount(count) {
    const models = global.models;

    while (models.children.length > count)
        models.remove(models.children[0]);

    const positions = GeneratePositions(count);

    for(let i = 0; i < count; i++) {
        AddMesh(positions[i], models.children[i], i)
    }
}

