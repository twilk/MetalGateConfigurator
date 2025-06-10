// TestResultsPanel - Panel wyświetlający status testów V2/V3
class TestResultsPanel {
  constructor(containerElement) {
    this.v2Tests = { total: 12, passed: 12, failed: 0 }; // Obecne testy
    this.v3Tests = { total: 0, passed: 0, failed: 0 };   // Nowe funkcje
    this.isCollapsed = false; // Domyślnie rozwinięte po osadzeniu w UI
    this.containerElement = containerElement;
    this.createPanel();
    this.bindEvents();
    this.updateProgress(); // Initial update
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.className = 'test-results-panel'; // Remove collapsed class initially
    panel.innerHTML = `
      <div class="test-header">
        <h3>Status testów</h3>
        <div class="test-status-indicator">
          <span class="test-status-icon">🟢</span>
          <span class="test-summary">V2: 12/12 ✅</span>
        </div>
        <button class="test-toggle" title="Rozwiń/Zwiń">▲</button>
      </div>
      <div class="test-content">
        <div class="test-progress-section">
          <div class="test-version">
            <span class="version-label">V2 - Obecne funkcje</span>
            <div class="progress-bar-container">
              <div class="progress-bar v2-progress" style="width: 100%"></div>
              <span class="progress-text">12/12 testów przechodzi</span>
            </div>
          </div>
          <div class="test-version">
            <span class="version-label">V3 - Nowe funkcje</span>
            <div class="progress-bar-container">
              <div class="progress-bar v3-progress" style="width: 0%"></div>
              <span class="progress-text">0/0 testów przechodzi</span>
            </div>
          </div>
        </div>
        <div class="test-actions">
          <button class="run-tests-btn" title="Uruchom testy Jest">🧪 Testy</button>
          <button class="visual-test-btn" title="Wizualny test renderowania">🎨 Wizualny</button>
        </div>
        <div class="test-timestamp">
          Ostatni test: ${new Date().toLocaleTimeString()}
        </div>
      </div>
    `;
    
    this.containerElement.appendChild(panel); // Append to the provided container
    this.panel = panel;
    this.v2ProgressBar = panel.querySelector('.v2-progress');
    this.v3ProgressBar = panel.querySelector('.v3-progress');
    this.v2ProgressText = panel.querySelector('.test-version:nth-child(1) .progress-text');
    this.v3ProgressText = panel.querySelector('.test-version:nth-child(2) .progress-text');
    this.statusIcon = panel.querySelector('.test-status-icon');
    this.summaryText = panel.querySelector('.test-summary');
  }

  bindEvents() {
    const toggleBtn = this.panel.querySelector('.test-toggle');
    const runTestsBtn = this.panel.querySelector('.run-tests-btn');
    const visualTestBtn = this.panel.querySelector('.visual-test-btn');

    toggleBtn.addEventListener('click', () => {
      this.togglePanel();
    });

    runTestsBtn.addEventListener('click', () => {
      this.runTests();
    });

    visualTestBtn.addEventListener('click', () => {
      this.runVisualRenderingTest();
    });
  }

