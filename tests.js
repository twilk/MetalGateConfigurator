// Test suite for DBT Metal Gate Configurator
class GateConfiguratorTests {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAll() {
    console.log('Starting QA tests...');
    
    // Test rendering
    await this.testRendering();
    
    // Test UI
    await this.testUI();
    
    // Test cost calculations
    await this.testCostCalculations();
    
    // Print results
    console.log(`\nTest results: ${this.passed} passed, ${this.failed} failed`);
  }

  async testRendering() {
    console.log('\nTesting rendering...');
    
    // Test all gate types
    const types = ['sliding', 'double-wing', 'wicket'];
    for (const type of types) {
      await this.testGateType(type);
    }
    
    // Test all fill types
    const fillTypes = ['mesh', 'profiles', 'panel'];
    for (const fillType of fillTypes) {
      await this.testFillType(fillType);
    }
    
    // Test dimensions
    await this.testDimensions();
  }

  async testGateType(type) {
    // Utwórz własną scenę i textures (szary placeholder)
    const scene = new THREE.Scene();
    const gray = document.createElement('canvas');
    gray.width = gray.height = 2;
    const ctx = gray.getContext('2d');
    ctx.fillStyle = '#444';
    ctx.fillRect(0,0,2,2);
    const colorTex = new THREE.Texture(gray); colorTex.needsUpdate = true;
    const empty = new THREE.Texture(gray); empty.needsUpdate = true;
    const textures = { ral7016: { color: colorTex, normal: empty, roughness: empty, ao: empty } };
    // Przekaż textures do GateModel
    const model = new GateModel(scene, textures);
    model.parameters.type = type;
    model.createGate();
    
    let condition = false;
    let message = `Gate type ${type} should be rendered correctly`;

    switch (type) {
      case 'sliding':
        const rail = model.group.children.find(child => 
          child.geometry.parameters.height < 0.2 && child.geometry.parameters.width > 1 
        );
        condition = rail !== undefined;
        break;
      case 'double-wing':
        // Szukaj dwóch głównych skrzydeł (dużych, z materiałem ramowym)
        const wings = model.group.children.filter(child => 
          child.isGroup && child.children.some(grandchild => 
            grandchild.geometry.type === 'BoxGeometry' && 
            grandchild.geometry.parameters.width > (model.parameters.width / 4) 
          )
        );
        condition = wings.length === 2;
        break;
      case 'wicket':
        // Szukaj grupy furtki wewnątrz głównej bramy
        const wicketGroup = model.group.children.find(child => 
          child.isGroup && child.children.some(grandchild => 
            grandchild.geometry.type === 'BoxGeometry' && 
            grandchild.geometry.parameters.width < (model.parameters.width / 2) 
          )
        );
        const mainFrameParts = model.group.children.filter(child => 
          child.geometry && child.geometry.type === 'BoxGeometry' && !child.isGroup
        );
        condition = wicketGroup !== undefined && mainFrameParts.length >= 3; // Lewa, prawa, góra ramy
        break;
      default:
        condition = model.group.children.length > 0;
        break;
    }
    this.assert(condition, message);
  }

  async testFillType(fillType) {
    // Utwórz własną scenę i textures (szary placeholder)
    const scene = new THREE.Scene();
    const gray = document.createElement('canvas');
    gray.width = gray.height = 2;
    const ctx = gray.getContext('2d');
    ctx.fillStyle = '#444';
    ctx.fillRect(0,0,2,2);
    const colorTex = new THREE.Texture(gray); colorTex.needsUpdate = true;
    const empty = new THREE.Texture(gray); empty.needsUpdate = true;
    const textures = { ral7016: { color: colorTex, normal: empty, roughness: empty, ao: empty } };
    // Przekaż textures do GateModel
    const model = new GateModel(scene, textures);
    model.parameters.fillType = fillType;
    model.createGate();
    
    let condition = false;
    let message = `Fill type ${fillType} should be rendered correctly`;

    // Check if fill was created
    switch (fillType) {
      case 'mesh':
        // Sprawdź, czy istnieje wiele małych elementów wypełnienia
        const meshes = model.group.children.filter(child => 
          child.geometry && child.geometry.type === 'BoxGeometry' && 
          child.geometry.parameters.width < 0.5
        );
        condition = meshes.length > 5; // Oczekujemy kilku elementów siatki
        break;
      case 'profiles':
        // Sprawdź, czy istnieje wiele cienkich, pionowych profili
        const profiles = model.group.children.filter(child => 
          child.geometry && child.geometry.type === 'BoxGeometry' && 
          child.geometry.parameters.width < 0.1 && 
          child.geometry.parameters.height > 1
        );
        condition = profiles.length > 3; // Oczekujemy kilku profili
        break;
      case 'panel':
        // Sprawdź, czy istnieje jeden duży panel
        const panel = model.group.children.find(child => 
          child.geometry && child.geometry.type === 'BoxGeometry' && 
          child.geometry.parameters.width > (model.parameters.width / 2) && 
          child.geometry.parameters.height > (model.parameters.height / 2)
        );
        condition = panel !== undefined;
        break;
      default:
        condition = model.group.children.length > 0;
        break;
    }
    
    this.assert(condition, message);
  }

