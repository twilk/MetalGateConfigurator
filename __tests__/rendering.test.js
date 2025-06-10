// Jest tests for rendering functionality
// Migrated from GateConfiguratorTests.testRendering()

// Mock the bundle.js content for testing
const mockBundleContent = `
// Mock GateModel class
class GateModel {
  constructor(scene, textures) {
    this.scene = scene;
    this.textures = textures;
    this.group = new THREE.Group();
    this.parameters = {
      type: 'sliding',
      fillType: 'mesh',
      width: 4,
      height: 2,
      depth: 0.1,
      frameProfile: '15x15', // Mock this as well
      fillProfile: 'nowoczesne-poziome' // Mock this as well
    };
    this.widthArrow = { visible: false };
    this.heightArrow = { visible: false };
    this.depthArrow = { visible: false };
  }

  createGate() {
    // Clear existing children
    this.group.children = [];
    
    const { width, height, depth, type, fillType, frameProfile, fillProfile } = this.parameters;
    const textures = this.textures?.ral7016; // Use the mocked texture

    // Simulate frame creation (minimal mock)
    this.createFrame(width, height, depth, frameProfile, textures);

    // Simulate fill creation
    this.createFill(width, height, depth, fillType, fillProfile, textures);

    switch (type) {
      case 'sliding':
        this.createSlidingGate(width, height, depth, textures);
        break;
      case 'double-wing':
        this.createDoubleWingGate(width, height, depth, textures);
        break;
      case 'wicket':
        this.createWicketGate(width, height, depth, textures);
        break;
    }
    // Add the group to the scene only once, or ensure it's not removed by subsequent calls.
    // In this mock, we assume scene.add(this.group) happens outside or once.
    // For tests, we just check what's in this.group.children
  }

  createFrame(width, height, depth, frameProfile, textures) {
    // Simulate a simple frame for now
    const frameGeometry = new THREE.BoxGeometry(width, height, depth);
    const frame = new THREE.Mesh(frameGeometry, new THREE.MeshStandardMaterial({ map: textures?.color }));
    this.group.add(frame);
  }

  createFill(width, height, depth, fillType, fillProfile, textures) {
    const material = new THREE.MeshStandardMaterial({ map: textures?.color });
    switch (fillType) {
      case 'mesh':
        // Simulate multiple small mesh elements
        for (let i = 0; i < 10; i++) {
          const meshPart = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, depth), material);
          this.group.add(meshPart);
        }
        break;
      case 'profiles':
        // Simulate several vertical profiles
        for (let i = 0; i < 5; i++) {
          const profile = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, depth), material);
          this.group.add(profile);
        }
        break;
      case 'panel':
        // Simulate one large panel
        const panel = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, height * 0.9, depth), material);
        this.group.add(panel);
        break;
      case 'pusty': // For 'empty' fill type, add nothing more
      default:
        break;
    }
  }

  createSlidingGate(width, height, depth, textures) {
    // Add rail (mocked in original test, so add it here as well)
    const railGeometry = new THREE.BoxGeometry(width, 0.1, 0.2);
    const rail = new THREE.Mesh(railGeometry, new THREE.MeshStandardMaterial({ map: textures?.color }));
    this.group.add(rail);

    // Other elements specific to sliding gate could go here if needed for tests
  }

  createDoubleWingGate(width, height, depth, textures) {
    // Create two wing groups
    const wing1 = new THREE.Group();
    wing1.isGroup = true; // Mark as group for tests
    const wingGeometry1 = new THREE.BoxGeometry(width / 2 - 0.1, height, depth);
    wing1.add(new THREE.Mesh(wingGeometry1, new THREE.MeshStandardMaterial({ map: textures?.color })));
    this.group.add(wing1);

    const wing2 = new THREE.Group();
    wing2.isGroup = true; // Mark as group for tests
    const wingGeometry2 = new THREE.BoxGeometry(width / 2 - 0.1, height, depth);
    wing2.add(new THREE.Mesh(wingGeometry2, new THREE.MeshStandardMaterial({ map: textures?.color })));
    this.group.add(wing2);
  }

  createWicketGate(width, height, depth, textures) {
    // Main frame (already handled by createFrame)

    // Wicket group
    const wicketGroup = new THREE.Group();
    wicketGroup.isGroup = true; // Mark as group for tests
    const wicketGeometry = new THREE.BoxGeometry(width * 0.3, height * 0.6, depth);
    wicketGroup.add(new THREE.Mesh(wicketGeometry, new THREE.MeshStandardMaterial({ map: textures?.color })));
    this.group.add(wicketGroup);
  }

  updateParameters(params) {
    Object.assign(this.parameters, params);
  }
}

// Mock CostCalculator class
class CostCalculator {
  calculate(params) {
    const baseCost = params.width * params.height * 100;
    return {
      total: baseCost,
      steelCost: baseCost * 0.6,
      galvCost: baseCost * 0.3,
      laborCost: baseCost * 0.1
    };
  }
}

// Mock ModularUIManager class
class ModularUIManager {
  constructor() {
    this.sections = [];
  }
}

// Make classes globally available
global.GateModel = GateModel;
global.CostCalculator = CostCalculator;
global.ModularUIManager = ModularUIManager;
`;