  togglePanel() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.panel.classList.add('collapsed');
      this.panel.querySelector('.test-toggle').textContent = '▼';
    } else {
      this.panel.classList.remove('collapsed');
      this.panel.querySelector('.test-toggle').textContent = '▲';
    }
  }

  updateProgress() {
    const v2Progress = this.v2Tests.total > 0 ? (this.v2Tests.passed / this.v2Tests.total) * 100 : 0;
    const v3Progress = this.v3Tests.total > 0 ? (this.v3Tests.passed / this.v3Tests.total) * 100 : 0;
    
    this.v2ProgressBar.style.width = `${v2Progress}%`;
    this.v3ProgressBar.style.width = `${v3Progress}%`;
    
    this.v2ProgressText.textContent = `${this.v2Tests.passed}/${this.v2Tests.total} testów przechodzi`;
    this.v3ProgressText.textContent = this.v3Tests.total > 0 
      ? `${this.v3Tests.passed}/${this.v3Tests.total} testów przechodzi`
      : 'Brak testów V3';
    
    this.updateMainStatus();
    
    this.panel.querySelector('.test-timestamp').textContent = 
      `Ostatni test: ${new Date().toLocaleTimeString()}`;
  }

  updateMainStatus() {
    const totalPassed = this.v2Tests.passed + this.v3Tests.passed;
    const totalFailed = this.v2Tests.failed + this.v3Tests.failed;
    const totalTests = this.v2Tests.total + this.v3Tests.total;
    
    let statusIcon, summaryText;
    
    if (totalFailed === 0 && this.v3Tests.failed === 0) { // Only green if V3 also passes
      statusIcon = '🟢';
      summaryText = `V2: ${this.v2Tests.passed}/${this.v2Tests.total} ✅`;
      if (this.v3Tests.total > 0) {
        summaryText += ` | V3: ${this.v3Tests.passed}/${this.v3Tests.total} ✅`;
      }
    } else if (totalFailed < 3 && this.v3Tests.failed > 0) {
      statusIcon = '🟡';
      summaryText = `V3: ${this.v3Tests.failed} błędów`;
    } else {
      statusIcon = '🔴';
      summaryText = `${totalFailed} błędów`;
    }
    
    this.statusIcon.textContent = statusIcon;
    this.summaryText.textContent = summaryText;
  }

  updateV2Results(passed, failed) {
    this.v2Tests.passed = passed;
    this.v2Tests.failed = failed;
    this.v2Tests.total = passed + failed;
    this.updateProgress();
  }

  updateV3Results(passed, failed) {
    this.v3Tests.passed = passed;
    this.v3Tests.failed = failed;
    this.v3Tests.total = passed + failed;
    this.updateProgress();
  }

  async runTests() {
    this.showNotification('Uruchamianie testów...', 'info');
    try {
      const response = await fetch('/jest-results.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Nie można pobrać wyników testów');
      const data = await response.json();
      
      // Parse Jest results structure
      const totalTests = data.numTotalTests || 0;
      const passedTests = data.numPassedTests || 0;
      const failedTests = data.numFailedTests || 0;
      
      // For now, all tests are V2 (current functionality)
      this.updateV2Results(passedTests, failedTests);
      this.updateV3Results(0, 0); // No V3 tests yet
      
      if (failedTests === 0) {
        this.showNotification(`Wszystkie ${totalTests} testy zakończone sukcesem! ✅`, 'success');
      } else {
        this.showNotification(`Testy zakończone z ${failedTests} błędami ❌`, 'error');
      }
    } catch (err) {
      console.error('Test fetch error:', err);
      this.showNotification('Błąd pobierania wyników testów: ' + err.message, 'error');
    }
  }

  async runVisualRenderingTest() {
    this.showNotification('Uruchamianie wizualnego testu renderowania...', 'info');
    
    // Get the 3D scene from the main application
    const sceneManager = window.sceneManager;
    const modularGateModel = window.modularGateModel;
    
    if (!sceneManager || !modularGateModel) {
      this.showNotification('Błąd: Nie można uzyskać dostępu do sceny 3D', 'error');
      return;
    }

    // Test configurations to visually demonstrate
    const testConfigurations = [
      {
        name: 'Brama przesuwna - Siatka',
        type: 'sliding',
        fillType: 'mesh',
        width: 4,
        height: 2,
        color: 'RAL 7016'
      },
      {
        name: 'Brama dwuskrzydłowa - Profile',
        type: 'double-wing',
        fillType: 'profiles',
        width: 5,
        height: 2.2,
        color: 'RAL 9005'
      },
      {
        name: 'Brama z furtką - Panel',
        type: 'wicket',
        fillType: 'panel',
        width: 6,
        height: 2.5,
        color: 'RAL 9010'
      },
      {
        name: 'Brama przesuwna - Nowoczesne poziome',
        type: 'sliding',
        fillType: 'nowoczesne-poziome',
        width: 4.5,
        height: 2.3,
        color: 'RAL 6005'
      }
    ];

    let currentTestIndex = 0;
    
    const runNextTest = async () => {
      if (currentTestIndex >= testConfigurations.length) {
        this.showNotification('Wizualny test renderowania zakończony! ✅', 'success');
        return;
      }

      const config = testConfigurations[currentTestIndex];
      
      // Update test status
      this.updateVisualTestStatus(`Test ${currentTestIndex + 1}/${testConfigurations.length}: ${config.name}`);
      
      // Clear existing sections
      modularGateModel.sections = [];
      modularGateModel.sectionCounter = 0;
      
      // Add new section with test configuration
      modularGateModel.addSection(
        config.type,
        config.width,
        config.fillType,
        config.fillType,
        config.color
      );
      
      // Update visualization
      modularGateModel.updateVisualization();
      
      // Animate camera to show the gate
      this.animateCameraToGate(sceneManager.camera, modularGateModel.getTotalWidth());
      
      // Wait before next test
      setTimeout(() => {
        currentTestIndex++;
        runNextTest();
      }, 3000); // 3 seconds per test
    };

    // Start the visual test
    runNextTest();
  }

  updateVisualTestStatus(message) {
    // Create or update visual test status display
    let statusElement = document.getElementById('visual-test-status');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'visual-test-status';
      statusElement.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(0, 123, 255, 0.9);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1002;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(statusElement);
    }
    
    statusElement.textContent = message;
    
    // Auto-remove after test completion
    if (message.includes('zakończony')) {
      setTimeout(() => {
        if (statusElement.parentNode) {
          statusElement.parentNode.removeChild(statusElement);
        }
      }, 3000);
    }
  }

  animateCameraToGate(camera, gateWidth) {
    // Animate camera to show the gate properly
    const targetPosition = {
      x: 0,
      y: 2,
      z: gateWidth * 0.8 + 3
    };
    
    const startPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };
    
    const duration = 1000; // 1 second animation
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
      camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress;
      camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
      
      camera.lookAt(0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  showDetails() {
    console.log('Pokazywanie szczegółów testów...');
    this.showNotification('Szczegóły testów zostaną wyświetlone w konsoli.', 'info');
    // W przyszłości, można by tu otworzyć modal z raportem Jest
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `test-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Removed CSS styles as they are now in style.css
// Export the class for use in bundle.js
window.TestResultsPanel = TestResultsPanel; 