  async testDimensions() {
    // Utwórz własną scenę i textures (szary placeholder)
    const scene = new THREE.Scene();
    const gray = document.createElement('canvas');
    gray.width = gray.height = 2;
    const ctx = gray.getContext('2d');
    ctx.fillStyle = '#444';
    ctx.fillRect(0,0,2,2);
    const colorTex = new THREE.Texture(gray); colorTex.needsUpdate = true;
    const empty = new THREE.Texture(gray); empty.needsUpdate = true;
    const textures = { ral7016: { color: colorTex, normal: empty, roughness: empty, ao: empty } };
    const model = new GateModel(scene, textures);
    const dimensions = [
      { width: 2, height: 1.5, depth: 0.05 },
      { width: 4, height: 2, depth: 0.1 },
      { width: 6, height: 3, depth: 0.15 }
    ];
    
    for (const dim of dimensions) {
      model.updateParameters(dim);
      
      // Check if dimensions match
      const frame = model.group.children[0];
      this.assert(
        Math.abs(frame.geometry.parameters.width - dim.width) < 0.01 &&
        Math.abs(frame.geometry.parameters.height - dim.height) < 0.01 &&
        Math.abs(frame.geometry.parameters.depth - dim.depth) < 0.01,
        `Gate dimensions should match ${JSON.stringify(dim)}`
      );
    }
  }

  async testUI() {
    console.log('\nTesting UI...');
    
    // Test sliders
    await this.testSliders();
    
    // Test dropdowns
    await this.testDropdowns();
    
    // Test cost display
    await this.testCostDisplay();

    // Test PDF button
    await this.testPDFButton();
  }

  async testSliders() {
    // Użyj globalnych instancji do testowania UI
    const model = window.mainModel;
    const calc = window.mainCostCalculator;
    const ui = window.mainUIManager;

    if (!model || !calc || !ui) {
      this.assert(false, 'Global UI instances not available for testSliders');
      return;
    }

    const sliders = document.querySelectorAll('#parameters input[type="range"]');
    
    // Test width slider
    const widthSlider = sliders[0];
    if (!widthSlider) {
      this.assert(false, 'Width slider not found');
      return;
    }
    widthSlider.value = 5;
    widthSlider.dispatchEvent(new Event('input'));
    this.assert(
      Math.abs(model.parameters.width - 5) < 0.01,
      'Width slider should update model'
    );
    
    // Test height slider
    const heightSlider = sliders[1];
    if (!heightSlider) {
      this.assert(false, 'Height slider not found');
      return;
    }
    heightSlider.value = 2.5;
    heightSlider.dispatchEvent(new Event('input'));
    this.assert(
      Math.abs(model.parameters.height - 2.5) < 0.01,
      'Height slider should update model'
    );
    
    // Test depth slider
    const depthSlider = sliders[2];
    if (!depthSlider) {
      this.assert(false, 'Depth slider not found');
      return;
    }
    depthSlider.value = 0.15;
    depthSlider.dispatchEvent(new Event('input'));
    this.assert(
      Math.abs(model.parameters.depth - 0.15) < 0.01,
      'Depth slider should update model'
    );

    // Test highlight on focus and blur
    const dimensionMap = {
      0: 'width',
      1: 'height',
      2: 'depth'
    };

    for (let i = 0; i < sliders.length; i++) {
      const slider = sliders[i];
      const dimension = dimensionMap[i];
      if (!slider) continue;

      // Test focus
      slider.focus();
      await new Promise(resolve => setTimeout(resolve, 50)); // Poczekaj na renderowanie
      let isVisible = false;
      if (dimension === 'width') isVisible = model.widthArrow.visible;
      if (dimension === 'height') isVisible = model.heightArrow.visible;
      if (dimension === 'depth') isVisible = model.depthArrow.visible;
      this.assert(isVisible, `Highlight for ${dimension} should be visible on focus`);

      // Test blur
      slider.blur();
      await new Promise(resolve => setTimeout(resolve, 50)); // Poczekaj na renderowanie
      const allHidden = !model.widthArrow.visible && !model.heightArrow.visible && !model.depthArrow.visible;
      this.assert(allHidden, `All highlights should be hidden on blur for ${dimension}`);
    }
  }

