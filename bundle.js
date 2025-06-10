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
        this.controls.enablePan = true;
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
        fillType: 'pusty',
        frameProfile: '15x15', // Nowy parametr - profil ramy
        fillProfile: 'nowoczesne-poziome' // Nowy parametr - profil wypełnienia
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

      const { width, height, depth, type, fillType, frameProfile, fillProfile } = this.parameters;
      const textures = this.textures?.ral7016;

      // Create frame structure
      this.createFrame(width, height, depth, frameProfile, textures);

      // Create fill based on type and profile
      this.createFill(width, height, depth, fillType, fillProfile, textures);

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

    createFrame(width, height, depth, frameProfile, textures) {
      // Parse frame profile (e.g., "15x15" -> 0.15m x 0.15m)
      const profileSize = this.parseProfileSize(frameProfile);
      const frameWidth = profileSize.width;
      const frameHeight = profileSize.height;

      // Create frame material
      const matParams = {};
      if (textures?.color) matParams.map = textures.color;
      if (textures?.normal) matParams.normalMap = textures.normal;
      if (textures?.roughness) matParams.roughnessMap = textures.roughness;
      if (textures?.ao) matParams.aoMap = textures.ao;
      matParams.metalness = 0.8; // lub inna wartość
      matParams.roughness = 0.2; // lub inna wartość
      const frameMaterial = new THREE.MeshStandardMaterial(matParams);

      // Top horizontal frame
      const topFrameGeometry = new THREE.BoxGeometry(width, frameHeight, frameWidth);
      const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
      topFrame.position.set(0, height/2 - frameHeight/2, 0);
      topFrame.castShadow = true;
      topFrame.receiveShadow = true;
      this.group.add(topFrame);

      // Bottom horizontal frame
      const bottomFrameGeometry = new THREE.BoxGeometry(width, frameHeight, frameWidth);
      const bottomFrame = new THREE.Mesh(bottomFrameGeometry, frameMaterial);
      bottomFrame.position.set(0, -height/2 + frameHeight/2, 0);
      bottomFrame.castShadow = true;
      bottomFrame.receiveShadow = true;
      this.group.add(bottomFrame);

      // Left vertical frame
      const leftFrameGeometry = new THREE.BoxGeometry(frameWidth, height, frameWidth);
      const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
      leftFrame.position.set(-width/2 + frameWidth/2, 0, 0);
      leftFrame.castShadow = true;
      leftFrame.receiveShadow = true;
      this.group.add(leftFrame);

      // Right vertical frame
      const rightFrameGeometry = new THREE.BoxGeometry(frameWidth, height, frameWidth);
      const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
      rightFrame.position.set(width/2 - frameWidth/2, 0, 0);
      rightFrame.castShadow = true;
      rightFrame.receiveShadow = true;
      this.group.add(rightFrame);
    }

    createFill(width, height, depth, fillType, fillProfile, textures) {
      switch (fillType) {
        case 'pusty':
          // Brak wypełnienia - tylko rama
          break;
        case 'nowoczesne-poziome':
          this.createModernHorizontalFill(width, height, depth, fillProfile, textures);
          break;
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
    }

    createModernHorizontalFill(width, height, depth, fillProfile, textures) {
      // Parse fill profile to get spacing and thickness
      const profileConfig = this.parseFillProfile(fillProfile);
      const barThickness = profileConfig.thickness || 0.02; // 2cm grubość
      const barSpacing = profileConfig.spacing || 0.15; // 15cm odstępy
      const barDepth = profileConfig.depth || depth * 0.8;

      // Calculate number of horizontal bars
      const fillHeight = height - 0.3; // Odejmij miejsce na ramę
      const numBars = Math.floor(fillHeight / barSpacing);
      const actualSpacing = fillHeight / numBars;

      // Create horizontal bars
      const barGeometry = new THREE.BoxGeometry(width - 0.3, barThickness, barDepth);
      const matParams = {};
      if (textures?.color) matParams.map = textures.color;
      if (textures?.normal) matParams.normalMap = textures.normal;
      if (textures?.roughness) matParams.roughnessMap = textures.roughness;
      if (textures?.ao) matParams.aoMap = textures.ao;
      matParams.metalness = 0.7;
      matParams.roughness = 0.3;
      const barMaterial = new THREE.MeshStandardMaterial(matParams);

      for (let i = 0; i < numBars; i++) {
        const y = -fillHeight/2 + (i * actualSpacing) + (barThickness/2);
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.set(0, y, 0);
        bar.castShadow = true;
        bar.receiveShadow = true;
        this.group.add(bar);
      }
    }

    parseProfileSize(profile) {
      // Parse profile string like "15x15" to get dimensions in meters
      const parts = profile.split('x');
      if (parts.length === 2) {
        return {
          width: parseInt(parts[0]) / 100, // Convert cm to meters
          height: parseInt(parts[1]) / 100
        };
      }
      // Default fallback
      return { width: 0.15, height: 0.15 };
    }

    parseFillProfile(profile) {
      // Parse fill profile configuration
      switch (profile) {
        case 'nowoczesne-poziome':
          return {
            thickness: 0.02, // 2cm
            spacing: 0.15,   // 15cm
            depth: 0.08      // 8cm
          };
        default:
          return {
            thickness: 0.02,
            spacing: 0.15,
            depth: 0.08
          };
      }
    }

    createMeshFill(width, height, depth, textures) {
      // Tworzenie prawdziwej stalowej siatki
      const meshSpacing = 0.1; // 10cm odstępy między prętami siatki
      const meshThickness = 0.005; // 5mm grubość prętów siatki
      const meshDepth = depth * 0.6; // Głębokość siatki

      // Materiał dla prętów siatki
      const matParams = {};
      if (textures?.color) matParams.map = textures.color;
      if (textures?.normal) matParams.normalMap = textures.normal;
      if (textures?.roughness) matParams.roughnessMap = textures.roughness;
      if (textures?.ao) matParams.aoMap = textures.ao;
      matParams.metalness = 0.7;
      matParams.roughness = 0.3;
      const meshMaterial = new THREE.MeshStandardMaterial(matParams);

      // Oblicz liczbę prętów poziomych i pionowych
      const meshWidth = width - 0.3; // Odejmij miejsce na ramę
      const meshHeight = height - 0.3;
      
      const horizontalBars = Math.floor(meshHeight / meshSpacing);
      const verticalBars = Math.floor(meshWidth / meshSpacing);

      // Tworzenie prętów poziomych
      for (let i = 0; i <= horizontalBars; i++) {
        const y = -meshHeight/2 + (i * meshSpacing);
        const horizontalBarGeometry = new THREE.BoxGeometry(meshWidth, meshThickness, meshDepth);
        const horizontalBar = new THREE.Mesh(horizontalBarGeometry, meshMaterial);
        horizontalBar.position.set(0, y, 0);
        horizontalBar.castShadow = true;
        horizontalBar.receiveShadow = true;
        this.group.add(horizontalBar);
      }

      // Tworzenie prętów pionowych
      for (let i = 0; i <= verticalBars; i++) {
        const x = -meshWidth/2 + (i * meshSpacing);
        const verticalBarGeometry = new THREE.BoxGeometry(meshThickness, meshHeight, meshDepth);
        const verticalBar = new THREE.Mesh(verticalBarGeometry, meshMaterial);
        verticalBar.position.set(x, 0, 0);
        verticalBar.castShadow = true;
        verticalBar.receiveShadow = true;
        this.group.add(verticalBar);
      }
    }

    createProfileFill(width, height, depth, textures) {
      const profileWidth = 0.05; // Cienkie profile
      const profileSpacing = 0.15; // Odstępy między profilami
      const numProfiles = Math.floor((width - 0.2) / profileSpacing); // Oblicz liczbę profili
      const actualSpacing = (width - 0.2) / numProfiles; // Dostosuj spacing dla równego rozłożenia

      const profileGeometry = new THREE.BoxGeometry(profileWidth, height - 0.2, depth * 0.8);
      const matParams = {};
      if (textures?.color) matParams.map = textures.color;
      if (textures?.normal) matParams.normalMap = textures.normal;
      if (textures?.roughness) matParams.roughnessMap = textures.roughness;
      if (textures?.ao) matParams.aoMap = textures.ao;
      matParams.metalness = 0.7;
      matParams.roughness = 0.3;
      const profileMaterial = new THREE.MeshStandardMaterial(matParams);

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
      const matParams2 = {};
      if (textures?.color) matParams2.map = textures.color;
      if (textures?.normal) matParams2.normalMap = textures.normal;
      if (textures?.roughness) matParams2.roughnessMap = textures.roughness;
      if (textures?.ao) matParams2.aoMap = textures.ao;
      matParams2.metalness = 0.8;
      matParams2.roughness = 0.2;
      const panelMaterial = new THREE.MeshStandardMaterial(matParams2);
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
      this.group.position.z = 0.1; // 10 cm od ogrodzenia
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
      wicketGroup.position.set(-width / 2 + wicketOffset + wicketWidth / 2, -height / 2 + wicketHeight / 2 + 0.05, 0);
      this.group.add(wicketGroup);

      const wicketFrameGeometry = new THREE.BoxGeometry(wicketWidth, wicketHeight, depth);
      const matParams3 = {};
      if (textures?.color) matParams3.map = textures.color;
      if (textures?.normal) matParams3.normalMap = textures.normal;
      if (textures?.roughness) matParams3.roughnessMap = textures.roughness;
      if (textures?.ao) matParams3.aoMap = textures.ao;
      matParams3.metalness = 0.6;
      matParams3.roughness = 0.4;
      const wicketFrameMaterial = new THREE.MeshStandardMaterial(matParams3);
      const wicketFrame = new THREE.Mesh(wicketFrameGeometry, wicketFrameMaterial);
      wicketFrame.castShadow = true;
      wicketFrame.receiveShadow = true;
      wicketGroup.add(wicketFrame);
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

      // Frame profile dropdown
      this.addDropdown(container, 'Profil Ramy:', [
        { text: '15x15 cm', value: '15x15' },
        { text: '20x20 cm', value: '20x20' },
        { text: '25x25 cm', value: '25x25' }
      ], this.model.parameters.frameProfile, val => this.onParamChange('frameProfile', val));

      // Fill type dropdown
      this.addDropdown(container, 'Typ Wypełnienia:', [
        { text: 'Puste', value: 'pusty' },
        { text: 'Nowoczesne Poziome', value: 'nowoczesne-poziome' },
        { text: 'Siatka', value: 'mesh' },
        { text: 'Profile', value: 'profiles' },
        { text: 'Panel', value: 'panel' }
      ], this.model.parameters.fillType, val => this.onParamChange('fillType', val));

      // Fill profile dropdown (only show if fill type is not 'pusty')
      if (this.model.parameters.fillType !== 'pusty') {
        this.addDropdown(container, 'Profil Wypełnienia:', [
          { text: 'Nowoczesne Poziome', value: 'nowoczesne-poziome' },
          { text: 'Klasyczne Pionowe', value: 'klasyczne-pionowe' },
          { text: 'Siatka Standard', value: 'siatka-standard' }
        ], this.model.parameters.fillProfile, val => this.onParamChange('fillProfile', val));
      }
    }
    addSlider(container, label, min, max, value, onChange) {
      // Usuwam niestandardowe komponenty, renderuję klasyczny suwak + input + label w jednej linii
      const wrapper = document.createElement('div');
      wrapper.className = 'slider-wrapper';

      const labelEl = document.createElement('label');
      labelEl.className = 'ui-label';
      labelEl.textContent = label;

      const input = document.createElement('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = 0.01;
      input.value = value;
      input.style.flex = '1 1 120px';
      input.style.margin = '0 4px';

      const numberInput = document.createElement('input');
      numberInput.type = 'number';
      numberInput.min = min;
      numberInput.max = max;
      numberInput.step = 0.01;
      numberInput.value = value;
      numberInput.className = 'slider-number-input';
      numberInput.style.width = '40px';
      numberInput.style.height = '28px';
      numberInput.style.marginLeft = '6px';
      numberInput.style.textAlign = 'right';

      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        numberInput.value = val;
        valueDisplay.textContent = `${val}m`;
        onChange(val);
      });
      numberInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = min;
        if (val < min) val = min;
        if (val > max) val = max;
        input.value = val;
        valueDisplay.textContent = `${val}m`;
        onChange(val);
      });
      numberInput.addEventListener('focus', (e) => {
        e.target.select();
      });
      numberInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          let val = parseFloat(e.target.value);
          if (isNaN(val)) val = min;
          if (val < min) val = min;
          if (val > max) val = max;
          input.value = val;
          valueDisplay.textContent = `${val}m`;
          onChange(val);
        }
      });

      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'value-display';
      valueDisplay.textContent = `${value}m`;
      valueDisplay.style.marginLeft = '4px';

      wrapper.appendChild(labelEl);
      wrapper.appendChild(input);
      wrapper.appendChild(numberInput);
      wrapper.appendChild(valueDisplay);
      container.appendChild(wrapper);
    }
    addDropdown(container, label, options, value, onChange) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dropdown-wrapper';
      wrapper.style.marginBottom = '18px';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '16px';

      const labelEl = document.createElement('label');
      labelEl.className = 'ui-label';
      labelEl.textContent = label;
      labelEl.style.flex = '0 0 180px';
      labelEl.style.fontSize = '1.1em';
      labelEl.style.fontWeight = '600';

      const select = document.createElement('select');
      select.style.flex = '1 1 120px';
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
      
      // Jeśli zmieniono typ wypełnienia, zaktualizuj UI
      if (param === 'fillType') {
        this.initUI(); // Przeładuj UI aby pokazać/ukryć kontrolkę profilu wypełnienia
      }
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
      const { width, height, depth, type, fillType, frameProfile, fillProfile } = params;
      const area = width * height;
      const perimeter = 2 * (width + height);

      // Parse frame profile to get dimensions
      const frameSize = this.parseProfileSize(frameProfile);
      const frameWidth = frameSize.width;
      const frameHeight = frameSize.height;

      // Calculate material costs based on fill type and profile
      let fillCost = 0;
      switch (fillType) {
        case 'pusty':
          fillCost = 0; // No fill cost
          break;
        case 'nowoczesne-poziome':
          const fillConfig = this.parseFillProfile(fillProfile);
          const barThickness = fillConfig.thickness || 0.02;
          const barSpacing = fillConfig.spacing || 0.15;
          const availableHeight = height - 0.3;
          const numBars = Math.floor(availableHeight / barSpacing);
          const barLength = width - 0.3;
          const barVolume = barLength * barThickness * (depth * 0.8);
          fillCost = numBars * barVolume * 7850 * this.rates.steel; // Steel cost for bars
          break;
        case 'mesh':
          // Oblicz koszt siatki na podstawie prętów poziomych i pionowych
          const meshSpacing = 0.1; // 10cm odstępy
          const meshThickness = 0.005; // 5mm grubość prętów
          const meshDepth = depth * 0.6; // Głębokość siatki
          
          const meshWidth = width - 0.3;
          const meshHeight = height - 0.3;
          
          const horizontalBars = Math.floor(meshHeight / meshSpacing) + 1;
          const verticalBars = Math.floor(meshWidth / meshSpacing) + 1;
          
          // Objętość prętów poziomych
          const horizontalVolume = horizontalBars * meshWidth * meshThickness * meshDepth;
          // Objętość prętów pionowych
          const verticalVolume = verticalBars * meshHeight * meshThickness * meshDepth;
          
          const totalMeshVolume = horizontalVolume + verticalVolume;
          fillCost = totalMeshVolume * 7850 * this.rates.steel; // Steel cost for mesh bars
          break;
        case 'profiles':
          fillCost = perimeter * this.rates.profiles;
          break;
        case 'panel':
          fillCost = area * this.rates.panel;
          break;
      }

      // Calculate steel cost for frame (new modular structure)
      const frameVolume = (width * frameHeight * frameWidth) + // Top and bottom frames
                         (height * frameWidth * frameWidth) +   // Left and right frames
                         (width * frameHeight * frameWidth);    // Additional frame elements
      const frameWeight = frameVolume * 7850; // kg (steel density)
      const steelCost = frameWeight * this.rates.steel;

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
      
      // Additional labor for complex fill types
      if (fillType === 'nowoczesne-poziome') {
        laborMultiplier *= 1.3; // More complex to assemble
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
          frameVolume,
          screwsCount,
          laborMultiplier,
          frameProfile,
          fillProfile
        }
      };
    }

    parseProfileSize(profile) {
      // Parse profile string like "15x15" to get dimensions in meters
      const parts = profile.split('x');
      if (parts.length === 2) {
        return {
          width: parseInt(parts[0]) / 100, // Convert cm to meters
          height: parseInt(parts[1]) / 100
        };
      }
      // Default fallback
      return { width: 0.15, height: 0.15 };
    }

    parseFillProfile(profile) {
      // Parse fill profile configuration
      switch (profile) {
        case 'nowoczesne-poziome':
          return {
            thickness: 0.02, // 2cm
            spacing: 0.15,   // 15cm
            depth: 0.08      // 8cm
          };
        default:
          return {
            thickness: 0.02,
            spacing: 0.15,
            depth: 0.08
          };
      }
    }

    calculateModular(parameters) {
      const { sections, globalParameters } = parameters;
      let totalSteelVolume = 0;
      let totalFillVolume = 0;
      let totalPosts = 0;

      // Oblicz objętość stali dla każdej sekcji
      sections.forEach(section => {
        const { width, height, depth, fillType, frameProfile } = section;
        
        // Objętość ramy
        const frameSize = this.parseProfileSize(frameProfile);
        const frameVolume = this.calculateFrameVolume(width, height, depth, frameSize);
        totalSteelVolume += frameVolume;

        // Objętość wypełnienia
        const fillVolume = this.calculateFillVolume(width, height, depth, fillType);
        totalFillVolume += fillVolume;

        // Dodaj objętość wypełnienia do stali
        totalSteelVolume += fillVolume;
      });

      // Objętość słupków łączących
      const postWidth = 0.15;
      const postVolume = postWidth * globalParameters.height * globalParameters.depth;
      totalPosts = sections.length - 1;
      totalSteelVolume += postVolume * totalPosts;

      // Oblicz koszty
      const steelCost = totalSteelVolume * this.rates.steel;
      const galvCost = totalSteelVolume * this.rates.galvanization;
      const laborCost = this.calculateLaborCost(sections, globalParameters);
      const assemblyCost = this.calculateAssemblyCost(sections, globalParameters);
      const screwsCost = this.calculateScrewsCost(sections);
      const fillCost = totalFillVolume * this.rates.fill;

      return {
        steelCost,
        galvCost,
        laborCost,
        assemblyCost,
        screwsCost,
        fillCost,
        total: steelCost + galvCost + laborCost + assemblyCost + screwsCost + fillCost
      };
    }

    calculateFrameVolume(width, height, depth, frameSize) {
      const frameWidth = frameSize.width;
      const frameHeight = frameSize.height;

      // Objętość ramy = 2 poziome + 2 pionowe
      const horizontalVolume = 2 * width * frameHeight * frameWidth;
      const verticalVolume = 2 * frameWidth * height * frameWidth;
      
      return horizontalVolume + verticalVolume;
    }

    calculateFillVolume(width, height, depth, fillType) {
      switch (fillType) {
        case 'pusty':
          return 0;
        case 'nowoczesne-poziome':
          return this.calculateModernHorizontalVolume(width, height, depth);
        case 'mesh':
          return this.calculateMeshVolume(width, height, depth);
        case 'profiles':
          return this.calculateProfilesVolume(width, height, depth);
        case 'panel':
          return this.calculatePanelVolume(width, height, depth);
        default:
          return 0;
      }
    }

    calculateModernHorizontalVolume(width, height, depth) {
      const barThickness = 0.02;
      const barSpacing = 0.15;
      const barDepth = depth * 0.8;
      const fillHeight = height - 0.3;
      const numBars = Math.floor(fillHeight / barSpacing);
      
      return numBars * (width - 0.3) * barThickness * barDepth;
    }

    calculateMeshVolume(width, height, depth) {
      const meshSpacing = 0.1;
      const meshThickness = 0.005;
      const meshDepth = depth * 0.6;
      const meshWidth = width - 0.3;
      const meshHeight = height - 0.3;
      
      const horizontalBars = Math.floor(meshHeight / meshSpacing);
      const verticalBars = Math.floor(meshWidth / meshSpacing);
      
      const horizontalVolume = (horizontalBars + 1) * meshWidth * meshThickness * meshDepth;
      const verticalVolume = (verticalBars + 1) * meshThickness * meshHeight * meshDepth;
      
      return horizontalVolume + verticalVolume;
    }

    calculateProfilesVolume(width, height, depth) {
      const profileWidth = 0.05;
      const profileSpacing = 0.15;
      const numProfiles = Math.floor((width - 0.2) / profileSpacing);
      
      return numProfiles * profileWidth * (height - 0.2) * (depth * 0.8);
    }

    calculatePanelVolume(width, height, depth) {
      return (width - 0.2) * (height - 0.2) * (depth * 0.8);
    }

    calculateLaborCost(sections, globalParameters) {
      let totalCost = 0;
      
      sections.forEach(section => {
        const baseCost = 150; // Podstawowy koszt robocizny
        const complexityMultiplier = this.getComplexityMultiplier(section.fillType);
        const sizeMultiplier = (section.width * globalParameters.height) / 8; // 8m² jako baza
        
        totalCost += baseCost * complexityMultiplier * sizeMultiplier;
      });
      
      return totalCost;
    }

    calculateAssemblyCost(sections, globalParameters) {
      const baseAssemblyCost = 200; // Podstawowy koszt montażu
      const totalWidth = sections.reduce((sum, s) => sum + s.width, 0);
      const posts = sections.length - 1;
      
      return baseAssemblyCost + (totalWidth * 50) + (posts * 30);
    }

    calculateScrewsCost(sections) {
      const screwsPerSection = 8; // Śruby na sekcję
      const screwCost = 2.5; // Koszt jednej śruby
      
      return sections.length * screwsPerSection * screwCost;
    }

    getComplexityMultiplier(fillType) {
      const multipliers = {
        'pusty': 0.8,
        'nowoczesne-poziome': 1.0,
        'mesh': 1.2,
        'profiles': 1.1,
        'panel': 0.9
      };
      return multipliers[fillType] || 1.0;
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
        ['Profil ramy:', `${params.frameProfile}`],
        ['Wypełnienie:', this.getFillTypeName(params.fillType)],
        ['Profil wypełnienia:', params.fillType !== 'pusty' ? `${params.fillProfile}` : 'Brak']
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
        ['Profil ramy:', `${costs.details.frameProfile}`],
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
        'pusty': 'Puste',
        'nowoczesne-poziome': 'Nowoczesne Poziome',
        'mesh': 'Siatka',
        'profiles': 'Profile',
        'panel': 'Panel'
      };
      return types[type] || type;
    }
  }

  // GateSection - reprezentuje pojedynczą sekcję bramy
  class GateSection {
    constructor(id, type, width, height, depth, fillType, fillProfile, color = 'RAL 7016') {
      this.id = id;
      this.type = type;
      this.width = width;
      this.height = height;
      this.depth = depth;
      this.fillType = fillType;
      this.fillProfile = fillProfile;
      this.frameProfile = '15x15';
      this.color = color;
      this.group = new THREE.Group();
    }

    createSection(texturesByRAL) {
      while (this.group.children.length) {
        this.group.remove(this.group.children[0]);
      }
      const { width, height, depth, type, fillType, fillProfile, frameProfile, color } = this;
      const tex = texturesByRAL[color] || texturesByRAL['RAL 7016'];
      this.createFrame(width, height, depth, frameProfile, tex);
      this.createFill(width, height, depth, fillType, fillProfile, tex);
      switch (type) {
        case 'gate': break;
        case 'wicket': this.createWicketElements(width, height, depth, tex); break;
        case 'span': this.createSpanElements(width, height, depth, tex); break;
      }
      if (this.type === 'gate' || this.type === 'sliding') {
        this.group.position.z = -0.3; // 30 cm w drugą stronę
      } else {
        this.group.position.z = 0;
      }
    }

    createFrame(width, height, depth, frameProfile, textures) {
      const profileSize = this.parseProfileSize(frameProfile);
      const frameWidth = profileSize.width;
      const frameHeight = profileSize.height;

      const matParams = {};
      if (textures?.color) matParams.map = textures.color;
      if (textures?.normal) matParams.normalMap = textures.normal;
      if (textures?.roughness) matParams.roughnessMap = textures.roughness;
      if (textures?.ao) matParams.aoMap = textures.ao;
      matParams.metalness = 0.8; // lub inna wartość
      matParams.roughness = 0.2; // lub inna wartość
      const frameMaterial = new THREE.MeshStandardMaterial(matParams);

      // Top horizontal frame
      const topFrameGeometry = new THREE.BoxGeometry(width, frameHeight, frameWidth);
      const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
      topFrame.position.set(0, height/2 - frameHeight/2, 0);
      topFrame.castShadow = true;
      topFrame.receiveShadow = true;
      this.group.add(topFrame);

      // Bottom horizontal frame
      const bottomFrameGeometry = new THREE.BoxGeometry(width, frameHeight, frameWidth);
      const bottomFrame = new THREE.Mesh(bottomFrameGeometry, frameMaterial);
      bottomFrame.position.set(0, -height/2 + frameHeight/2, 0);
      bottomFrame.castShadow = true;
      bottomFrame.receiveShadow = true;
      this.group.add(bottomFrame);

      // Left vertical frame
      const leftFrameGeometry = new THREE.BoxGeometry(frameWidth, height, frameWidth);
      const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
      leftFrame.position.set(-width/2 + frameWidth/2, 0, 0);
      leftFrame.castShadow = true;
      leftFrame.receiveShadow = true;
      this.group.add(leftFrame);

      // Right vertical frame
      const rightFrameGeometry = new THREE.BoxGeometry(frameWidth, height, frameWidth);
      const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
      rightFrame.position.set(width/2 - frameWidth/2, 0, 0);
      rightFrame.castShadow = true;
      rightFrame.receiveShadow = true;
      this.group.add(rightFrame);
    }

    createFill(width, height, depth, fillType, fillProfile, textures) {
      switch (fillType) {
        case 'pusty':
          break;
        case 'nowoczesne-poziome':
          this.createModernHorizontalFill(width, height, depth, fillProfile, textures);
          break;
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
    }

    createModernHorizontalFill(width, height, depth, fillProfile, textures) {
      const profileConfig = this.parseFillProfile(fillProfile);
      const barThickness = profileConfig.thickness || 0.02;
      const barSpacing = profileConfig.spacing || 0.15;
      const barDepth = profileConfig.depth || depth * 0.8;

      const fillHeight = height - 0.3;
      const numBars = Math.floor(fillHeight / barSpacing);
      const actualSpacing = fillHeight / numBars;

      const barGeometry = new THREE.BoxGeometry(width - 0.3, barThickness, barDepth);
      const barMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.7,
        roughness: 0.3
      });

      for (let i = 0; i < numBars; i++) {
        const y = -fillHeight/2 + (i * actualSpacing) + (barThickness/2);
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.set(0, y, 0);
        bar.castShadow = true;
        bar.receiveShadow = true;
        this.group.add(bar);
      }
    }

    createMeshFill(width, height, depth, textures) {
      const meshSpacing = 0.1;
      const meshThickness = 0.005;
      const meshDepth = depth * 0.6;

      const meshMaterial = new THREE.MeshStandardMaterial({
        map: textures?.color,
        normalMap: textures?.normal,
        roughnessMap: textures?.roughness,
        aoMap: textures?.ao,
        metalness: 0.7,
        roughness: 0.3
      });

      const meshWidth = width - 0.3;
      const meshHeight = height - 0.3;
      
      const horizontalBars = Math.floor(meshHeight / meshSpacing);
      const verticalBars = Math.floor(meshWidth / meshSpacing);

      for (let i = 0; i <= horizontalBars; i++) {
        const y = -meshHeight/2 + (i * meshSpacing);
        const horizontalBarGeometry = new THREE.BoxGeometry(meshWidth, meshThickness, meshDepth);
        const horizontalBar = new THREE.Mesh(horizontalBarGeometry, meshMaterial);
        horizontalBar.position.set(0, y, 0);
        horizontalBar.castShadow = true;
        horizontalBar.receiveShadow = true;
        this.group.add(horizontalBar);
      }

      for (let i = 0; i <= verticalBars; i++) {
        const x = -meshWidth/2 + (i * meshSpacing);
        const verticalBarGeometry = new THREE.BoxGeometry(meshThickness, meshHeight, meshDepth);
        const verticalBar = new THREE.Mesh(verticalBarGeometry, meshMaterial);
        verticalBar.position.set(x, 0, 0);
        verticalBar.castShadow = true;
        verticalBar.receiveShadow = true;
        this.group.add(verticalBar);
      }
    }

    createProfileFill(width, height, depth, textures) {
      const profileWidth = 0.05;
      const profileSpacing = 0.15;
      const numProfiles = Math.floor((width - 0.2) / profileSpacing);
      const actualSpacing = (width - 0.2) / numProfiles;

      const profileGeometry = new THREE.BoxGeometry(profileWidth, height - 0.2, depth * 0.8);
      const matParams = {};
      if (textures?.color) matParams.map = textures.color;
      if (textures?.normal) matParams.normalMap = textures.normal;
      if (textures?.roughness) matParams.roughnessMap = textures.roughness;
      if (textures?.ao) matParams.aoMap = textures.ao;
      matParams.metalness = 0.7;
      matParams.roughness = 0.3;
      const profileMaterial = new THREE.MeshStandardMaterial(matParams);

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
      const matParams2 = {};
      if (textures?.color) matParams2.map = textures.color;
      if (textures?.normal) matParams2.normalMap = textures.normal;
      if (textures?.roughness) matParams2.roughnessMap = textures.roughness;
      if (textures?.ao) matParams2.aoMap = textures.ao;
      matParams2.metalness = 0.8;
      matParams2.roughness = 0.2;
      const panelMaterial = new THREE.MeshStandardMaterial(matParams2);
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.set(0, 0, 0);
      panel.castShadow = true;
      panel.receiveShadow = true;
      this.group.add(panel);
    }

    createWicketElements(width, height, depth, textures) {
      // Rama furtki (jak w createFrame)
      const frameProfile = this.frameProfile || '15x15';
      const profileSize = this.parseProfileSize(frameProfile);
      const frameWidth = profileSize.width;
      const frameHeight = profileSize.height;
      // Rama
      const matParams3 = {};
      if (textures?.color) matParams3.map = textures.color;
      if (textures?.normal) matParams3.normalMap = textures.normal;
      if (textures?.roughness) matParams3.roughnessMap = textures.roughness;
      if (textures?.ao) matParams3.aoMap = textures.ao;
      matParams3.metalness = 0.8;
      matParams3.roughness = 0.2;
      const frameMaterial = new THREE.MeshStandardMaterial(matParams3);
      // pionowe
      const left = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, height, frameWidth), frameMaterial);
      left.position.set(-width/2 + frameWidth/2, 0, 0);
      this.group.add(left);
      const right = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, height, frameWidth), frameMaterial);
      right.position.set(width/2 - frameWidth/2, 0, 0);
      this.group.add(right);
      // poziome
      const top = new THREE.Mesh(new THREE.BoxGeometry(width, frameHeight, frameWidth), frameMaterial);
      top.position.set(0, height/2 - frameHeight/2, 0);
      this.group.add(top);
      const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, frameHeight, frameWidth), frameMaterial);
      bottom.position.set(0, -height/2 + frameHeight/2, 0);
      this.group.add(bottom);
      // Wypełnienie furtki (jak w createFill)
      this.createFill(width, height, depth, this.fillType, this.fillProfile, textures);
      // Klamka (prosty box lub cylinder)
      const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.6, roughness: 0.3 });
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 16), handleMaterial);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(width/2 - frameWidth - 0.04, 0, frameWidth/2 + 0.01);
      this.group.add(handle);
    }

    createSpanElements(width, height, depth, textures) {
      // Dodaj elementy charakterystyczne dla przęsła
      // Na razie przęsło wygląda jak standardowa brama
    }

    parseProfileSize(profile) {
      const parts = profile.split('x');
      if (parts.length === 2) {
        return {
          width: parseInt(parts[0]) / 100,
          height: parseInt(parts[1]) / 100
        };
      }
      return { width: 0.15, height: 0.15 };
    }

    parseFillProfile(profile) {
      switch (profile) {
        case 'nowoczesne-poziome':
          return {
            thickness: 0.02,
            spacing: 0.15,
            depth: 0.08
          };
        default:
          return {
            thickness: 0.02,
            spacing: 0.15,
            depth: 0.08
          };
      }
    }

    updateParameters(params) {
      Object.assign(this, params);
    }
  }

  // ModularGateModel - zarządza modułową bramą z sekcjami
  class ModularGateModel {
    constructor(scene, texturesByRAL) {
      this.scene = scene;
      this.texturesByRAL = texturesByRAL;
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.sections = [];
      this.sectionCounter = 0;
      this.globalParameters = { height: 2, depth: 0.1, frameProfile: '15x15', sectionGap: 0.05, pattern: 'classic' };
      this.addSection('gate', 4, 'nowoczesne-poziome', 'nowoczesne-poziome', 'RAL 7016');
      this.createHighlights();
    }

    addSection(type, width, fillType, fillProfile = 'nowoczesne-poziome', color = 'RAL 7016') {
      const section = new GateSection(
        `section_${this.sectionCounter++}`,
        type,
        width,
        this.globalParameters.height,
        this.globalParameters.depth,
        fillType,
        fillProfile,
        color
      );
      this.sections.push(section);
      this.updateVisualization();
      return section;
    }

    removeSection(sectionId) {
      const index = this.sections.findIndex(s => s.id === sectionId);
      if (index !== -1) {
        this.sections.splice(index, 1);
        this.updateVisualization();
      }
    }

    moveSection(fromIndex, toIndex) {
      if (fromIndex >= 0 && fromIndex < this.sections.length &&
          toIndex >= 0 && toIndex < this.sections.length) {
        const section = this.sections.splice(fromIndex, 1)[0];
        this.sections.splice(toIndex, 0, section);
        this.updateVisualization();
      }
    }

    updateVisualization() {
      // Usuń wszystkie istniejące elementy
      while (this.group.children.length) {
        this.group.remove(this.group.children[0]);
      }

      if (this.sections.length === 0) return;

      let currentX = 0;
      const postWidth = 0.15; // Szerokość słupka łączącego
      const gap = this.globalParameters.sectionGap || 0.05;

      // Materiał dla słupków
      const postMaterial = new THREE.MeshStandardMaterial({
        map: this.texturesByRAL?.ral7016?.color,
        normalMap: this.texturesByRAL?.ral7016?.normal,
        roughnessMap: this.texturesByRAL?.ral7016?.roughness,
        aoMap: this.texturesByRAL?.ral7016?.ao,
        metalness: 0.9,
        roughness: 0.1
      });

      // Pobierz szerokości ram dla wszystkich sekcji
      const frameWidths = this.sections.map(section => {
        // parseProfileSize jest dostępne w GateSection
        return section.parseProfileSize(section.frameProfile).width;
      });

      for (let i = 0; i < this.sections.length; i++) {
        const section = this.sections[i];
        const frameWidth = frameWidths[i];
        // Utwórz sekcję
        section.createSection(this.texturesByRAL);

        // Pozycjonowanie: uwzględnij połowę ramy po lewej i prawej stronie
        // Sekcja jest rysowana względem swojego środka geometrycznego
        section.group.position.x = currentX + section.width / 2;
        this.group.add(section.group);

        // Dodaj słupek łączący (jeśli to nie ostatnia sekcja)
        if (i < this.sections.length - 1) {
          const nextFrameWidth = frameWidths[i + 1];
          // Słupek powinien być dokładnie między sekcjami, nie nachodzić na ramy
          const postX = currentX + section.width + (postWidth / 2) + (gap / 2);
          const postHeight = this.globalParameters.height + 0.5;
          const postGeometry = new THREE.BoxGeometry(postWidth, postHeight, this.globalParameters.depth);
          const post = new THREE.Mesh(postGeometry, postMaterial);
          post.position.set(postX, -0.25, 0);
          post.castShadow = true;
          post.receiveShadow = true;
          this.group.add(post);

          // Przesuń currentX o szerokość sekcji + szerokość słupka + gap
          currentX += section.width + postWidth + gap;
        } else {
          currentX += section.width;
        }
      }

      // Wyśrodkuj całą bramę
      const totalWidth = this.getTotalWidth();
      this.group.position.x = -totalWidth / 2;
    }

    createHighlights() {
      const arrowColor = 0x0000ff;
      const arrowLength = 1.0;
      const arrowHeadLength = 0.2;
      const arrowHeadWidth = 0.1;

      this.widthArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), arrowLength, arrowColor, arrowHeadLength, arrowHeadWidth);
      this.widthArrow.visible = false;
      this.scene.add(this.widthArrow);

      this.heightArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), arrowLength, arrowColor, arrowHeadLength, arrowHeadWidth);
      this.heightArrow.visible = false;
      this.scene.add(this.heightArrow);

      this.depthArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), arrowLength, arrowColor, arrowHeadLength, arrowHeadWidth);
      this.depthArrow.visible = false;
      this.scene.add(this.depthArrow);
    }

    showHighlight(dimension) {
      this.hideHighlights();
      const offset = 0.5;

      switch (dimension) {
        case 'width':
          const totalWidth = this.getTotalWidth();
          this.widthArrow.setLength(totalWidth + 0.5, 0.2, 0.1);
          this.widthArrow.position.set(0, this.globalParameters.height / 2 + offset, 0);
          this.widthArrow.setDirection(new THREE.Vector3(1, 0, 0));
          this.widthArrow.visible = true;
          break;
        case 'height':
          this.heightArrow.setLength(this.globalParameters.height + 0.5, 0.2, 0.1);
          this.heightArrow.position.set(this.getTotalWidth() / 2 + offset, 0, 0);
          this.heightArrow.setDirection(new THREE.Vector3(0, 1, 0));
          this.heightArrow.visible = true;
          break;
        case 'depth':
          this.depthArrow.setLength(this.globalParameters.depth + 0.5, 0.2, 0.1);
          this.depthArrow.position.set(this.getTotalWidth() / 2 + offset, this.globalParameters.height / 2 + offset, 0);
          this.depthArrow.setDirection(new THREE.Vector3(0, 0, 1));
          this.depthArrow.visible = true;
          break;
      }
    }

    hideHighlights() {
      this.widthArrow.visible = false;
      this.heightArrow.visible = false;
      this.depthArrow.visible = false;
    }

    getTotalWidth() {
      if (this.sections.length === 0) return 0;
      
      let totalWidth = 0;
      const postWidth = 0.15;
      const gap = this.globalParameters.sectionGap || 0.05;
      
      for (let i = 0; i < this.sections.length; i++) {
        totalWidth += this.sections[i].width;
        if (i < this.sections.length - 1) {
          totalWidth += postWidth + gap;
        }
      }
      
      return totalWidth;
    }

    updateGlobalParameters(params) {
      Object.assign(this.globalParameters, params);
      
      // Zaktualizuj wszystkie sekcje
      this.sections.forEach(section => {
        section.height = this.globalParameters.height;
        section.depth = this.globalParameters.depth;
        section.frameProfile = this.globalParameters.frameProfile;
      });
      
      this.updateVisualization();
    }

    updateSectionParameters(sectionId, params) {
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        section.updateParameters(params);
        this.updateVisualization();
      }
    }

    getParameters() {
      return {
        sections: this.sections.map(s => ({
          id: s.id,
          type: s.type,
          width: s.width,
          height: s.height,
          depth: s.depth,
          fillType: s.fillType,
          fillProfile: s.fillProfile,
          frameProfile: s.frameProfile,
          color: s.color
        })),
        globalParameters: this.globalParameters
      };
    }
  }

  // ModularUIManager - zarządza UI dla modułowej bramy
  class ModularUIManager {
    constructor(model, costCalculator) {
      this.model = model;
      this.costCalculator = costCalculator;
      this.activeSectionId = 'global'; // domyślnie globalne
      this.initUI();
      this.updateCost();
    }

    initUI() {
      const container = document.getElementById('parameters');
      container.innerHTML = '';

      // Globalne parametry
      this.createGlobalParametersSection(container);

      // Sekcje bramy
      this.createSectionsContainer(container);

      // Przycisk dodawania sekcji
      this.createAddSectionButton(container);
    }

    createGlobalParametersSection(container) {
      const globalSection = document.createElement('div');
      globalSection.className = 'global-parameters-section';
      globalSection.dataset.sectionId = 'global';
      globalSection.innerHTML = `
        <div class="section-header">
          <h3>Parametry Globalne</h3>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="section-content">
          <div class="global-controls"></div>
        </div>
      `;

      // Obsługa zwijania
      const header = globalSection.querySelector('.section-header');
      header.addEventListener('click', () => {
        this.toggleSection('global');
      });

      if (this.activeSectionId !== 'global') {
        globalSection.classList.add('collapsed');
      } else {
        globalSection.classList.remove('collapsed');
      }

      const globalControls = globalSection.querySelector('.global-controls');

      // Height slider
      this.addSlider(globalControls, 'Wysokość (m):', 1, 3, this.model.globalParameters.height, val => {
        this.model.updateGlobalParameters({ height: val });
        this.updateCost();
      });

      // Depth slider
      this.addSlider(globalControls, 'Głębokość (m):', 0.05, 0.2, this.model.globalParameters.depth, val => {
        this.model.updateGlobalParameters({ depth: val });
        this.updateCost();
      });

      // Frame profile dropdown
      this.addDropdown(globalControls, 'Profil Ramy:', [
        { text: '15x15 cm', value: '15x15' },
        { text: '20x20 cm', value: '20x20' },
        { text: '25x25 cm', value: '25x25' }
      ], this.model.globalParameters.frameProfile, val => {
        this.model.updateGlobalParameters({ frameProfile: val });
        this.updateCost();
      });

      // Section gap slider+input
      this.addSlider(globalControls, 'Odstęp między sekcjami (m):', 0.01, 0.2, this.model.globalParameters.sectionGap, val => {
        this.model.updateGlobalParameters({ sectionGap: val });
        this.updateCost();
      });

      // Wzór dropdown
      this.addDropdown(globalControls, 'Wzór:', [
        { text: 'Klasyczny', value: 'classic' },
        { text: 'Nowoczesny', value: 'modern' },
        { text: 'Industrialny', value: 'industrial' },
        { text: 'Dekoracyjny', value: 'decor' }
      ], this.model.globalParameters.pattern, val => {
        this.model.updateGlobalParameters({ pattern: val });
        this.updateCost();
      });

      container.appendChild(globalSection);
    }

    createSectionsContainer(container) {
      const sectionsContainer = document.createElement('div');
      sectionsContainer.className = 'sections-container';
      sectionsContainer.id = 'sections-container';
      container.appendChild(sectionsContainer);

      this.updateSectionsUI();
    }

    updateSectionsUI() {
      const container = document.getElementById('sections-container');
      container.innerHTML = '';

      this.model.sections.forEach((section, index) => {
        this.createSectionUI(container, section, index);
      });
    }

    createSectionUI(container, section, index) {
      const sectionElement = document.createElement('div');
      sectionElement.className = 'gate-section';
      sectionElement.dataset.sectionId = section.id;
      sectionElement.dataset.index = index;
      sectionElement.draggable = true;

      if (this.activeSectionId !== section.id) {
        sectionElement.classList.add('collapsed');
      } else {
        sectionElement.classList.remove('collapsed');
      }

      const sectionTypeName = this.getSectionTypeName(section.type);
      sectionElement.innerHTML = `
        <div class="section-header">
          <h4>${sectionTypeName} (${section.width}m)</h4>
          <div class="section-controls">
            <button class="move-up-btn" title="Przesuń w górę">↑</button>
            <button class="move-down-btn" title="Przesuń w dół">↓</button>
            <button class="remove-section-btn" title="Usuń sekcję">×</button>
            <span class="toggle-icon">▼</span>
          </div>
        </div>
        <div class="section-content">
          <div class="section-controls"></div>
        </div>
      `;

      // Dodaj drag-handle do header jeśli istnieje
      const header = sectionElement.querySelector('.section-header');
      if (header) {
        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.title = 'Przeciągnij, aby zmienić kolejność';
        dragHandle.innerHTML = '☰';
        dragHandle.style.cursor = 'grab';
        dragHandle.style.marginRight = '8px';
        header.insertBefore(dragHandle, header.firstChild);
        header.addEventListener('click', () => {
          this.toggleSection(section.id);
        });
      }

      // Drag & drop obsługa
      sectionElement.addEventListener('dragstart', (e) => {
        sectionElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
      });
      sectionElement.addEventListener('dragend', () => {
        sectionElement.classList.remove('dragging');
      });
      sectionElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        sectionElement.classList.add('drag-over');
      });
      sectionElement.addEventListener('dragleave', () => {
        sectionElement.classList.remove('drag-over');
      });
      sectionElement.addEventListener('drop', (e) => {
        e.preventDefault();
        sectionElement.classList.remove('drag-over');
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = index;
        if (fromIndex !== toIndex) {
          this.model.moveSection(fromIndex, toIndex);
          this.updateSectionsUI();
          this.updateCost();
        }
      });

      // Przyciski do przesuwania i usuwania sekcji
      const moveUpBtn = sectionElement.querySelector('.move-up-btn');
      const moveDownBtn = sectionElement.querySelector('.move-down-btn');
      const removeBtn = sectionElement.querySelector('.remove-section-btn');
      moveUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (index > 0) {
          this.model.moveSection(index, index - 1);
          this.updateSectionsUI();
          this.updateCost();
        }
      });
      moveDownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (index < this.model.sections.length - 1) {
          this.model.moveSection(index, index + 1);
          this.updateSectionsUI();
          this.updateCost();
        }
      });
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.model.sections.length > 1) {
          this.model.removeSection(section.id);
          this.updateSectionsUI();
          this.updateCost();
        }
      });

      // Dodaj kontrolki do sekcji (suwaki, dropdowny)
      const sectionControls = sectionElement.querySelector('.section-content .section-controls');
      this.addSlider(sectionControls, 'Szerokość (m):', 1, 6, section.width, val => {
        this.model.updateSectionParameters(section.id, { width: val });
        this.updateSectionsUI();
        this.updateCost();
      });
      this.addDropdown(sectionControls, 'Typ Wypełnienia:', [
        { text: 'Puste', value: 'pusty' },
        { text: 'Nowoczesne Poziome', value: 'nowoczesne-poziome' },
        { text: 'Siatka', value: 'mesh' },
        { text: 'Profile', value: 'profiles' },
        { text: 'Panel', value: 'panel' }
      ], section.fillType, val => {
        this.model.updateSectionParameters(section.id, { fillType: val });
        this.updateSectionsUI();
        this.updateCost();
      });
      if (section.fillType !== 'pusty') {
        this.addDropdown(sectionControls, 'Profil Wypełnienia:', [
          { text: 'Nowoczesne Poziome', value: 'nowoczesne-poziome' },
          { text: 'Klasyczne Pionowe', value: 'klasyczne-pionowe' },
          { text: 'Siatka Standard', value: 'siatka-standard' }
        ], section.fillProfile, val => {
          this.model.updateSectionParameters(section.id, { fillProfile: val });
          this.updateCost();
        });
      }
      this.addRALDropdown(sectionControls, 'Kolor (RAL):', window.RAL_PALETTE,
        section.color,
        val => {
          this.model.updateSectionParameters(section.id, { color: val });
          this.updateSectionsUI();
          this.updateCost();
        }
      );

      container.appendChild(sectionElement);
    }

    createAddSectionButton(container) {
      const addSectionDiv = document.createElement('div');
      addSectionDiv.className = 'add-section-container';
      addSectionDiv.innerHTML = `
        <button class="add-section-btn" id="add-section-btn">
          <span class="icon">+</span>
          Dodaj Sekcję
        </button>
        <div class="add-section-menu" id="add-section-menu" style="display: none;">
          <button class="menu-item" data-type="gate">Brama</button>
          <button class="menu-item" data-type="wicket">Furtka</button>
          <button class="menu-item" data-type="span">Przęsło</button>
        </div>
      `;

      const addBtn = addSectionDiv.querySelector('#add-section-btn');
      const menu = addSectionDiv.querySelector('#add-section-menu');

      addBtn.addEventListener('click', () => {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      });

      menu.addEventListener('click', (e) => {
        if (e.target.classList.contains('menu-item')) {
          const type = e.target.dataset.type;
          this.model.addSection(type, 2, 'nowoczesne-poziome');
          this.updateSectionsUI();
          this.updateCost();
          menu.style.display = 'none';
        }
      });

      // Zamknij menu po kliknięciu poza nim
      document.addEventListener('click', (e) => {
        if (!addSectionDiv.contains(e.target)) {
          menu.style.display = 'none';
        }
      });

      container.appendChild(addSectionDiv);
    }

    addSlider(container, label, min, max, value, onChange) {
      // Usuwam niestandardowe komponenty, renderuję klasyczny suwak + input + label w jednej linii
      const wrapper = document.createElement('div');
      wrapper.className = 'slider-wrapper';

      const labelEl = document.createElement('label');
      labelEl.className = 'ui-label';
      labelEl.textContent = label;

      const input = document.createElement('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = 0.01;
      input.value = value;
      input.style.flex = '1 1 120px';
      input.style.margin = '0 4px';

      const numberInput = document.createElement('input');
      numberInput.type = 'number';
      numberInput.min = min;
      numberInput.max = max;
      numberInput.step = 0.01;
      numberInput.value = value;
      numberInput.className = 'slider-number-input';
      numberInput.style.width = '40px';
      numberInput.style.height = '28px';
      numberInput.style.marginLeft = '6px';
      numberInput.style.textAlign = 'right';

      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        numberInput.value = val;
        valueDisplay.textContent = `${val}m`;
        onChange(val);
      });
      numberInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = min;
        if (val < min) val = min;
        if (val > max) val = max;
        input.value = val;
        valueDisplay.textContent = `${val}m`;
        onChange(val);
      });
      numberInput.addEventListener('focus', (e) => {
        e.target.select();
      });
      numberInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          let val = parseFloat(e.target.value);
          if (isNaN(val)) val = min;
          if (val < min) val = min;
          if (val > max) val = max;
          input.value = val;
          valueDisplay.textContent = `${val}m`;
          onChange(val);
        }
      });

      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'value-display';
      valueDisplay.textContent = `${value}m`;
      valueDisplay.style.marginLeft = '4px';

      wrapper.appendChild(labelEl);
      wrapper.appendChild(input);
      wrapper.appendChild(numberInput);
      wrapper.appendChild(valueDisplay);
      container.appendChild(wrapper);
    }

    addDropdown(container, label, options, value, onChange) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dropdown-wrapper';
      wrapper.style.marginBottom = '18px';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '16px';

      const labelEl = document.createElement('label');
      labelEl.className = 'ui-label';
      labelEl.textContent = label;
      labelEl.style.flex = '0 0 180px';
      labelEl.style.fontSize = '1.1em';
      labelEl.style.fontWeight = '600';

      const select = document.createElement('select');
      select.style.flex = '1 1 120px';
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

    getSectionTypeName(type) {
      const types = {
        'gate': 'Brama',
        'wicket': 'Furtka',
        'span': 'Przęsło'
      };
      return types[type] || type;
    }

    updateCost() {
      const costs = this.costCalculator.calculateModular(this.model.getParameters()) || {};
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
          <span>${(costs.assemblyCost||0).toFixed(2)} PLN</span>
        </div>
        <div class="cost-item">
          <span>Śruby:</span>
          <span>${(costs.screwsCost||0).toFixed(2)} PLN</span>
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

    setActiveSection(sectionId) {
      this.activeSectionId = sectionId;
      // Przeładuj UI, by tylko jedna sekcja była rozwinięta
      this.initUI();
    }

    // Dodaję toggleSection do ModularUIManager
    toggleSection(sectionId) {
      if (this.activeSectionId === sectionId) {
        this.activeSectionId = null;
      } else {
        this.activeSectionId = sectionId;
      }
      this.updateSectionsUI();
      // Dla globalnej sekcji
      if (sectionId === 'global') {
        this.createGlobalParametersSection(document.getElementById('parameters'));
      }
    }

    addRALDropdown(container, label, options, value, onChange) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dropdown-wrapper';
      const labelEl = document.createElement('label');
      labelEl.className = 'ui-label';
      labelEl.textContent = label;
      const select = document.createElement('select');
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        // Dodaj kwadracik z kolorem przed tekstem
        option.innerHTML = `<span style='display:inline-block;width:14px;height:14px;background:${window.RAL_COLORS[opt.value]};border-radius:3px;margin-right:6px;vertical-align:middle;'></span> ${opt.text}`;
        if (opt.value === value) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener('change', (e) => onChange(e.target.value));
      wrapper.appendChild(labelEl);
      wrapper.appendChild(select);
      container.appendChild(wrapper);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('three-canvas');
    // USUŃ powieloną deklarację sceneManager
    // const sceneManager = new SceneManager(canvas);
    // await sceneManager.loadTextures();

    // Inicjalizacja aplikacji (fragment startowy, np. po załadowaniu DOM)
    const texturesByRAL = window.generateRALTextures();
    const sceneManager = new SceneManager(canvas);
    const modularGateModel = new ModularGateModel(sceneManager.scene, texturesByRAL);
    const costCalculator = new CostCalculator();
    const modularUIManager = new ModularUIManager(modularGateModel, costCalculator);

    // Dodaj kontrolki do sceny
    const controls = new THREE.OrbitControls(sceneManager.camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;

    // Obsługa rozmiaru okna
    window.addEventListener('resize', () => {
      sceneManager.onResize();
    });

    // Animacja
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
    }
    animate();

    // Obsługa przycisków narzędzi
    document.getElementById('pdf-btn').addEventListener('click', () => {
      const pdfExporter = new ExportPDF(sceneManager.renderer);
      const parameters = modularGateModel.getParameters();
      const costs = costCalculator.calculateModular(parameters);
      pdfExporter.generate(parameters, costs);
    });

    document.getElementById('specs-btn').addEventListener('click', () => {
      const parameters = modularGateModel.getParameters();
      const costs = costCalculator.calculateModular(parameters);
      
      const specsWindow = window.open('', '_blank', 'width=800,height=600');
      specsWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Specyfikacja Bramy</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .spec-item { margin: 10px 0; padding: 10px; background: #f5f5f5; }
            .cost-item { margin: 5px 0; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Specyfikacja Bramy Modułowej</h1>
          <div class="spec-item">
            <h3>Parametry Globalne:</h3>
            <p>Wysokość: ${parameters.globalParameters.height}m</p>
            <p>Głębokość: ${parameters.globalParameters.depth}m</p>
            <p>Profil ramy: ${parameters.globalParameters.frameProfile}</p>
          </div>
          <div class="spec-item">
            <h3>Sekcje (${parameters.sections.length}):</h3>
            ${parameters.sections.map((section, index) => `
              <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #007bff;">
                <h4>Sekcja ${index + 1}: ${modularUIManager.getSectionTypeName(section.type)}</h4>
                <p>Szerokość: ${section.width}m</p>
                <p>Typ wypełnienia: ${section.fillType}</p>
                <p>Profil wypełnienia: ${section.fillProfile}</p>
              </div>
            `).join('')}
          </div>
          <div class="spec-item">
            <h3>Kosztorys:</h3>
            <div class="cost-item">Stal: ${costs.steelCost.toFixed(2)} PLN</div>
            <div class="cost-item">Ocynk: ${costs.galvCost.toFixed(2)} PLN</div>
            <div class="cost-item">Robocizna: ${costs.laborCost.toFixed(2)} PLN</div>
            <div class="cost-item">Montaż: ${costs.assemblyCost.toFixed(2)} PLN</div>
            <div class="cost-item">Śruby: ${costs.screwsCost.toFixed(2)} PLN</div>
            <div class="cost-item">Wypełnienie: ${costs.fillCost.toFixed(2)} PLN</div>
            <div class="total">Razem: ${costs.total.toFixed(2)} PLN</div>
          </div>
        </body>
        </html>
      `);
      specsWindow.document.close();
    });

    document.getElementById('drawings-btn').addEventListener('click', () => {
      const parameters = modularGateModel.getParameters();
      const totalWidth = modularGateModel.getTotalWidth();
      
      const drawingWindow = window.open('', '_blank', 'width=1000,height=800');
      drawingWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rysunki Techniczne</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .drawing { margin: 20px 0; border: 1px solid #ccc; padding: 20px; }
            .dimensions { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Rysunki Techniczne Bramy Modułowej</h1>
          
          <div class="drawing">
            <h3>Widok z przodu</h3>
            <svg width="800" height="400" style="border: 1px solid #000;">
              <rect x="50" y="50" width="${totalWidth * 100}" height="${parameters.globalParameters.height * 100}" 
                    fill="none" stroke="#000" stroke-width="2"/>
              
              ${parameters.sections.map((section, index) => {
                let x = 50;
                for (let i = 0; i < index; i++) {
                  x += parameters.sections[i].width * 100 + 15; // 15cm na słupek
                }
                return `
                  <rect x="${x}" y="50" width="${section.width * 100}" height="${parameters.globalParameters.height * 100}" 
                        fill="none" stroke="#007bff" stroke-width="1" stroke-dasharray="5,5"/>
                  <text x="${x + section.width * 50}" y="30" text-anchor="middle" class="dimensions">
                    ${modularUIManager.getSectionTypeName(section.type)} (${section.width}m)
                  </text>
                `;
              }).join('')}
              
              <text x="50" y="${parameters.globalParameters.height * 100 + 80}" class="dimensions">
                Szerokość całkowita: ${totalWidth.toFixed(2)}m
              </text>
              <text x="50" y="${parameters.globalParameters.height * 100 + 100}" class="dimensions">
                Wysokość: ${parameters.globalParameters.height}m
              </text>
            </svg>
          </div>
          
          <div class="drawing">
            <h3>Widok z boku</h3>
            <svg width="400" height="400" style="border: 1px solid #000;">
              <rect x="50" y="50" width="${parameters.globalParameters.depth * 100}" height="${parameters.globalParameters.height * 100}" 
                    fill="none" stroke="#000" stroke-width="2"/>
              <text x="50" y="${parameters.globalParameters.height * 100 + 80}" class="dimensions">
                Głębokość: ${parameters.globalParameters.depth}m
              </text>
            </svg>
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

    // Obsługa przycisków narzędzi
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
              if (data.modularParameters) {
                // Import modułowej bramy
                modularGateModel.sections = [];
                modularGateModel.sectionCounter = 0;
                
                // Przywróć parametry globalne (w tym pattern)
                modularGateModel.updateGlobalParameters(data.modularParameters.globalParameters);
                
                // Przywróć sekcje
                data.modularParameters.sections.forEach(sectionData => {
                  const section = new GateSection(
                    sectionData.id,
                    sectionData.type,
                    sectionData.width,
                    sectionData.height,
                    sectionData.depth,
                    sectionData.fillType,
                    sectionData.fillProfile,
                    sectionData.color
                  );
                  section.frameProfile = sectionData.frameProfile;
                  modularGateModel.sections.push(section);
                  modularGateModel.sectionCounter = Math.max(modularGateModel.sectionCounter, parseInt(sectionData.id.split('_')[1]) + 1);
                });
                
                modularGateModel.updateVisualization();
                modularUIManager.updateSectionsUI();
                modularUIManager.updateCost();
              } else {
                // Import starego formatu - konwersja do modułowego
                const oldParams = data.parameters;
                modularGateModel.sections = [];
                modularGateModel.sectionCounter = 0;
                
                modularGateModel.updateGlobalParameters({
                  height: oldParams.height,
                  depth: oldParams.depth,
                  frameProfile: oldParams.frameProfile
                });
                
                // Utwórz sekcję z parametrami starej bramy
                modularGateModel.addSection('gate', oldParams.width, oldParams.fillType, oldParams.fillProfile, oldParams.color);
                modularUIManager.updateSectionsUI();
                modularUIManager.updateCost();
              }
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
      const parameters = modularGateModel.getParameters();
      const blob = new Blob([JSON.stringify({ modularParameters: parameters }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'projekt_bramy.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Export GateModel, UIManager, CostCalculator to window
  window.GateModel = GateModel;
  window.UIManager = UIManager;
  window.CostCalculator = CostCalculator;
})();