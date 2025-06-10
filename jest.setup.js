// Jest setup file for Metal Gate Configurator
// Mock Three.js and other global dependencies

// Mock Three.js
global.THREE = {
  Scene: class Scene {
    constructor() {
      this.children = [];
      this.add = (child) => this.children.push(child);
    }
  },
  WebGLRenderer: class WebGLRenderer {
    constructor() {
      this.domElement = document.createElement('canvas');
    }
    setSize() {}
    render() {}
  },
  PerspectiveCamera: class PerspectiveCamera {
    constructor() {
      this.position = { set: () => {} };
      this.lookAt = () => {};
    }
  },
  OrbitControls: class OrbitControls {
    constructor() {
      this.enableRotate = true;
      this.enablePan = true;
      this.minPolarAngle = Math.PI / 2;
      this.maxPolarAngle = Math.PI / 2;
      this.minDistance = 5;
      this.maxDistance = 20;
      this.enableDamping = true;
      this.dampingFactor = 0.05;
    }
    update() {}
  },
  GridHelper: class GridHelper {
    constructor() {
      this.position = { y: 0 };
    }
  },
  AmbientLight: class AmbientLight {
    constructor() {}
  },
  DirectionalLight: class DirectionalLight {
    constructor() {
      this.position = { set: () => {} };
      this.castShadow = true;
      this.shadow = {
        mapSize: { width: 1024, height: 1024 },
        camera: { near: 0.5, far: 50, left: -10, right: 10, top: 10, bottom: -10 }
      };
    }
  },
  Color: class Color {
    constructor() {}
  },
  Group: class Group {
    constructor() {
      this.children = [];
      this.add = (child) => this.children.push(child);
    }
  },
  BoxGeometry: class BoxGeometry {
    constructor(width, height, depth) {
      this.type = 'BoxGeometry';
      this.parameters = { width, height, depth };
    }
  },
  Mesh: class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.position = { set: () => {} };
      this.rotation = { set: () => {} };
      this.scale = { set: () => {} };
      this.castShadow = true;
      this.receiveShadow = true;
    }
  },
  MeshStandardMaterial: class MeshStandardMaterial {
    constructor(params) {
      this.map = params.map;
      this.normalMap = params.normalMap;
      this.roughnessMap = params.roughnessMap;
      this.aoMap = params.aoMap;
    }
  },
  Texture: class Texture {
    constructor() {
      this.needsUpdate = true;
    }
  },
  ArrowHelper: class ArrowHelper {
    constructor() {
      this.visible = false;
      this.position = { set: () => {} };
    }
    setLength() {}
    setDirection() {}
  },
  Vector3: class Vector3 {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }
};

// Mock jsPDF
global.jsPDF = {
  jsPDF: class jsPDF {
    constructor() {
      this.pages = [];
    }
    addPage() {
      this.pages.push({});
    }
    setFontSize() {}
    text() {}
    save() {}
  }
};

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1920,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1080,
});

// Mock performance API
global.performance = {
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

// Mock console for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock HTMLCanvasElement.getContext for jsdom (so canvas tests pass)
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function(type) {
    // Return a minimal mock context
    return {
      fillStyle: '',
      fillRect: function() {},
      getImageData: function() { return { data: [] }; },
      putImageData: function() {},
      createLinearGradient: function() { return { addColorStop: function() {} }; },
      getContextAttributes: function() { return {}; },
      measureText: function() { return { width: 0 }; },
      beginPath: function() {},
      moveTo: function() {},
      lineTo: function() {},
      closePath: function() {},
      stroke: function() {},
      arc: function() {},
      save: function() {},
      restore: function() {},
      translate: function() {},
      scale: function() {},
      rotate: function() {},
      clearRect: function() {},
      drawImage: function() {},
      rect: function() {},
      clip: function() {},
      // ...add more as needed
    };
  };
} 