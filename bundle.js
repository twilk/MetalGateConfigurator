// Stats.js (minimalny, FPS tylko)
(function(){
  var Stats=function(){var e=0,t=document.createElement("div");t.style.cssText="position:fixed;top:0;left:0;z-index:10000;padding:5px;background:rgba(0,0,0,0.7);color:#fff;font:12px monospace;",t.innerHTML='<span id="fps">FPS: 0</span>';var n=t.firstChild,r=performance.now(),i=0,s=0;return t.setMode=function(){},t.begin=function(){r=performance.now()},t.end=function(){var t=performance.now();i++,s++;if(t>e+1e3){n.textContent="FPS: "+((i*1e3)/(t-e)).toFixed(1),e=t,i=0}},t.dom=t,t};window.Stats=Stats;})();

(function() {
  // SceneManager
  class SceneManager {
    constructor(canvas) {
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        powerPreference: 'high-performance'
      });
      // Ustaw rozmiar renderera na podstawie rozmiaru elementu canvas, zarządzanego przez CSS
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      // Zresetuj inline style canvas, aby CSS mógł przejąć kontrolę nad układem
      this.renderer.domElement.style.position = 'static'; // Ważne: usuń absolute/fixed
      this.renderer.domElement.style.width = 'auto';
      this.renderer.domElement.style.height = 'auto';
      this.renderer.domElement.style.top = 'auto';
      this.renderer.domElement.style.left = 'auto';

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf0f0f0);

      // Camera setup
      // Ustaw początkowe proporcje kamery na podstawie rozmiaru canvas
      this.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      this.camera.position.set(5, 5, 10);
      this.camera.lookAt(0, 0, 0);

      // Load textures and environment
      this.loadTextures().then(() => {
        // Lighting setup
        this.setupLighting();

        // Controls setup
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableRotate = true;
        this.controls.enablePan = false;
        this.controls.minPolarAngle = Math.PI / 2;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;
        this.controls.enableDamping = true; // Smooth camera movement
        this.controls.dampingFactor = 0.05;

        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20);
        gridHelper.position.y = -2;
        this.scene.add(gridHelper);

        // Event listeners
        window.addEventListener('resize', () => this.onResize(), false);
        this.onResize();
        this.animate();
      });

      // Performance monitoring
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }

    async loadTextures() {
      // Zamiast ładować z pliku, twórz teksturę proceduralnie (szary kolor)
      const gray = document.createElement('canvas');
      gray.width = gray.height = 2;
      const ctx = gray.getContext('2d');
      ctx.fillStyle = '#444';
      ctx.fillRect(0,0,2,2);
      const colorTex = new THREE.Texture(gray);
      colorTex.needsUpdate = true;
      // Normal, roughness, ao - puste tekstury
      const empty = new THREE.Texture(gray);
      empty.needsUpdate = true;
      this.textures = {
        ral7016: {
          color: colorTex,
          normal: empty,
          roughness: empty,
          ao: empty
        }
      };
      // Pomiń HDRI/envmap
    }

    setupLighting() {
      // Ambient light - reduced intensity
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      this.scene.add(ambientLight);

      // Main directional light (sun) - increased intensity
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(10, 10, 10);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 50;
      mainLight.shadow.camera.left = -10;
      mainLight.shadow.camera.right = 10;
      mainLight.shadow.camera.top = 10;
      mainLight.shadow.camera.bottom = -10;
      this.scene.add(mainLight);

      // Fill light - reduced intensity and adjusted position
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
      fillLight.position.set(-8, 3, -8);
      this.scene.add(fillLight);

      // Rim light - removed as it was causing flickering
    }

    onResize() {
      const width = this.renderer.domElement.clientWidth;
      const height = this.renderer.domElement.clientHeight;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    animate() {
      requestAnimationFrame(() => this.animate());
      
      // Update controls
      this.controls.update();
      
      // Update stats
      this.stats.begin();
      
      // Render scene
      this.renderer.render(this.scene, this.camera);
      
      // End stats
      this.stats.end();
    }
  }

  // GateModel with type parameter
  class GateModel {
    constructor(scene, textures) {
      this.scene = scene;
      this.textures = textures;
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.parameters = {
        width: 4,
        height: 2,
        depth: 0.1,
        type: 'sliding',
        fillType: 'mesh'
      };
      this.createGate();
      this.createHighlights();
    }
    createHighlights() {
      const arrowColor = 0x0000ff; // Niebieski kolor dla strzałek
      const arrowLength = 1.0;
      const arrowHeadLength = 0.2;
      const arrowHeadWidth = 0.1;

      // Strzałka szerokości
      this.widthArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), arrowLength, arrowColor, arrowHeadLength, arrowHeadWidth);
      this.widthArrow.visible = false;
      this.scene.add(this.widthArrow);

      // Strzałka wysokości
      this.heightArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), arrowLength, arrowColor, arrowHeadLength, arrowHeadWidth);
      this.heightArrow.visible = false;
      this.scene.add(this.heightArrow);

      // Strzałka głębokości (rzadziej używana, ale dla kompletności)
      this.depthArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), arrowLength, arrowColor, arrowHeadLength, arrowHeadWidth);
      this.depthArrow.visible = false;
      this.scene.add(this.depthArrow);
    }

    showHighlight(dimension) {
      this.hideHighlights(); // Ukryj wszystkie inne
      const { width, height, depth } = this.parameters;
      const offset = 0.5; // Odległość strzałki od bramy

      switch (dimension) {
        case 'width':
          this.widthArrow.setLength(width + 0.5, 0.2, 0.1);
          this.widthArrow.position.set(0, height / 2 + offset, 0);
          this.widthArrow.setDirection(new THREE.Vector3(1, 0, 0)); // Od lewej do prawej
          this.widthArrow.visible = true;
          break;
        case 'height':
          this.heightArrow.setLength(height + 0.5, 0.2, 0.1);
          this.heightArrow.position.set(width / 2 + offset, 0, 0);
          this.heightArrow.setDirection(new THREE.Vector3(0, 1, 0)); // Od dołu do góry
          this.heightArrow.visible = true;
          break;
        case 'depth':
          this.depthArrow.setLength(depth + 0.5, 0.2, 0.1);
          this.depthArrow.position.set(width / 2 + offset, height / 2 + offset, 0); // Przykładowa pozycja
          this.depthArrow.setDirection(new THREE.Vector3(0, 0, 1)); // W głąb
          this.depthArrow.visible = true;
          break;
      }
    }

    hideHighlights() {
      this.widthArrow.visible = false;
      this.heightArrow.visible = false;
      this.depthArrow.visible = false;
    }

    createGate() {
      while (this.group.children.length) {
        this.group.remove(this.group.children[0]);
      }

      const { width, height, depth, type, fillType } = this.parameters;
      const textures = this.textures?.ral7016;

      // Create main frame
      const frameGeometry = new THREE.BoxGeometry(width, height, depth);
      const frameMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.6,
        roughness: 0.4
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.castShadow = true;
      frame.receiveShadow = true;
      this.group.add(frame);

      // Create vertical posts
      const postWidth = 0.1;
      const postGeometry = new THREE.BoxGeometry(postWidth, height, depth);
      const postMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.0
      });

      const leftPost = new THREE.Mesh(postGeometry, postMaterial);
      leftPost.position.set(-width/2 + postWidth/2, 0, 0);
      leftPost.castShadow = true;
      leftPost.receiveShadow = true;
      this.group.add(leftPost);

      const rightPost = new THREE.Mesh(postGeometry, postMaterial);
      rightPost.position.set(width/2 - postWidth/2, 0, 0);
      rightPost.castShadow = true;
      rightPost.receiveShadow = true;
      this.group.add(rightPost);

      // Create fill based on type
      switch (fillType) {
        case 'mesh':
          this.createMeshFill(width, height, depth, textures);
          break;
        case 'profiles':
          this.createProfileFill(width, height, depth, textures);
          break;
        case 'panel':
          this.createPanelFill(width, height, depth, textures);
          break;
      }

      // Create gate type specific elements
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
    }
    createMeshFill(width, height, depth, textures) {
      const meshSize = 0.2;
      const meshGeometry = new THREE.BoxGeometry(meshSize, meshSize, depth * 0.8);
      const meshMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.5,
        roughness: 0.5
      });

      for (let x = -width/2 + 0.2; x < width/2 - 0.2; x += meshSize * 1.2) {
        for (let y = -height/2 + 0.2; y < height/2 - 0.2; y += meshSize * 1.2) {
          const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
          mesh.position.set(x, y, 0);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this.group.add(mesh);
        }
      }
    }
    createProfileFill(width, height, depth, textures) {
      const profileWidth = 0.05; // Cienkie profile
      const profileSpacing = 0.15; // Odstępy między profilami
      const numProfiles = Math.floor((width - 0.2) / profileSpacing); // Oblicz liczbę profili
      const actualSpacing = (width - 0.2) / numProfiles; // Dostosuj spacing dla równego rozłożenia

      const profileGeometry = new THREE.BoxGeometry(profileWidth, height - 0.2, depth * 0.8);
      const profileMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.7,
        roughness: 0.3
      });

      for (let i = 0; i < numProfiles; i++) {
        const x = -width / 2 + 0.1 + (i * actualSpacing) + (profileWidth / 2);
        const profile = new THREE.Mesh(profileGeometry, profileMaterial);
        profile.position.set(x, 0, 0);
        profile.castShadow = true;
        profile.receiveShadow = true;
        this.group.add(profile);
      }
    }
    createPanelFill(width, height, depth, textures) {
      const panelGeometry = new THREE.BoxGeometry(width - 0.2, height - 0.2, depth * 0.8);
      const panelMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.8,
        roughness: 0.2
      });
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.set(0, 0, 0);
      panel.castShadow = true;
      panel.receiveShadow = true;
      this.group.add(panel);
    }
    createSlidingGate(width, height, depth, textures) {
      // Dla bramy przesuwnej, możemy po prostu dodać szynę prowadzącą
      const railHeight = 0.1;
      const railGeometry = new THREE.BoxGeometry(width, railHeight, depth * 0.5);
      const railMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.9,
        roughness: 0.1
      });
      const rail = new THREE.Mesh(railGeometry, railMaterial);
      rail.position.set(0, -height / 2 - railHeight / 2, 0);
      rail.castShadow = true;
      rail.receiveShadow = true;
      this.group.add(rail);

      // Symulacja lekkiego wysunięcia bramy, aby zasugerować "przesuwność"
      this.group.position.x = -width * 0.1;
    }
    createDoubleWingGate(width, height, depth, textures) {
      // Utwórz dwie osobne skrzydła
      const wingWidth = (width - 0.1) / 2; // Odjęcie małej luki na środku
      const wingDepth = depth;

      // Lewe skrzydło
      const leftWingGroup = new THREE.Group();
      this.group.add(leftWingGroup);

      // Rama lewego skrzydła
      const leftFrameGeometry = new THREE.BoxGeometry(wingWidth, height, wingDepth);
      const leftFrameMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.6,
        roughness: 0.4
      });
      const leftFrame = new THREE.Mesh(leftFrameGeometry, leftFrameMaterial);
      leftFrame.castShadow = true;
      leftFrame.receiveShadow = true;
      leftWingGroup.add(leftFrame);
      leftWingGroup.position.x = -wingWidth / 2 - 0.05; // Ustaw pozycję lewego skrzydła

      // Prawe skrzydło
      const rightWingGroup = new THREE.Group();
      this.group.add(rightWingGroup);

      // Rama prawego skrzydła
      const rightFrameGeometry = new THREE.BoxGeometry(wingWidth, height, wingDepth);
      const rightFrameMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.6,
        roughness: 0.4
      });
      const rightFrame = new THREE.Mesh(rightFrameGeometry, rightFrameMaterial);
      rightFrame.castShadow = true;
      rightFrame.receiveShadow = true;
      rightWingGroup.add(rightFrame);
      rightWingGroup.position.x = wingWidth / 2 + 0.05; // Ustaw pozycję prawego skrzydła

      // Dodaj wypełnienie do każdego skrzydła
      switch (this.parameters.fillType) {
        case 'mesh':
          this.createMeshFill(wingWidth, height, wingDepth, textures);
          break;
        case 'profiles':
          this.createProfileFill(wingWidth, height, wingDepth, textures);
          break;
        case 'panel':
          this.createPanelFill(wingWidth, height, wingDepth, textures);
          break;
      }
    }
    createWicketGate(width, height, depth, textures) {
      // Furtka jako mniejsza brama wewnątrz głównej bramy
      const wicketWidth = Math.min(width * 0.3, 1.0); // Ogranicz rozmiar furtki
      const wicketHeight = Math.min(height * 0.9, 1.8);
      const wicketOffset = width * 0.2; // Przesunięcie furtki od lewej krawędzi

      // Główna rama (bez furtki)
      const mainFrameMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.6,
        roughness: 0.4
      });

      // Lewa część ramy głównej
      const leftMainFrame = new THREE.Mesh(new THREE.BoxGeometry(wicketOffset - 0.1, height, depth), mainFrameMaterial);
      leftMainFrame.position.set(-width / 2 + (wicketOffset - 0.1) / 2, 0, 0);
      leftMainFrame.castShadow = true;
      leftMainFrame.receiveShadow = true;
      this.group.add(leftMainFrame);

      // Prawa część ramy głównej
      const rightMainFrameWidth = width - wicketOffset - wicketWidth + 0.1;
      const rightMainFrame = new THREE.Mesh(new THREE.BoxGeometry(rightMainFrameWidth, height, depth), mainFrameMaterial);
      rightMainFrame.position.set(width / 2 - rightMainFrameWidth / 2, 0, 0);
      rightMainFrame.castShadow = true;
      rightMainFrame.receiveShadow = true;
      this.group.add(rightMainFrame);

      // Górna część ramy głównej nad furtką
      const topMainFrame = new THREE.Mesh(new THREE.BoxGeometry(wicketWidth, height - wicketHeight - 0.1, depth), mainFrameMaterial);
      topMainFrame.position.set(-width / 2 + wicketOffset + wicketWidth / 2, height / 2 - (height - wicketHeight - 0.1) / 2, 0);
      topMainFrame.castShadow = true;
      topMainFrame.receiveShadow = true;
      this.group.add(topMainFrame);

      // Utwórz furtkę
      const wicketGroup = new THREE.Group();
      wicketGroup.position.set(-width / 2 + wicketOffset + wicketWidth / 2, -height / 2 + wicketHeight / 2 + 0.05, 0); // Pozycja furtki
      this.group.add(wicketGroup);

      const wicketFrameGeometry = new THREE.BoxGeometry(wicketWidth, wicketHeight, depth);
      const wicketFrameMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.6,
        roughness: 0.4
      });
      const wicketFrame = new THREE.Mesh(wicketFrameGeometry, wicketFrameMaterial);
      wicketFrame.castShadow = true;
      wicketFrame.receiveShadow = true;
      wicketGroup.add(wicketFrame);

      // Dodaj wypełnienie do furtki
      switch (this.parameters.fillType) {
        case 'mesh':
          this.createMeshFill(wicketWidth, wicketHeight, depth, textures);
          break;
        case 'profiles':
          this.createProfileFill(wicketWidth, wicketHeight, depth, textures);
          break;
        case 'panel':
          this.createPanelFill(wicketWidth, wicketHeight, depth, textures);
          break;
      }
    }
    updateParameters(params) {
      this.parameters = Object.assign({}, this.parameters, params);
      this.createGate();
    }
  }

  // UIManager with dropdown and hover highlight
  class UIManager {
    constructor(model, costCalculator) {
      this.model = model;
      this.costCalculator = costCalculator;
      this.initUI();
      this.updateCost();
    }
    initUI() {
      const container = document.getElementById('parameters');
      container.innerHTML = '';

      // Width slider
      this.addSlider(container, 'Szerokość (m):', 2, 8, this.model.parameters.width, val => this.onParamChange('width', val));

      // Height slider
      this.addSlider(container, 'Wysokość (m):', 1, 3, this.model.parameters.height, val => this.onParamChange('height', val));

      // Depth slider
      this.addSlider(container, 'Głębokość (m):', 0.05, 0.2, this.model.parameters.depth, val => this.onParamChange('depth', val));

      // Gate type dropdown
      this.addDropdown(container, 'Typ Bramy:', [
        { text: 'Przesuwna', value: 'sliding' },
        { text: 'Dwuskrzydłowa', value: 'double-wing' },
        { text: 'Furtka', value: 'wicket' }
      ], this.model.parameters.type, val => this.onParamChange('type', val));

      // Fill type dropdown
      this.addDropdown(container, 'Typ Wypełnienia:', [
        { text: 'Siatka', value: 'mesh' },
        { text: 'Profile', value: 'profiles' },
        { text: 'Panel', value: 'panel' }
      ], this.model.parameters.fillType, val => this.onParamChange('fillType', val));
    }
    addSlider(container, label, min, max, value, onChange) {
      const wrapper = document.createElement('div');
      wrapper.className = 'slider-wrapper';

      const labelEl = document.createElement('label');
      labelEl.className = 'ui-label';
      labelEl.textContent = label;

      const input = document.createElement('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = (max - min) / 100;
      input.value = value;

      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'value-display';
      valueDisplay.textContent = `${value}m`;

      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        valueDisplay.textContent = `${val.toFixed(2)}m`;
        onChange(val);
        // Pokaż strzałkę dla aktywnego wymiaru
        this.model.showHighlight(label.toLowerCase().includes('szerokość') ? 'width' : label.toLowerCase().includes('wysokość') ? 'height' : 'depth');
      });

      input.addEventListener('focus', () => {
        // Pokaż strzałkę, gdy suwak jest aktywny
        this.model.showHighlight(label.toLowerCase().includes('szerokość') ? 'width' : label.toLowerCase().includes('wysokość') ? 'height' : 'depth');
      });

      input.addEventListener('blur', () => {
        // Ukryj strzałkę, gdy suwak traci fokus
        this.model.hideHighlights();
      });

      wrapper.appendChild(labelEl);
      wrapper.appendChild(input);
      wrapper.appendChild(valueDisplay);
      container.appendChild(wrapper);
    }
    addDropdown(container, label, options, value, onChange) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dropdown-wrapper';

      const labelEl = document.createElement('label');
      labelEl.className = 'ui-label';
      labelEl.textContent = label;

      const select = document.createElement('select');
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        if (opt.value === value) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener('change', (e) => onChange(e.target.value));

      wrapper.appendChild(labelEl);
      wrapper.appendChild(select);
      container.appendChild(wrapper);
    }
    onParamChange(param, value) {
      this.model.updateParameters({ [param]: value });
      this.updateCost();
      this.model.hideHighlights(); // Ukryj strzałki po każdej zmianie parametru
    }
    updateCost() {
      const costs = this.costCalculator.calculate(this.model.parameters) || {};
      const display = document.getElementById('cost-display');
      display.innerHTML = `
        <div class="cost-item">
          <span>Stal:</span>
          <span>${(costs.steelCost||0).toFixed(2)} PLN</span>
        </div>
        <div class="cost-item">
          <span>Ocynk:</span>
          <span>${(costs.galvCost||0).toFixed(2)} PLN</span>
        </div>
        <div class="cost-item">
          <span>Robocizna:</span>
          <span>${(costs.laborCost||0).toFixed(2)} PLN</span>
        </div>
        <div class="cost-item">
          <span>Montaż:</span>
          <span>${(costs.assembly||0).toFixed(2)} PLN</span>
        </div>
        <div class="cost-item">
          <span>Śruby:</span>
          <span>${(costs.screws||0).toFixed(2)} PLN</span>
        </div>
        <div class="cost-item">
          <span>Wypełnienie:</span>
          <span>${(costs.fillCost||0).toFixed(2)} PLN</span>
        </div>
        <div class="cost-total">
          <span>Razem:</span>
          <span>${(costs.total||0).toFixed(2)} PLN</span>
        </div>
      `;
    }
  }

  // CostCalculator
  class CostCalculator {
    constructor(rates = {}) {
      this.rates = {
        steel: rates.steel || 5, // PLN per kg
        galvanization: rates.galvanization || 10, // PLN per m2
        labor: rates.labor || 50, // PLN per hour
        assembly: rates.assembly || 100, // PLN per gate
        screws: rates.screws || 0.5, // PLN per piece
        profiles: rates.profiles || 15, // PLN per m
        mesh: rates.mesh || 20, // PLN per m2
        panel: rates.panel || 30 // PLN per m2
      };
    }

    calculate(params) {
      const { width, height, depth, type, fillType } = params;
      const area = width * height;
      const perimeter = 2 * (width + height);

      // Calculate material costs based on fill type
      let fillCost = 0;
      switch (fillType) {
        case 'mesh':
          fillCost = area * this.rates.mesh;
          break;
        case 'profiles':
          fillCost = perimeter * this.rates.profiles;
          break;
        case 'panel':
          fillCost = area * this.rates.panel;
          break;
      }

      // Calculate steel cost (frame + posts)
      const frameWeight = area * depth * 7850; // kg (steel density)
      const postsWeight = 2 * height * 0.1 * depth * 7850; // kg
      const steelCost = (frameWeight + postsWeight) * this.rates.steel;

      // Calculate galvanization cost
      const galvCost = area * this.rates.galvanization;

      // Calculate labor cost (more complex gates take longer)
      let laborMultiplier = 1;
      switch (type) {
        case 'double-wing':
          laborMultiplier = 1.5;
          break;
        case 'wicket':
          laborMultiplier = 1.2;
          break;
      }
      const laborCost = (area / 2) * this.rates.labor * laborMultiplier;

      // Calculate assembly cost
      const assemblyCost = this.rates.assembly * laborMultiplier;

      // Calculate screws cost (more complex gates need more screws)
      const screwsCount = Math.ceil(area * 2 * laborMultiplier);
      const screwsCost = screwsCount * this.rates.screws;

      // Calculate total cost
      const total = steelCost + galvCost + laborCost + assemblyCost + screwsCost + fillCost;

      return {
        steelCost,
        galvCost,
        laborCost,
        assemblyCost,
        screwsCost,
        fillCost,
        total,
        details: {
          frameWeight,
          postsWeight,
          screwsCount,
          laborMultiplier
        }
      };
    }
  }

  // ExportPDF
  class ExportPDF {
    constructor(renderer) {
      this.renderer = renderer;
      this.margins = { left: 20, top: 20, right: 20, bottom: 20 };
      this.sectionSpacing = 15;
      this.lineSpacing = 8;
    }

    generate(params, costs) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // To support Polish characters, you need to embed a font that contains them.
      // 1. Download a font that supports extended Latin characters (e.g., Roboto, Open Sans) in .ttf format.
      // 2. Use a jsPDF font converter (e.g., https://raw.githack.com/MrRio/jsPDF/master/fontconverter/fontconverter.html)
      //    to convert your .ttf file into a .js file containing the font data.
      // 3. Include the generated .js file in your project (e.g., <script src="path/to/your/font.js"></script> in index.html)
      // 4. Add the font to jsPDF's virtual file system and set it as the current font:
      /*
      doc.addFileToVFS('MyFont.ttf', 'BASE64_ENCODED_FONT_STRING_HERE'); // Replace with your font data
      doc.addFont('MyFont.ttf', 'MyFont', 'normal'); // Replace with your font name
      doc.setFont('MyFont');
      */

      // For now, we will use a generic font. If you have embedded a custom font, uncomment the lines above.
      doc.setFont('helvetica');
      
      // Add header with logo placeholder
      doc.setFontSize(24);
      doc.setTextColor(33, 33, 33);
      doc.text('DBT Metal', this.margins.left, this.margins.top);
      
      doc.setFontSize(16);
      doc.setTextColor(66, 66, 66);
      doc.text('Oferta bramy', this.margins.left, this.margins.top + 12);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const date = new Date().toLocaleDateString('pl-PL');
      doc.text(`Data: ${date}`, this.margins.left, this.margins.top + 20);
      
      // Add parameters section
      let y = this.margins.top + 35;
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Parametry bramy:', this.margins.left, y);
      
      y += this.sectionSpacing;
      doc.setFontSize(11);
      doc.setTextColor(66, 66, 66);
      
      const paramsList = [
        ['Szerokość:', `${params.width.toFixed(2)} m`],
        ['Wysokość:', `${params.height.toFixed(2)} m`],
        ['Głębokość:', `${params.depth.toFixed(2)} m`],
        ['Typ:', this.getGateTypeName(params.type)],
        ['Wypełnienie:', this.getFillTypeName(params.fillType)]
      ];
      
      paramsList.forEach(([label, value]) => {
        doc.text(label, this.margins.left + 5, y);
        doc.text(value, this.margins.left + 60, y);
        y += this.lineSpacing;
      });
      
      // Add cost breakdown
      y += this.sectionSpacing;
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Kosztorys:', this.margins.left, y);
      
      y += this.sectionSpacing;
      doc.setFontSize(11);
      doc.setTextColor(66, 66, 66);
      
      const costsList = [
        ['Stal:', `${costs.steelCost.toFixed(2)} PLN`],
        ['Ocynk:', `${costs.galvCost.toFixed(2)} PLN`],
        ['Robocizna:', `${costs.laborCost.toFixed(2)} PLN`],
        ['Montaż:', `${costs.assemblyCost.toFixed(2)} PLN`],
        ['Śruby:', `${costs.screwsCost.toFixed(2)} PLN`],
        ['Wypełnienie:', `${costs.fillCost.toFixed(2)} PLN`]
      ];
      
      costsList.forEach(([label, value]) => {
        doc.text(label, this.margins.left + 5, y);
        doc.text(value, this.margins.left + 60, y);
        y += this.lineSpacing;
      });
      
      // Add total with emphasis
      y += this.lineSpacing;
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text('Razem:', this.margins.left + 5, y);
      doc.text(`${costs.total.toFixed(2)} PLN`, this.margins.left + 60, y);
      
      // Add details in a smaller font
      y += this.sectionSpacing;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      
      const detailsList = [
        ['Waga ramy:', `${costs.details.frameWeight.toFixed(2)} kg`],
        ['Waga słupków:', `${costs.details.postsWeight.toFixed(2)} kg`],
        ['Liczba śrub:', `${costs.details.screwsCount}`]
      ];
      
      detailsList.forEach(([label, value]) => {
        doc.text(label, this.margins.left + 5, y);
        doc.text(value, this.margins.left + 60, y);
        y += this.lineSpacing;
      });
      
      // Add visualization
      const imgData = this.renderer.domElement.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = 100;
      const imgX = (doc.internal.pageSize.width - imgWidth) / 2;
      doc.addImage(imgData, 'PNG', imgX, y + 10, imgWidth, imgHeight);
      
      // Add footer
      const footerY = doc.internal.pageSize.height - this.margins.bottom;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('DBT Metal - Bramy i ogrodzenia', this.margins.left, footerY - 15);
      doc.text('Tel: +48 XXX XXX XXX', this.margins.left, footerY - 10);
      doc.text('Email: kontakt@dbtmetal.pl', this.margins.left, footerY - 5);
      
      doc.save('oferta_bramy.pdf');
    }

    getGateTypeName(type) {
      const types = {
        'sliding': 'Przesuwna',
        'double-wing': 'Dwuskrzydłowa',
        'wicket': 'Furtka'
      };
      return types[type] || type;
    }

    getFillTypeName(type) {
      const types = {
        'mesh': 'Siatka',
        'profiles': 'Profile',
        'panel': 'Panel'
      };
      return types[type] || type;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('three-canvas');
    const sceneMgr = new SceneManager(canvas);

    // Czekaj na załadowanie tekstur przed inicjalizacją modelu i UI
    await sceneMgr.loadTextures();

    const model = new GateModel(sceneMgr.scene, sceneMgr.textures);
    const calc = new CostCalculator();
    const ui = new UIManager(model, calc);

    // Przechowaj główne instancje w globalnym zasięgu dla łatwego dostępu (np. dla testów i debugowania)
    window.mainSceneManager = sceneMgr;
    window.mainModel = model;
    window.mainCostCalculator = calc;
    window.mainUIManager = ui;

    // Import/Export buttons
    document.getElementById('import-btn').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              model.updateParameters(data.parameters);
              ui.updateCost();
            } catch (error) {
              alert('Błąd podczas importowania pliku: ' + error.message);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      const data = {
        parameters: model.parameters,
        costs: calc.calculate(model.parameters)
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brama_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Documentation buttons
    document.getElementById('pdf-btn').addEventListener('click', () => {
      const exporter = new ExportPDF(sceneMgr.renderer);
      exporter.generate(model.parameters, calc.calculate(model.parameters));
    });

    document.getElementById('specs-btn').addEventListener('click', () => {
      const specs = {
        parameters: model.parameters,
        costs: calc.calculate(model.parameters),
        materials: {
          frame: 'Stal ocynkowana',
          fill: model.parameters.fillType === 'mesh' ? 'Siatka' : 
                model.parameters.fillType === 'profiles' ? 'Profile' : 'Panel',
          surface: 'Ocynk + powłoka proszkowa'
        }
      };
      
      const specsWindow = window.open('', '_blank');
      specsWindow.document.write(`
        <html>
          <head>
            <title>Specyfikacja bramy</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .spec-item { margin: 10px 0; }
              .spec-title { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Specyfikacja bramy</h1>
            <div class="spec-item">
              <span class="spec-title">Typ bramy:</span> 
              ${model.parameters.type === 'sliding' ? 'Przesuwna' : 
                model.parameters.type === 'double-wing' ? 'Dwuskrzydłowa' : 'Furtka'}
            </div>
            <div class="spec-item">
              <span class="spec-title">Wymiary:</span>
              ${model.parameters.width}m x ${model.parameters.height}m x ${model.parameters.depth}m
            </div>
            <div class="spec-item">
              <span class="spec-title">Wypełnienie:</span>
              ${specs.materials.fill}
            </div>
            <div class="spec-item">
              <span class="spec-title">Materiały:</span>
              ${specs.materials.frame}, ${specs.materials.surface}
            </div>
            <div class="spec-item">
              <span class="spec-title">Koszt całkowity:</span>
              ${specs.costs.total.toFixed(2)} PLN
            </div>
          </body>
        </html>
      `);
      specsWindow.document.close();
    });

    document.getElementById('drawings-btn').addEventListener('click', () => {
      const drawingWindow = window.open('', '_blank');
      drawingWindow.document.write(`
        <html>
          <head>
            <title>Rysunki techniczne</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .drawing { margin: 20px 0; }
              .dimensions { font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Rysunki techniczne</h1>
            <div class="drawing">
              <h2>Widok z przodu</h2>
              <div style="border: 1px solid #ccc; padding: 20px; text-align: center;">
                <div style="width: ${model.parameters.width * 100}px; height: ${model.parameters.height * 100}px; 
                     border: 2px solid #000; margin: 0 auto; position: relative;">
                  <div class="dimensions" style="position: absolute; bottom: -20px; width: 100%; text-align: center;">
                    ${model.parameters.width}m
                  </div>
                  <div class="dimensions" style="position: absolute; right: -40px; top: 50%; transform: rotate(90deg);">
                    ${model.parameters.height}m
                  </div>
                </div>
              </div>
            </div>
            <div class="drawing">
              <h2>Widok z boku</h2>
              <div style="border: 1px solid #ccc; padding: 20px; text-align: center;">
                <div style="width: ${model.parameters.depth * 100}px; height: ${model.parameters.height * 100}px; 
                     border: 2px solid #000; margin: 0 auto; position: relative;">
                  <div class="dimensions" style="position: absolute; bottom: -20px; width: 100%; text-align: center;">
                    ${model.parameters.depth}m
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      drawingWindow.document.close();
    });

    // Test button
    document.getElementById('run-tests-btn').addEventListener('click', () => {
      const tests = new GateConfiguratorTests();
      tests.runAll();
    });
  });

  // Export GateModel, UIManager, CostCalculator to window
  window.GateModel = GateModel;
  window.UIManager = UIManager;
  window.CostCalculator = CostCalculator;
})();