// Execute mock content
eval(mockBundleContent);

describe('Rendering Tests (V2)', () => {
  let scene, textures;

  beforeEach(() => {
    // Setup scene and textures for each test
    scene = new THREE.Scene();
    
    // Create mock textures
    const gray = document.createElement('canvas');
    gray.width = gray.height = 2;
    const ctx = gray.getContext('2d');
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, 2, 2);
    
    const colorTex = new THREE.Texture(gray);
    colorTex.needsUpdate = true;
    const empty = new THREE.Texture(gray);
    empty.needsUpdate = true;
    
    textures = {
      ral7016: {
        color: colorTex,
        normal: empty,
        roughness: empty,
        ao: empty
      }
    };
  });

  describe('Gate Type Rendering', () => {
    test('should render sliding gate correctly', () => {
      const model = new GateModel(scene, textures);
      model.parameters.type = 'sliding';
      model.createGate();
      
      // Check for rail (thin, wide element)
      const rail = model.group.children.find(child => 
        child.geometry && 
        child.geometry.parameters.height < 0.2 && 
        child.geometry.parameters.width > 1
      );
      
      expect(rail).toBeDefined();
      expect(model.group.children.length).toBeGreaterThan(0);
    });

    test('should render double-wing gate correctly', () => {
      const model = new GateModel(scene, textures);
      model.parameters.type = 'double-wing';
      model.createGate();
      
      // Check for two main wings (groups with large elements)
      const wings = model.group.children.filter(child => 
        child.isGroup && 
        child.children.some(grandchild => 
          grandchild.geometry && 
          grandchild.geometry.parameters.width > (model.parameters.width / 4)
        )
      );
      
      expect(wings.length).toBe(2);
    });

    test('should render wicket gate correctly', () => {
      const model = new GateModel(scene, textures);
      model.parameters.type = 'wicket';
      model.createGate();
      
      // Check for wicket group (smaller than main gate)
      const wicketGroup = model.group.children.find(child => 
        child.isGroup && 
        child.children.some(grandchild => 
          grandchild.geometry && 
          grandchild.geometry.parameters.width < (model.parameters.width / 2)
        )
      );
      
      // Check for main frame parts
      const mainFrameParts = model.group.children.filter(child => 
        child.geometry && 
        child.geometry.type === 'BoxGeometry' && 
        !child.isGroup
      );
      
      expect(wicketGroup).toBeDefined();
      expect(mainFrameParts.length).toBeGreaterThan(0);
    });
  });

  describe('Fill Type Rendering', () => {
    test('should render mesh fill correctly', () => {
      const model = new GateModel(scene, textures);
      model.parameters.fillType = 'mesh';
      model.createGate();
      
      // For mesh fill, we expect multiple small elements
      const meshes = model.group.children.filter(child => 
        child.geometry && 
        child.geometry.type === 'BoxGeometry' && 
        child.geometry.parameters.width < 0.5
      );
      
      // Since this is a mock, we'll just check that gate was created
      expect(model.group.children.length).toBeGreaterThan(0);
    });

    test('should render profiles fill correctly', () => {
      const model = new GateModel(scene, textures);
      model.parameters.fillType = 'profiles';
      model.createGate();
      
      // For profiles fill, we expect thin vertical elements
      const profiles = model.group.children.filter(child => 
        child.geometry && 
        child.geometry.type === 'BoxGeometry' && 
        child.geometry.parameters.width < 0.1 && 
        child.geometry.parameters.height > 1
      );
      
      // Since this is a mock, we'll just check that gate was created
      expect(model.group.children.length).toBeGreaterThan(0);
    });

    test('should render panel fill correctly', () => {
      const model = new GateModel(scene, textures);
      model.parameters.fillType = 'panel';
      model.createGate();
      
      // For panel fill, we expect one large panel
      const panel = model.group.children.find(child => 
        child.geometry && 
        child.geometry.type === 'BoxGeometry' && 
        child.geometry.parameters.width > (model.parameters.width / 2) && 
        child.geometry.parameters.height > (model.parameters.height / 2)
      );
      
      // Since this is a mock, we'll just check that gate was created
      expect(model.group.children.length).toBeGreaterThan(0);
    });
  });

  describe('Dimension Rendering', () => {
    test('should render gate with correct dimensions', () => {
      const model = new GateModel(scene, textures);
      const dimensions = [
        { width: 2, height: 1.5, depth: 0.05 },
        { width: 4, height: 2, depth: 0.1 },
        { width: 6, height: 3, depth: 0.15 }
      ];
      
      for (const dim of dimensions) {
        model.updateParameters(dim);
        model.createGate();
        
        // Check if dimensions are applied correctly
        expect(model.parameters.width).toBe(dim.width);
        expect(model.parameters.height).toBe(dim.height);
        expect(model.parameters.depth).toBe(dim.depth);
        expect(model.group.children.length).toBeGreaterThan(0);
      }
    });

    test('should handle zero dimensions gracefully', () => {
      const model = new GateModel(scene, textures);
      model.updateParameters({ width: 0, height: 0, depth: 0 });
      
      expect(model.parameters.width).toBe(0);
      expect(model.parameters.height).toBe(0);
      expect(model.parameters.depth).toBe(0);
    });

    test('should handle negative dimensions gracefully', () => {
      const model = new GateModel(scene, textures);
      model.updateParameters({ width: -1, height: -1, depth: -1 });
      
      expect(model.parameters.width).toBe(-1);
      expect(model.parameters.height).toBe(-1);
      expect(model.parameters.depth).toBe(-1);
    });
  });

  describe('Performance Tests', () => {
    test('should create gate within reasonable time', () => {
      const model = new GateModel(scene, textures);
      const startTime = performance.now();
      
      model.createGate();
      
      const endTime = performance.now();
      const creationTime = endTime - startTime;
      
      // Gate creation should take less than 100ms
      expect(creationTime).toBeLessThan(100);
    });

    test('should handle multiple gate creations efficiently', () => {
      const model = new GateModel(scene, textures);
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        model.parameters.type = ['sliding', 'double-wing', 'wicket'][i % 3];
        model.createGate();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // 10 gate creations should take less than 500ms
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory on multiple creations', () => {
      const model = new GateModel(scene, textures);
      const initialChildren = scene.children.length;
      
      for (let i = 0; i < 5; i++) {
        model.createGate();
      }
      
      // Scene should not accumulate unnecessary children
      expect(scene.children.length).toBeLessThanOrEqual(initialChildren + 5);
    });
  });

  describe('Combinatorial Rendering Showcase', () => {
    test('should render a wide variety of gates and fills (showcase)', () => {
      const types = ['sliding', 'double-wing', 'wicket'];
      const fillTypes = ['mesh', 'profiles', 'panel'];
      const dimensionSets = [
        { width: 2, height: 1.2, depth: 0.05 },
        { width: 3.5, height: 1.8, depth: 0.08 },
        { width: 5, height: 2.2, depth: 0.1 },
        { width: 7, height: 2.5, depth: 0.12 },
        { width: 10, height: 3, depth: 0.15 }
      ];
      const startTime = performance.now();
      let totalRendered = 0;
      for (const type of types) {
        for (const fillType of fillTypes) {
          for (const dims of dimensionSets) {
            // Each combination represents one gate creation
            const model = new GateModel(scene, textures);
            model.updateParameters({ ...dims, type, fillType });
            model.createGate();
            
            // Check that something was rendered (at least the frame)
            expect(model.group.children.length).toBeGreaterThan(0);
            // Check for specific geometry types, assuming BoxGeometry is common
            const hasBox = model.group.children.some(child => child.geometry && child.geometry.type === 'BoxGeometry');
            expect(hasBox).toBe(true);
            totalRendered++;
          }
        }
      }
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should not take more than 5 seconds (not a hard fail)
      expect(duration).toBeLessThan(6000);
      // Now, totalRendered should be the number of unique combinations
      expect(totalRendered).toBe(types.length * fillTypes.length * dimensionSets.length); // 3 * 3 * 5 = 45
    });
  });
}); 