  async testDropdowns() {
    // Użyj globalnych instancji do testowania UI
    const model = window.mainModel;
    const calc = window.mainCostCalculator;
    const ui = window.mainUIManager;

    if (!model || !calc || !ui) {
      this.assert(false, 'Global UI instances not available for testDropdowns');
      return;
    }

    const selects = document.querySelectorAll('#parameters select');
    
    // Test gate type dropdown
    const typeSelect = selects[0];
    if (!typeSelect) {
      this.assert(false, 'Gate type dropdown not found');
      return;
    }
    typeSelect.value = 'double-wing';
    typeSelect.dispatchEvent(new Event('change'));
    this.assert(
      model.parameters.type === 'double-wing',
      'Gate type dropdown should update model'
    );
    
    // Test fill type dropdown
    const fillSelect = selects[1];
    if (!fillSelect) {
      this.assert(false, 'Fill type dropdown not found');
      return;
    }
    fillSelect.value = 'profiles';
    fillSelect.dispatchEvent(new Event('change'));
    this.assert(
      model.parameters.fillType === 'profiles',
      'Fill type dropdown should update model'
    );
  }

  async testCostDisplay() {
    // Użyj globalnych instancji do testowania UI
    const model = window.mainModel;
    const calc = window.mainCostCalculator;
    const ui = window.mainUIManager;

    if (!model || !calc || !ui) {
      this.assert(false, 'Global UI instances not available for testCostDisplay');
      return;
    }

    const costDisplay = document.getElementById('cost-display');
    if (!costDisplay) {
      this.assert(false, 'Cost display element not found');
      return;
    }
    
    // Zaktualizuj parametry modelu, co powinno wywołać aktualizację kosztu w UI
    model.updateParameters({ width: 4, height: 2 });
    
    this.assert(
      costDisplay.textContent.includes('PLN'),
      'Cost display should show costs in PLN'
    );
    // Sprawdź, czy aktualizacja faktycznie nastąpiła
    this.assert(
      costDisplay.textContent.includes(calc.calculate(model.parameters).total.toFixed(2)),
      'Cost display should reflect updated total cost'
    );
  }

  async testPDFButton() {
    console.log('Testing PDF generation button...');

    const pdfButton = document.getElementById('pdf-btn');
    if (!pdfButton) {
      this.assert(false, 'PDF button not found');
      return;
    }

    // Mock ExportPDF.generate to check if it's called
    const originalGenerate = window.ExportPDF.prototype.generate;
    let generateCalled = false;
    window.ExportPDF.prototype.generate = function() {
      generateCalled = true;
      // Call original method but prevent actual file save for testing
      // originalGenerate.apply(this, arguments); 
    };

    pdfButton.click();
    await new Promise(resolve => setTimeout(resolve, 100)); // Daj czas na wykonanie eventu

    this.assert(generateCalled, 'PDF generation function should be called when button is clicked');

    // Restore original generate method
    window.ExportPDF.prototype.generate = originalGenerate;
  }

  async testCostCalculations() {
    console.log('\nTesting cost calculations...');
    
    const calc = new CostCalculator();
    
    // Test basic calculation
    const basicCost = calc.calculate({
      width: 4,
      height: 2,
      depth: 0.1,
      type: 'sliding',
      fillType: 'mesh'
    });
    
    this.assert(
      basicCost.total > 0 &&
      basicCost.steelCost > 0 &&
      basicCost.galvCost > 0 &&
      basicCost.laborCost > 0,
      'Basic cost calculation should return positive values'
    );
    
    // Test different gate types
    const types = ['sliding', 'double-wing', 'wicket'];
    for (const type of types) {
      const cost = calc.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type,
        fillType: 'mesh'
      });
      
      this.assert(
        cost.total > 0,
        `Cost calculation for ${type} should return positive value`
      );
    }
    
    // Test different fill types
    const fillTypes = ['mesh', 'profiles', 'panel'];
    for (const fillType of fillTypes) {
      const cost = calc.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType
      });
      
      this.assert(
        cost.total > 0,
        `Cost calculation for ${fillType} should return positive value`
      );
    }
  }

  assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      this.passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      this.failed++;
    }
  }
}

// Run tests when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   const tests = new GateConfiguratorTests();
//   tests.runAll();
// }); 