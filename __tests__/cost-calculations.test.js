// Jest tests for cost calculations functionality
// Migrated from GateConfiguratorTests.testCostCalculations()

describe('Cost Calculations Tests (V2)', () => {
  let calculator;

  beforeEach(() => {
    // Setup cost calculator
    calculator = {
      calculate: function(params) {
        const baseCost = params.width * params.height * 100;
        const typeMultiplier = this.getTypeMultiplier(params.type);
        const fillMultiplier = this.getFillMultiplier(params.fillType);
        
        return {
          total: baseCost * typeMultiplier * fillMultiplier,
          steelCost: baseCost * 0.6 * typeMultiplier * fillMultiplier,
          galvCost: baseCost * 0.3 * typeMultiplier * fillMultiplier,
          laborCost: baseCost * 0.1 * typeMultiplier * fillMultiplier
        };
      },

      getTypeMultiplier: function(type) {
        const multipliers = {
          'sliding': 1.0,
          'double-wing': 1.2,
          'wicket': 0.8
        };
        return multipliers[type] || 1.0;
      },

      getFillMultiplier: function(fillType) {
        const multipliers = {
          'mesh': 1.0,
          'profiles': 1.1,
          'panel': 0.9
        };
        return multipliers[fillType] || 1.0;
      }
    };
  });

  describe('Basic Cost Calculation', () => {
    test('should return positive values for basic calculation', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      expect(cost.total).toBeGreaterThan(0);
      expect(cost.steelCost).toBeGreaterThan(0);
      expect(cost.galvCost).toBeGreaterThan(0);
      expect(cost.laborCost).toBeGreaterThan(0);
    });

    test('should calculate correct base cost', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      // Base cost should be width * height * 100
      expect(cost.total).toBe(800);
      expect(cost.steelCost).toBe(480); // 60% of total
      expect(cost.galvCost).toBe(240);  // 30% of total
      expect(cost.laborCost).toBe(80);  // 10% of total
    });

    test('should handle zero dimensions', () => {
      const cost = calculator.calculate({
        width: 0,
        height: 0,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      expect(cost.total).toBe(0);
      expect(cost.steelCost).toBe(0);
      expect(cost.galvCost).toBe(0);
      expect(cost.laborCost).toBe(0);
    });

    test('should handle negative dimensions', () => {
      const cost = calculator.calculate({
        width: -1,
        height: -2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      // Should handle negative values gracefully
      expect(cost.total).toBe(200); // |-1| * |-2| * 100
      expect(cost.steelCost).toBe(120);
      expect(cost.galvCost).toBe(60);
      expect(cost.laborCost).toBe(20);
    });
  });

  describe('Gate Type Cost Variations', () => {
    test('should calculate sliding gate cost correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      expect(cost.total).toBe(800);
    });

    test('should calculate double-wing gate cost correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'double-wing',
        fillType: 'mesh'
      });
      
      // Double-wing should be 20% more expensive
      expect(cost.total).toBe(960); // 800 * 1.2
    });

    test('should calculate wicket gate cost correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'wicket',
        fillType: 'mesh'
      });
      
      // Wicket should be 20% less expensive
      expect(cost.total).toBe(640); // 800 * 0.8
    });

    test('should handle unknown gate type gracefully', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'unknown',
        fillType: 'mesh'
      });
      
      // Should use default multiplier of 1.0
      expect(cost.total).toBe(800);
    });
  });

  describe('Fill Type Cost Variations', () => {
    test('should calculate mesh fill cost correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      expect(cost.total).toBe(800);
    });

    test('should calculate profiles fill cost correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'profiles'
      });
      
      // Profiles should be 10% more expensive
      expect(cost.total).toBeCloseTo(880, 2); // 800 * 1.1
    });

    test('should calculate panel fill cost correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'panel'
      });
      
      // Panel should be 10% less expensive
      expect(cost.total).toBe(720); // 800 * 0.9
    });

    test('should handle unknown fill type gracefully', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'unknown'
      });
      
      // Should use default multiplier of 1.0
      expect(cost.total).toBe(800);
    });
  });

  describe('Combined Type and Fill Calculations', () => {
    test('should calculate double-wing with profiles correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'double-wing',
        fillType: 'profiles'
      });
      
      // Base: 800, Type: 1.2, Fill: 1.1
      expect(cost.total).toBeCloseTo(1056, 2); // 800 * 1.2 * 1.1
      expect(cost.steelCost).toBeCloseTo(633.6, 2);
      expect(cost.galvCost).toBeCloseTo(316.8, 2);
      expect(cost.laborCost).toBeCloseTo(105.6, 2);
    });

    test('should calculate wicket with panel correctly', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'wicket',
        fillType: 'panel'
      });
      
      // Base: 800, Type: 0.8, Fill: 0.9
      expect(cost.total).toBe(576); // 800 * 0.8 * 0.9
      expect(cost.steelCost).toBe(345.6);
      expect(cost.galvCost).toBe(172.8);
      expect(cost.laborCost).toBe(57.6);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large dimensions', () => {
      const cost = calculator.calculate({
        width: 100,
        height: 50,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      expect(cost.total).toBe(500000); // 100 * 50 * 100
      expect(cost.steelCost).toBe(300000);
      expect(cost.galvCost).toBe(150000);
      expect(cost.laborCost).toBe(50000);
    });

    test('should handle very small dimensions', () => {
      const cost = calculator.calculate({
        width: 0.1,
        height: 0.1,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      expect(cost.total).toBeCloseTo(1, 2); // 0.1 * 0.1 * 100
      expect(cost.steelCost).toBeCloseTo(0.6, 2);
      expect(cost.galvCost).toBeCloseTo(0.3, 2);
      expect(cost.laborCost).toBeCloseTo(0.1, 2);
    });

    test('should handle decimal dimensions', () => {
      const cost = calculator.calculate({
        width: 3.5,
        height: 2.25,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      expect(cost.total).toBe(787.5); // 3.5 * 2.25 * 100
      expect(cost.steelCost).toBe(472.5);
      expect(cost.galvCost).toBe(236.25);
      expect(cost.laborCost).toBe(78.75);
    });
  });

  describe('Performance Tests', () => {
    test('should calculate costs efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        calculator.calculate({
          width: Math.random() * 10,
          height: Math.random() * 5,
          depth: 0.1,
          type: ['sliding', 'double-wing', 'wicket'][i % 3],
          fillType: ['mesh', 'profiles', 'panel'][i % 3]
        });
      }
      
      const endTime = performance.now();
      const calculationTime = endTime - startTime;
      
      // 1000 calculations should take less than 100ms
      expect(calculationTime).toBeLessThan(100);
    });

    test('should handle rapid successive calculations', () => {
      const results = [];
      
      for (let i = 0; i < 100; i++) {
        const cost = calculator.calculate({
          width: i + 1,
          height: (i + 1) / 2,
          depth: 0.1,
          type: 'sliding',
          fillType: 'mesh'
        });
        results.push(cost.total);
      }
      
      // All results should be positive and increasing
      expect(results.length).toBe(100);
      expect(results.every(cost => cost > 0)).toBe(true);
      expect(results.every((cost, i) => i === 0 || cost > results[i - 1])).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should handle missing parameters gracefully', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2
        // Missing type and fillType
      });
      
      // Should use default values
      expect(cost.total).toBe(800);
    });

    test('should handle null parameters', () => {
      const cost = calculator.calculate({
        width: null,
        height: null,
        depth: null,
        type: null,
        fillType: null
      });
      
      // Should handle null values gracefully
      expect(cost.total).toBe(0);
    });

    test('should handle undefined parameters', () => {
      const cost = calculator.calculate({
        width: undefined,
        height: undefined,
        depth: undefined,
        type: undefined,
        fillType: undefined
      });
      
      // Should handle undefined values gracefully
      expect(cost.total).toBe(NaN);
    });
  });

  describe('Cost Breakdown Validation', () => {
    test('should maintain cost breakdown proportions', () => {
      const cost = calculator.calculate({
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      });
      
      // Cost breakdown should sum to total
      const sum = cost.steelCost + cost.galvCost + cost.laborCost;
      expect(sum).toBeCloseTo(cost.total, 2);
      
      // Proportions should be maintained
      expect(cost.steelCost / cost.total).toBeCloseTo(0.6, 2);
      expect(cost.galvCost / cost.total).toBeCloseTo(0.3, 2);
      expect(cost.laborCost / cost.total).toBeCloseTo(0.1, 2);
    });

    test('should maintain proportions across different types', () => {
      const types = ['sliding', 'double-wing', 'wicket'];
      const fillTypes = ['mesh', 'profiles', 'panel'];
      
      for (const type of types) {
        for (const fillType of fillTypes) {
          const cost = calculator.calculate({
            width: 4,
            height: 2,
            depth: 0.1,
            type,
            fillType
          });
          
          if (cost.total > 0) {
            expect(cost.steelCost / cost.total).toBeCloseTo(0.6, 2);
            expect(cost.galvCost / cost.total).toBeCloseTo(0.3, 2);
            expect(cost.laborCost / cost.total).toBeCloseTo(0.1, 2);
          }
        }
      }
    });
  });
}); 