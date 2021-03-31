const canvas = document.createElement('canvas');
canvas.width = 300
canvas.height = 300
canvas.style.border = '2px solid black'

document.body.appendChild(canvas)

const points = [
  [-1, 1, 1, 1],
  [ 1, 1, 1, 1],
  [-1,-1, 1, 1],
  [ 1,-1, 1, 1],
  [-1, 1,-1, 1],
  [ 1, 1,-1, 1],
  [-1,-1,-1, 1],
  [ 1,-1,-1, 1],
]

const obj = [
  // Face 01
  [points[0], points[1], points[3], points[2]],
  // Face 02
  [points[4], points[5], points[7], points[6]],
  // Face 03
  [points[0], points[4], points[5], points[1]],
  // Face 04
  [points[1], points[5], points[7], points[3]],
  // Face 05
  [points[0], points[4], points[6], points[2]],
  // Face 06
  [points[2], points[6], points[7], points[3]],
]

const makeIdentityMatrix = () => ([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
])

// https://mdn.github.io/webgl-examples/tutorial/gl-matrix.js
function mMultiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

  // Cache only the current line of the second matrix
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}

const matrix4MultiplyVector4 = (m, v) => ([
  m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
  m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
  m[2] * v[0] + m[6] * v[1] + m[10]* v[2] + m[14] * v[3],
  m[3] * v[0] + m[7] * v[1] + m[11]* v[2] + m[15] * v[3],
])

const vector3Length = (vector) => Math.sqrt(
  vector[0] *
  vector[0] + vector[1] *
  vector[1] + vector[2] *
  vector[2]
)

const vector3Normalize = (vector) => {
  const vlength = vector3Length(vector)
  const scale = vlength === 0 ? 0 : 1.0 / vlength
  vector[0] *= scale
  vector[1] *= scale
  vector[2] *= scale
  return vector
}

function mTransformMat4(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}

function mTranslate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00 = void 0,
      a01 = void 0,
      a02 = void 0,
      a03 = void 0;
  var a10 = void 0,
      a11 = void 0,
      a12 = void 0,
      a13 = void 0;
  var a20 = void 0,
      a21 = void 0,
      a22 = void 0,
      a23 = void 0;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
    a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
    a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

    out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
    out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
    out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;

    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}

function mScale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];

  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

function mRotate(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.sqrt(x * x + y * y + z * z);
  var s = void 0,
      c = void 0,
      t = void 0;
  var a00 = void 0,
      a01 = void 0,
      a02 = void 0,
      a03 = void 0;
  var a10 = void 0,
      a11 = void 0,
      a12 = void 0,
      a13 = void 0;
  var a20 = void 0,
      a21 = void 0,
      a22 = void 0,
      a23 = void 0;
  var b00 = void 0,
      b01 = void 0,
      b02 = void 0;
  var b10 = void 0,
      b11 = void 0,
      b12 = void 0;
  var b20 = void 0,
      b21 = void 0,
      b22 = void 0;

  if (Math.abs(len) < 0.000001) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;

  a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
  a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
  a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

  // Construct the elements of the rotation matrix
  b00 = x * x * t + c;b01 = y * x * t + z * s;b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;b11 = y * y * t + c;b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;b21 = y * z * t - x * s;b22 = z * z * t + c;

  // Perform rotation-specific matrix multiplication
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}

function mPerspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2);
  var nf = 1 / (near - far);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;
  return out;
}

function mCreate() {
  var out = new Array(9);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}

const degreesToRadians = (degrees) => (degrees * Math.PI / 180)

const colors = [
  'rgba(0, 0, 0, 0.2)',
  'rgba(255, 0, 0, 0.2)',
  'rgba(0, 255, 0, 0.2)',
  'rgba(0, 0, 255, 0.2)',
  'rgba(255, 255, 0, 0.2)',
  'rgba(255, 0, 255, 0.2)',
  'rgba(0, 255, 255, 0.2)',
  'rgba(255, 255, 255, 0.2)',
]
function render (canvas, obj, modelViewMatrix, projectionMatrix, viewportMatrix) {
  let mat = makeIdentityMatrix()
  mat = mMultiply(mat, projectionMatrix, modelViewMatrix)
  
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  obj.forEach((triangle, colorId) => {
    ctx.beginPath();
    triangle.forEach((vec, index) => {
      let point = mTransformMat4([0, 0, 0, 1], vec, mat)
      point = mTransformMat4(point, point, viewportMatrix)
      const x = point[0]
      const y = point[1]
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    })
    ctx.fillStyle = colors[colorId]
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  })
}

// Model position
let modelMatrix = makeIdentityMatrix()
// modelMatrix = mScale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5])

// Camera Position
let viewMatrix = makeIdentityMatrix()
viewMatrix = mTranslate(viewMatrix, viewMatrix, [0, 0, -6])

// ModelView
let modelViewMatrix = makeIdentityMatrix()
modelViewMatrix = mMultiply(modelViewMatrix, viewMatrix, modelMatrix)

// Projection
let projectionMatrix = makeIdentityMatrix()
projectionMatrix = mPerspective(projectionMatrix, degreesToRadians(45), 1, 1, 150)

// Viewport
let viewportMatrix = makeIdentityMatrix()
viewportMatrix = mTranslate(viewportMatrix, viewportMatrix, [canvas.width / 2, canvas.height / 2, 0])
viewportMatrix = mScale(viewportMatrix, viewportMatrix, [canvas.width / 2, -canvas.width / 2, canvas.width / 2])

let count = 0
const interval = setInterval(() => {
  count = (count + 1) % 361
  const rad = degreesToRadians(count)
  modelMatrix = makeIdentityMatrix()
  mRotate(modelMatrix, modelMatrix, rad, [0.5, 1, 1])
  
  modelViewMatrix = makeIdentityMatrix()
  modelViewMatrix = mMultiply(modelViewMatrix, viewMatrix, modelMatrix)
  
  render(canvas, obj, modelViewMatrix, projectionMatrix, viewportMatrix)
}, 1000 / 60)

