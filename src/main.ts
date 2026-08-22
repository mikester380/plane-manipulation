import { Renderer, Plane, Program, Mesh, Transform, Camera } from "ogl";
import "./style.css";

const renderer = new Renderer({
  dpr: window.devicePixelRatio,
  width: window.innerWidth,
  height: window.innerHeight,
});

const gl = renderer.gl;
gl.clearColor(1, 1, 1, 1);

document.body.appendChild(gl.canvas);

const foldedPlane = new Plane(gl, {
  width: 2,
  height: 3,
  widthSegments: 100,
  heightSegments: 100,
});

const wavyPlane = new Plane(gl, {
  width: 4,
  height: 2.3,
  widthSegments: 100,
  heightSegments: 100,
});

const foldedPlaneProgram = new Program(gl, {
  cullFace: false,
  vertex: `
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
      // radius
      float r = 1.5;
      // copy position
      vec3 pos = position;

      float angle = pos.y / r;
      pos.y = sin(angle) * r;
      pos.z = r - (cos(angle) * r);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragment: `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
    }
  `,
});

const wavyPlaneProgram = new Program(gl, {
  uniforms: {
    time: { value: 0.0 },
  },
  vertex: `
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float time;

    float PI = 3.14159265359;

    void main() {
      // copy position
      vec3 pos = position;

      // wave equation
      // y = A * sin(kx - wt);

      float oneCycle = PI*2.0;
      float waveLength = 2.0;
      float amplitude = 0.07;
      float frequency = 1.0;

      pos.y += amplitude * sin( 
        (oneCycle * pos.x/waveLength) -
        (oneCycle * frequency) * time
      );

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragment: `
    precision mediump float;

    uniform vec2 uMouse;

    void main() {
      gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
    }
  `,
});

const foldedPlaneMesh = new Mesh(gl, {
  geometry: foldedPlane,
  program: foldedPlaneProgram,
});
foldedPlaneMesh.position.set(0, 1.8);

const wavyPlaneMesh = new Mesh(gl, {
  geometry: wavyPlane,
  program: wavyPlaneProgram,
});
wavyPlaneMesh.position.set(0, -1.8);

const scene = new Transform();
foldedPlaneMesh.setParent(scene);
wavyPlaneMesh.setParent(scene);

const camera = new Camera(gl, {
  fov: 38,
  aspect: renderer.width / renderer.height,
});
camera.position.z = 12;

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({ aspect: renderer.width / renderer.height });
  renderer.render({ scene, camera });
});

function render(time: number) {
  // for folded plane
  foldedPlaneMesh.rotation.y += 0.01;

  // for wavy plane
  wavyPlaneProgram.uniforms.time.value = time / 1000;

  renderer.render({ scene, camera });
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
