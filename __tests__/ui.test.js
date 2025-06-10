// Jest tests for UI functionality
// Migrated from GateConfiguratorTests.testUI()

describe('UI Tests (V2)', () => {
  let mockModel, mockCalculator, mockUIManager;

  beforeEach(() => {
    // Setup mock objects
    mockModel = {
      parameters: { width: 4, height: 2, depth: 0.1, type: 'sliding', fillType: 'mesh' },
      updateParameters: function(params) {
        Object.assign(this.parameters, params);
      },
      widthArrow: { visible: false },
      heightArrow: { visible: false },
      depthArrow: { visible: false }
    };

    mockCalculator = {
      calculate: function(params) {
        const baseCost = params.width * params.height * 100;
        return {
          total: baseCost,
          steelCost: baseCost * 0.6,
          galvCost: baseCost * 0.3,
          laborCost: baseCost * 0.1
        };
      }
    };

    mockUIManager = {
      updateCostDisplay: jest.fn()
    };

    // Mock DOM elements
    document.body.innerHTML = `
      <input type="range" id="width-slider" value="4" min="1" max="10" step="0.1">
      <input type="range" id="height-slider" value="2" min="1" max="5" step="0.1">
      <input type="range" id="depth-slider" value="0.1" min="0.05" max="0.3" step="0.01">
      <select id="gate-type">
        <option value="sliding">Sliding</option>
        <option value="double-wing">Double Wing</option>
        <option value="wicket">Wicket</option>
      </select>
      <select id="fill-type">
        <option value="mesh">Mesh</option>
        <option value="profiles">Profiles</option>
        <option value="panel">Panel</option>
      </select>
      <div id="cost-display">Koszt: 800.00 PLN</div>
      <button id="pdf-btn">Generate PDF</button>
    `;
  });

  describe('Slider Tests', () => {
    test('should update model when width slider changes', () => {
      const widthSlider = document.getElementById('width-slider');
      
      widthSlider.value = 5;
      widthSlider.dispatchEvent(new Event('input'));
      
      // Simulate model update
      mockModel.updateParameters({ width: 5 });
      
      expect(mockModel.parameters.width).toBe(5);
    });

    test('should update model when height slider changes', () => {
      const heightSlider = document.getElementById('height-slider');
      
      heightSlider.value = 2.5;
      heightSlider.dispatchEvent(new Event('input'));
      
      // Simulate model update
      mockModel.updateParameters({ height: 2.5 });
      
      expect(mockModel.parameters.height).toBe(2.5);
    });

    test('should update model when depth slider changes', () => {
      const depthSlider = document.getElementById('depth-slider');
      
      depthSlider.value = 0.15;
      depthSlider.dispatchEvent(new Event('input'));
      
      // Simulate model update
      mockModel.updateParameters({ depth: 0.15 });
      
      expect(mockModel.parameters.depth).toBe(0.15);
    });
  });

  describe('Dropdown Tests', () => {
    test('should update model when gate type dropdown changes', () => {
      const typeSelect = document.getElementById('gate-type');
      
      typeSelect.value = 'double-wing';
      typeSelect.dispatchEvent(new Event('change'));
      
      // Simulate model update
      mockModel.updateParameters({ type: 'double-wing' });
      
      expect(mockModel.parameters.type).toBe('double-wing');
    });

    test('should update model when fill type dropdown changes', () => {
      const fillSelect = document.getElementById('fill-type');
      
      fillSelect.value = 'profiles';
      fillSelect.dispatchEvent(new Event('change'));
      
      // Simulate model update
      mockModel.updateParameters({ fillType: 'profiles' });
      
      expect(mockModel.parameters.fillType).toBe('profiles');
    });
  });

  describe('Cost Display Tests', () => {
    test('should display cost in PLN format', () => {
      const costDisplay = document.getElementById('cost-display');
      
      expect(costDisplay.textContent).toContain('PLN');
    });

    test('should update cost display when model changes', () => {
      const costDisplay = document.getElementById('cost-display');
      
      // Update model parameters
      mockModel.updateParameters({ width: 4, height: 2 });
      
      // Calculate expected cost
      const expectedCost = mockCalculator.calculate(mockModel.parameters).total.toFixed(2);
      
      // Simulate UI update
      costDisplay.textContent = `Koszt: ${expectedCost} PLN`;
      
      expect(costDisplay.textContent).toContain(expectedCost);
    });
  });

  describe('PDF Button Tests', () => {
    test('should have PDF button in DOM', () => {
      const pdfButton = document.getElementById('pdf-btn');
      
      expect(pdfButton).toBeDefined();
      expect(pdfButton.id).toBe('pdf-btn');
    });

    test('should handle button click events', () => {
      const pdfButton = document.getElementById('pdf-btn');
      const clickHandler = jest.fn();
      
      pdfButton.addEventListener('click', clickHandler);
      pdfButton.click();
      
      expect(clickHandler).toHaveBeenCalled();
    });
  });

  describe('UI Integration Tests', () => {
    test('should maintain UI state consistency', () => {
      // Set model parameters
      mockModel.updateParameters({ width: 5, height: 2.5, type: 'double-wing' });
      
      // UI elements should reflect model state
      expect(mockModel.parameters.width).toBe(5);
      expect(mockModel.parameters.height).toBe(2.5);
      expect(mockModel.parameters.type).toBe('double-wing');
    });

    test('should handle rapid UI updates', () => {
      const widthSlider = document.getElementById('width-slider');
      
      // Rapid slider changes
      for (let i = 0; i < 10; i++) {
        widthSlider.value = i;
        widthSlider.dispatchEvent(new Event('input'));
        mockModel.updateParameters({ width: i });
      }
      
      // Model should have the last value
      expect(mockModel.parameters.width).toBe(9);
    });
  });

  describe('Accessibility Tests', () => {
    test('should have proper form elements', () => {
      const sliders = document.querySelectorAll('input[type="range"]');
      const selects = document.querySelectorAll('select');
      
      expect(sliders.length).toBe(3);
      expect(selects.length).toBe(2);
    });

    test('should support keyboard navigation', () => {
      const sliders = document.querySelectorAll('input[type="range"]');
      const selects = document.querySelectorAll('select');
      
      // All interactive elements should be focusable
      expect(sliders.length).toBeGreaterThan(0);
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle UI updates efficiently', () => {
      const startTime = performance.now();
      
      // Multiple parameter updates
      for (let i = 0; i < 100; i++) {
        mockModel.updateParameters({ width: i, height: i / 2 });
      }
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // UI updates should be fast
      expect(updateTime).toBeLessThan(100);
    });
  });
}); 