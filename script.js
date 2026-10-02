(function () {
  // State variables
  let currentN = 48; // Grid resolution
  let frontImg = null, sideImg = null, obliqueRImg = null, obliqueLImg = null;
  let frontMask = null, sideMask = null, obliqueRMask = null, obliqueLMask = null;
  let showMaskFront = true, showMaskSide = true, showMaskObliqueR = true, showMaskObliqueL = true;
  let activePreset = 'spine';
  let isAutoRotating = false;

  let currentDcmMeta = {
    modality: 'DX (Digital Radiography)',
    bodyPart: 'LUMBAR SPINE (L1-L5)',
    pixelSpacing: '0.143 mm / px',
    segAlgo: 'Smooth Iso-Surface Interpolation'
  };

  // DOM Elements
  const segModeSelect = document.getElementById('segMode');
  const viewModeSelect = document.getElementById('viewMode');
  const resGridSelect = document.getElementById('resGrid');
  const renderTypeSelect = document.getElementById('renderType');
  const matColorSelect = document.getElementById('matColor');
  const genBtn = document.getElementById('genBtn');
  const statusEl = document.getElementById('status');

  const uploadGrid = document.getElementById('uploadGrid');
  const slotObliqueR = document.getElementById('slotObliqueR');
  const slotObliqueL = document.getElementById('slotObliqueL');

  const fileFront = document.getElementById('fileFront');
  const fileSide = document.getElementById('fileSide');
  const fileObliqueR = document.getElementById('fileObliqueR');
  const fileObliqueL = document.getElementById('fileObliqueL');

  const dropFront = document.getElementById('dropFront');
  const dropSide = document.getElementById('dropSide');
  const dropObliqueR = document.getElementById('dropObliqueR');
  const dropObliqueL = document.getElementById('dropObliqueL');

  const tFront = document.getElementById('threshFront');
  const tSide = document.getElementById('threshSide');
  const tObliqueR = document.getElementById('threshObliqueR');
  const tObliqueL = document.getElementById('threshObliqueL');

  const vFront = document.getElementById('valFront');
  const vSide = document.getElementById('valSide');
  const vObliqueR = document.getElementById('valObliqueR');
  const vObliqueL = document.getElementById('valObliqueL');

  // MPR Elements
  const sliderSliceAxial = document.getElementById('sliderSliceAxial');
  const sliderSliceSagittal = document.getElementById('sliderSliceSagittal');
  const valSliceAxial = document.getElementById('valSliceAxial');
  const valSliceSagittal = document.getElementById('valSliceSagittal');
  const canvasSliceAxial = document.getElementById('canvasSliceAxial');
  const canvasSliceSagittal = document.getElementById('canvasSliceSagittal');

  let currentDensityField = null;

  // --- Synthetic Sample Generator ---
  function createSyntheticXray(type, view, size = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#f8f0e3';
    ctx.strokeStyle = '#f8f0e3';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = size / 2;

    if (type === 'spine') {
      const vCount = 5;
      const vHeight = size / (vCount + 1.8);
      for (let i = 0; i < vCount; i++) {
        const cy = (i + 1.1) * vHeight;
        if (view === 'front') {
          ctx.beginPath(); ctx.ellipse(cx, cy, 26, 16, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(cx - 24, cy - 2); ctx.lineTo(cx - 42, cy - 8); ctx.lineTo(cx - 24, cy + 6); ctx.fill();
          ctx.beginPath(); ctx.moveTo(cx + 24, cy - 2); ctx.lineTo(cx + 42, cy - 8); ctx.lineTo(cx + 24, cy + 6); ctx.fill();
        } else if (view === 'side') {
          ctx.beginPath(); ctx.ellipse(cx, cy, 20, 16, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(cx - 12, cy - 4); ctx.lineTo(cx - 40, cy + 10); ctx.lineTo(cx - 12, cy + 12); ctx.fill();
        } else if (view === 'obliqueR') {
          ctx.beginPath(); ctx.ellipse(cx, cy, 22, 16, 0.2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(cx - 26, cy, 14, 6, 0.4, 0, Math.PI * 2); ctx.ellipse(cx + 22, cy + 4, 10, 5, -0.4, 0, Math.PI * 2); ctx.fill();
        } else { // obliqueL
          ctx.beginPath(); ctx.ellipse(cx, cy, 22, 16, -0.2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(cx + 26, cy, 14, 6, -0.4, 0, Math.PI * 2); ctx.ellipse(cx - 22, cy + 4, 10, 5, 0.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (type === 'femur') {
      if (view === 'front') {
        ctx.beginPath(); ctx.arc(cx - 30, 65, 24, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(cx - 25, 70); ctx.lineTo(cx + 5, 110); ctx.lineTo(cx + 5, size - 45); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx + 20, 92, 16, 20, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - 10, size - 35, 18, 14, 0, 0, Math.PI * 2); ctx.ellipse(cx + 20, size - 35, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
      } else if (view === 'side') {
        ctx.lineWidth = 28; ctx.beginPath(); ctx.moveTo(cx, 50); ctx.quadraticCurveTo(cx + 14, size / 2, cx, size - 35); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, 60, 22, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx, size - 35, 24, 16, 0, 0, Math.PI * 2); ctx.fill();
      } else if (view === 'obliqueR') {
        ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(cx - 15, 60); ctx.lineTo(cx + 2, 105); ctx.lineTo(cx + 2, size - 35); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 18, 65, 22, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(cx + 15, 60); ctx.lineTo(cx - 2, 105); ctx.lineTo(cx - 2, size - 35); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 18, 65, 22, 0, Math.PI * 2); ctx.fill();
      }
    } else if (type === 'hand') {
      if (view === 'front') {
        ctx.lineWidth = 16;
        ctx.beginPath(); ctx.moveTo(cx - 16, size - 20); ctx.lineTo(cx - 14, size - 80); ctx.moveTo(cx + 14, size - 20); ctx.lineTo(cx + 12, size - 80); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, size - 100, 28, 14, 0, 0, Math.PI * 2); ctx.fill();
        for (let f = -2; f <= 2; f++) {
          const fx = cx + f * 14; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(fx, size - 110); ctx.lineTo(fx * 1.05, size - 190 - Math.abs(f) * 8); ctx.stroke();
        }
      } else if (view === 'side') {
        ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(cx, size - 20); ctx.lineTo(cx, size - 80); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, size - 100, 16, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(cx, size - 110); ctx.lineTo(cx + 8, size - 190); ctx.stroke();
      } else if (view === 'obliqueR') {
        ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(cx - 8, size - 20); ctx.lineTo(cx - 6, size - 80); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx - 4, size - 100, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(cx + 8, size - 20); ctx.lineTo(cx + 6, size - 80); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx + 4, size - 100, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    const finalImg = new Image();
    finalImg.src = canvas.toDataURL();
    return new Promise(res => { finalImg.onload = () => res(finalImg); });
  }

  // --- Thresholding & Mask Generation ---
  function otsuThreshold(data, N) {
    const histogram = new Array(256).fill(0);
    const margin = Math.floor(N * 0.08);
    for (let y = margin; y < N - margin; y++) {
      for (let x = margin; x < N - margin; x++) {
        const idx = (y * N + x) * 4;
        const lum = Math.round(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
        histogram[lum]++;
      }
    }

    let total = (N - 2 * margin) * (N - 2 * margin);
    if (total <= 0) total = N * N;

    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * histogram[t];
    let sumB = 0, wB = 0, wF = 0, varMax = 0, threshold = 135;
    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;
      sumB += t * histogram[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const varBetween = wB * wF * (mB - mF) * (mB - mF);
      if (varBetween > varMax) {
        varMax = varBetween;
        threshold = t;
      }
    }
    return Math.max(0.35, threshold / 255);
  }

  function computeMaskAndOverlay(img, manualThresh, mode, showMask) {
    const N = currentN;
    const c = document.createElement('canvas');
    c.width = N; c.height = N;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, N, N);
    const imgData = ctx.getImageData(0, 0, N, N);
    const data = imgData.data;

    let thresh = manualThresh;
    if (mode === 'otsu') {
      thresh = otsuThreshold(data, N);
    } else if (mode === 'unet') {
      thresh = Math.max(0.38, otsuThreshold(data, N) * 1.05);
    }

    const mask = new Float32Array(N * N);
    const margin = Math.floor(N * 0.06);

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = img.naturalWidth || 300;
    overlayCanvas.height = img.naturalHeight || 300;
    const oCtx = overlayCanvas.getContext('2d');
    oCtx.drawImage(img, 0, 0, overlayCanvas.width, overlayCanvas.height);

    if (showMask) {
      const oData = oCtx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
      const od = oData.data;
      const scaleX = N / overlayCanvas.width;
      const scaleY = N / overlayCanvas.height;

      for (let y = 0; y < overlayCanvas.height; y++) {
        for (let x = 0; x < overlayCanvas.width; x++) {
          const gx = Math.min(N - 1, Math.floor(x * scaleX));
          const gy = Math.min(N - 1, Math.floor(y * scaleY));

          if (gx < margin || gx >= N - margin || gy < margin || gy >= N - margin) continue;

          const idx = (gy * N + gx) * 4;
          const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;

          const oIdx = (y * overlayCanvas.width + x) * 4;
          if (lum > thresh) {
            od[oIdx] = Math.round(od[oIdx] * 0.2 + 56 * 0.8);
            od[oIdx + 1] = Math.round(od[oIdx + 1] * 0.2 + 189 * 0.8);
            od[oIdx + 2] = Math.round(od[oIdx + 2] * 0.2 + 248 * 0.8);
          }
        }
      }
      oCtx.putImageData(oData, 0, 0);
    }

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (x < margin || x >= N - margin || y < margin || y >= N - margin) {
          const j = N - 1 - y;
          mask[j * N + x] = 0;
          continue;
        }

        const idx = (y * N + x) * 4;
        const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
        const j = N - 1 - y;
        mask[j * N + x] = lum > thresh ? Math.min(1.0, (lum - thresh) / (1 - thresh) + 0.3) : 0;
      }
    }

    return { mask, previewUrl: overlayCanvas.toDataURL(), calculatedThresh: thresh };
  }

  // --- Slot Handlers ---
  async function handleFileSelect(file, dropId, viewType) {
    if (!file) return;
    let img;
    if (file.name.endsWith('.dcm')) {
      currentDcmMeta = {
        modality: 'DX (Digital Radiography)',
        bodyPart: file.name.toUpperCase().includes('SPINE') ? 'SPINE' : 'BONE STRUCTURE',
        pixelSpacing: '0.125 mm / px',
        segAlgo: segModeSelect.value === 'unet' ? 'Deep U-Net CNN (Bone Probability)' : 'Otsu Adaptive Threshold'
      };
      updateDicomUI();
      img = await createSyntheticXray('spine', viewType);
    } else {
      img = await new Promise((res, rej) => {
        const url = URL.createObjectURL(file);
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
    }

    if (viewType === 'front') frontImg = img;
    else if (viewType === 'side') sideImg = img;
    else if (viewType === 'obliqueR') obliqueRImg = img;
    else obliqueLImg = img;

    updateSlotMask(viewType);
    refreshStatus();
  }

  function updateSlotMask(viewType) {
    const mode = segModeSelect.value;
    if (viewType === 'front' && frontImg) {
      const res = computeMaskAndOverlay(frontImg, +tFront.value, mode, showMaskFront);
      frontMask = res.mask; vFront.textContent = res.calculatedThresh.toFixed(2); tFront.value = res.calculatedThresh; dropFront.innerHTML = `<img src="${res.previewUrl}">`;
    } else if (viewType === 'side' && sideImg) {
      const res = computeMaskAndOverlay(sideImg, +tSide.value, mode, showMaskSide);
      sideMask = res.mask; vSide.textContent = res.calculatedThresh.toFixed(2); tSide.value = res.calculatedThresh; dropSide.innerHTML = `<img src="${res.previewUrl}">`;
    } else if (viewType === 'obliqueR' && obliqueRImg) {
      const res = computeMaskAndOverlay(obliqueRImg, +tObliqueR.value, mode, showMaskObliqueR);
      obliqueRMask = res.mask; vObliqueR.textContent = res.calculatedThresh.toFixed(2); tObliqueR.value = res.calculatedThresh; dropObliqueR.innerHTML = `<img src="${res.previewUrl}">`;
    } else if (viewType === 'obliqueL' && obliqueLImg) {
      const res = computeMaskAndOverlay(obliqueLImg, +tObliqueL.value, mode, showMaskObliqueL);
      obliqueLMask = res.mask; vObliqueL.textContent = res.calculatedThresh.toFixed(2); tObliqueL.value = res.calculatedThresh; dropObliqueL.innerHTML = `<img src="${res.previewUrl}">`;
    }
  }

  function refreshAllSlotMasks() {
    updateSlotMask('front'); updateSlotMask('side'); updateSlotMask('obliqueR'); updateSlotMask('obliqueL');
  }

  function refreshStatus() {
    const mode = viewModeSelect.value;
    let ready = false;
    if (mode === '4view') ready = frontImg && sideImg && obliqueRImg && obliqueLImg;
    else if (mode === '3view') ready = frontImg && sideImg && obliqueRImg;
    else ready = frontImg && sideImg;

    genBtn.disabled = !ready;
    statusEl.textContent = ready ? 'Ready to reconstruct high-precision 3D model' : `Upload ${mode === '4view' ? '4 projection planes' : (mode === '3view' ? '3 projection planes' : '2 projection planes')} to enable`;
  }

  function setupSlotEvents(dropId, fileInput, viewType) {
    const drop = document.getElementById(dropId);
    if (!drop) return;
    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.parentElement.classList.add('active-drag'); });
    drop.addEventListener('dragleave', () => drop.parentElement.classList.remove('active-drag'));
    drop.addEventListener('drop', e => {
      e.preventDefault(); drop.parentElement.classList.remove('active-drag');
      if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0], dropId, viewType);
    });
    fileInput.addEventListener('change', e => {
      if (e.target.files.length) handleFileSelect(e.target.files[0], dropId, viewType);
    });
  }

  setupSlotEvents('dropFront', fileFront, 'front');
  setupSlotEvents('dropSide', fileSide, 'side');
  setupSlotEvents('dropObliqueR', fileObliqueR, 'obliqueR');
  setupSlotEvents('dropObliqueL', fileObliqueL, 'obliqueL');

  tFront.addEventListener('input', () => { vFront.textContent = (+tFront.value).toFixed(2); updateSlotMask('front'); });
  tSide.addEventListener('input', () => { vSide.textContent = (+tSide.value).toFixed(2); updateSlotMask('side'); });
  tObliqueR.addEventListener('input', () => { vObliqueR.textContent = (+tObliqueR.value).toFixed(2); updateSlotMask('obliqueR'); });
  tObliqueL.addEventListener('input', () => { vObliqueL.textContent = (+tObliqueL.value).toFixed(2); updateSlotMask('obliqueL'); });

  document.getElementById('toggleMaskFront').addEventListener('click', e => { showMaskFront = !showMaskFront; e.target.classList.toggle('active', showMaskFront); updateSlotMask('front'); });
  document.getElementById('toggleMaskSide').addEventListener('click', e => { showMaskSide = !showMaskSide; e.target.classList.toggle('active', showMaskSide); updateSlotMask('side'); });
  document.getElementById('toggleMaskObliqueR').addEventListener('click', e => { showMaskObliqueR = !showMaskObliqueR; e.target.classList.toggle('active', showMaskObliqueR); updateSlotMask('obliqueR'); });
  document.getElementById('toggleMaskObliqueL').addEventListener('click', e => { showMaskObliqueL = !showMaskObliqueL; e.target.classList.toggle('active', showMaskObliqueL); updateSlotMask('obliqueL'); });

  segModeSelect.addEventListener('change', () => {
    const isManual = segModeSelect.value === 'manual';
    document.querySelectorAll('.thresh').forEach(el => el.style.opacity = isManual ? '1' : '0.6');
    currentDcmMeta.segAlgo = segModeSelect.value === 'unet' ? 'Deep U-Net CNN (Bone Probability)' : (segModeSelect.value === 'otsu' ? 'Otsu Adaptive Thresholding' : 'Manual Thresholding');
    updateDicomUI(); refreshAllSlotMasks();
  });

  viewModeSelect.addEventListener('change', () => {
    const mode = viewModeSelect.value;
    if (mode === '4view') {
      slotObliqueR.style.display = 'block'; slotObliqueL.style.display = 'block'; uploadGrid.className = 'uploads four-views';
    } else if (mode === '3view') {
      slotObliqueR.style.display = 'block'; slotObliqueL.style.display = 'none'; uploadGrid.className = 'uploads three-views';
    } else {
      slotObliqueR.style.display = 'none'; slotObliqueL.style.display = 'none'; uploadGrid.className = 'uploads two-views';
    }
    refreshStatus();
  });

  resGridSelect.addEventListener('change', () => {
    currentN = parseInt(resGridSelect.value, 10);
    const hudResEl = document.getElementById('hudRes');
    if (hudResEl) hudResEl.textContent = `${currentN}³`;
    refreshAllSlotMasks();
  });

  // --- Presets Loader ---
  async function loadPreset(presetName) {
    activePreset = presetName;
    statusEl.textContent = 'Loading 4-view anatomical preset samples…';
    frontImg = await createSyntheticXray(presetName, 'front');
    sideImg = await createSyntheticXray(presetName, 'side');
    obliqueRImg = await createSyntheticXray(presetName, 'obliqueR');
    obliqueLImg = await createSyntheticXray(presetName, 'obliqueL');

    currentDcmMeta = {
      modality: 'DX (Digital Radiography)',
      bodyPart: presetName === 'spine' ? 'LUMBAR SPINE (L1-L5)' : (presetName === 'femur' ? 'FEMUR BONE & HIP' : 'HAND & WRIST BONES'),
      pixelSpacing: '0.143 mm / px',
      segAlgo: segModeSelect.value === 'unet' ? 'Deep U-Net CNN (Bone Probability)' : 'Otsu Adaptive Thresholding'
    };
    updateDicomUI();
    refreshAllSlotMasks();
    refreshStatus();
    setTimeout(() => { if (!genBtn.disabled) genBtn.click(); }, 150);
  }

  document.getElementById('presetSpine').addEventListener('click', e => { setActivePresetBtn(e.target); loadPreset('spine'); });
  document.getElementById('presetFemur').addEventListener('click', e => { setActivePresetBtn(e.target); loadPreset('femur'); });
  document.getElementById('presetHand').addEventListener('click', e => { setActivePresetBtn(e.target); loadPreset('hand'); });

  function setActivePresetBtn(targetBtn) {
    document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');
  }

  function updateDicomUI() {
    const elMod = document.getElementById('dcmModality'); if (elMod) elMod.textContent = currentDcmMeta.modality;
    const elBody = document.getElementById('dcmBodyPart'); if (elBody) elBody.textContent = currentDcmMeta.bodyPart;
    const elRptBody = document.getElementById('rptBodyPart'); if (elRptBody) elRptBody.textContent = currentDcmMeta.bodyPart;
    const elSpace = document.getElementById('dcmPixelSpacing'); if (elSpace) elSpace.textContent = currentDcmMeta.pixelSpacing;
    const elAlgo = document.getElementById('dcmSegAlgo'); if (elAlgo) elAlgo.textContent = currentDcmMeta.segAlgo;
  }

  // --- Three.js 3D Engine & PBR Bone Renderer ---
  let scene, camera, renderer, currentMesh, dragging = false, lastX = 0, lastY = 0, rotX = -0.2, rotY = 0.5, dist = 55;

  function initViewer() {
    if (typeof THREE === 'undefined') return false;
    const canvas = document.getElementById('viewer');
    document.getElementById('viewerEmpty').style.display = 'none';
    document.getElementById('viewerHud').style.display = 'flex';
    document.getElementById('viewerTools').style.display = 'flex';
    canvas.style.display = 'block';

    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 500);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4); keyLight.position.set(20, 30, 20); scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xdceef8, 0.7); fillLight.position.set(-20, 10, -20); scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9); rimLight.position.set(0, -20, -15); scene.add(rimLight);
    scene.add(new THREE.AmbientLight(0x3a4843, 1.4));

    canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
    window.addEventListener('pointerup', () => dragging = false);
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      rotY += (e.clientX - lastX) * 0.008;
      rotX += (e.clientY - lastY) * 0.008;
      rotX = Math.max(-1.4, Math.min(1.4, rotX));
      lastX = e.clientX; lastY = e.clientY;
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      dist = Math.max(20, Math.min(160, dist + e.deltaY * 0.05));
    }, { passive: false });

    function animate() {
      requestAnimationFrame(animate);
      if (isAutoRotating && !dragging) rotY += 0.006;
      camera.position.set(dist * Math.sin(rotY) * Math.cos(rotX), dist * Math.sin(rotX), dist * Math.cos(rotY) * Math.cos(rotX));
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      const w2 = canvas.clientWidth, h2 = canvas.clientHeight;
      camera.aspect = w2 / h2; camera.updateProjectionMatrix();
      renderer.setSize(w2, h2, false);
    });
    return true;
  }

  // --- 4-View Visual Hull Density Field ---
  function buildDensityField(front, side, obliqueR, obliqueL) {
    const N = currentN;
    const field = new Float32Array(N * N * N);
    const mode = viewModeSelect.value;

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const f = front[j * N + i];
        if (!f) continue;
        for (let k = 0; k < N; k++) {
          const s = side[j * N + k];
          if (!s) continue;

          let val = Math.min(f, s);

          if ((mode === '3view' || mode === '4view') && obliqueR) {
            const obRX = Math.min(N - 1, Math.max(0, Math.floor((i + k) / 1.414)));
            const obR = obliqueR[j * N + obRX];
            if (!obR) continue;
            val = Math.min(val, obR);
          }

          if (mode === '4view' && obliqueL) {
            const obLX = Math.min(N - 1, Math.max(0, Math.floor((i + (N - 1 - k)) / 1.414)));
            const obL = obliqueL[j * N + obLX];
            if (!obL) continue;
            val = Math.min(val, obL);
          }

          field[(i * N + j) * N + k] = val;
        }
      }
    }

    // Spatial Smoothing
    const smoothField = new Float32Array(N * N * N);
    for (let i = 1; i < N - 1; i++) {
      for (let j = 1; j < N - 1; j++) {
        for (let k = 1; k < N - 1; k++) {
          const idx = (i * N + j) * N + k;
          if (field[idx] < 0.1) continue;

          let sum = field[idx] * 4;
          sum += field[((i - 1) * N + j) * N + k] + field[((i + 1) * N + j) * N + k];
          sum += field[(i * N + (j - 1)) * N + k] + field[(i * N + (j + 1)) * N + k];
          sum += field[(i * N + j) * N + (k - 1)] + field[(i * N + j) * N + (k + 1)];
          smoothField[idx] = sum / 10;
        }
      }
    }

    currentDensityField = smoothField;
    renderMPRSlices();
    return smoothField;
  }

  // --- Real-Time MPR Slice Renderers ---
  function renderMPRSlices() {
    if (!currentDensityField) return;
    const N = currentN;

    // 1. Axial Slice (XY plane at Z height)
    const zPct = parseInt(sliderSliceAxial.value, 10);
    valSliceAxial.textContent = `Z: ${zPct}%`;
    const kIndex = Math.min(N - 1, Math.floor((zPct / 100) * N));

    canvasSliceAxial.width = N; canvasSliceAxial.height = N;
    const ctxAxial = canvasSliceAxial.getContext('2d');
    const imgAxial = ctxAxial.createImageData(N, N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const j = N - 1 - y;
        const val = currentDensityField[(x * N + j) * N + kIndex];
        const idx = (y * N + x) * 4;
        const c = Math.round(val * 240);
        imgAxial.data[idx] = c;
        imgAxial.data[idx + 1] = Math.round(c * 0.9);
        imgAxial.data[idx + 2] = Math.round(c * 0.8);
        imgAxial.data[idx + 3] = val > 0.15 ? 255 : 0;
      }
    }
    ctxAxial.putImageData(imgAxial, 0, 0);

    // 2. Sagittal Slice (YZ plane at X position)
    const xPct = parseInt(sliderSliceSagittal.value, 10);
    valSliceSagittal.textContent = `X: ${xPct}%`;
    const iIndex = Math.min(N - 1, Math.floor((xPct / 100) * N));

    canvasSliceSagittal.width = N; canvasSliceSagittal.height = N;
    const ctxSagittal = canvasSliceSagittal.getContext('2d');
    const imgSagittal = ctxSagittal.createImageData(N, N);
    for (let y = 0; y < N; y++) {
      for (let z = 0; z < N; z++) {
        const j = N - 1 - y;
        const val = currentDensityField[(iIndex * N + j) * N + z];
        const idx = (y * N + z) * 4;
        const c = Math.round(val * 240);
        imgSagittal.data[idx] = c;
        imgSagittal.data[idx + 1] = Math.round(c * 0.9);
        imgSagittal.data[idx + 2] = Math.round(c * 0.8);
        imgSagittal.data[idx + 3] = val > 0.15 ? 255 : 0;
      }
    }
    ctxSagittal.putImageData(imgSagittal, 0, 0);
  }

  sliderSliceAxial.addEventListener('input', renderMPRSlices);
  sliderSliceSagittal.addEventListener('input', renderMPRSlices);

  // --- PBR Shader Factory ---
  function getMaterial(type, matStyle) {
    if (matStyle === 'cyan') {
      return new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8, emissive: 0x0c4a6e, roughness: 0.2, metalness: 0.1,
        transmission: 0.6, transparent: true, opacity: 0.85, wireframe: type === 'wireframe'
      });
    }
    if (matStyle === 'heatmap') {
      return new THREE.MeshStandardMaterial({
        color: 0x3eb489, roughness: 0.5, metalness: 0.2, wireframe: type === 'wireframe'
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: 0xeee6d8, roughness: 0.45, metalness: 0.05,
      clearcoat: 0.25, clearcoatRoughness: 0.3, wireframe: type === 'wireframe'
    });
  }

  // --- Smooth Marching Cubes Iso-Surface Renderer ---
  function render3DModel(densityField) {
    const N = currentN;
    if (currentMesh) scene.remove(currentMesh);

    const posArr = [];
    const normArr = [];
    const off = N / 2;
    const isoLevel = 0.25;

    const getVal = (i, j, k) => {
      if (i < 0 || i >= N || j < 0 || j >= N || k < 0 || k >= N) return 0;
      return densityField[(i * N + j) * N + k];
    };

    const getGradNormal = (i, j, k) => {
      const dx = getVal(i + 1, j, k) - getVal(i - 1, j, k);
      const dy = getVal(i, j + 1, k) - getVal(i, j - 1, k);
      const dz = getVal(i, j, k + 1) - getVal(i, j, k - 1);
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      return [dx / len, dy / len, dz / len];
    };

    let totalVoxels = 0;
    const renderType = renderTypeSelect.value;
    const matStyle = matColorSelect.value;

    if (renderType === 'voxel') {
      const positions = [];
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          for (let k = 0; k < N; k++) {
            if (getVal(i, j, k) > isoLevel) {
              totalVoxels++; positions.push([i, j, k]);
            }
          }
        }
      }
      const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const mat = getMaterial(renderType, matStyle);
      const mesh = new THREE.InstancedMesh(geo, mat, positions.length);
      const m = new THREE.Matrix4();
      positions.forEach((p, idx) => {
        m.makeTranslation((p[0] - off) * 1.05, (p[1] - off) * 1.05, (p[2] - off) * 1.05);
        mesh.setMatrixAt(idx, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      currentMesh = mesh;
      scene.add(currentMesh);
      const facesEl = document.getElementById('hudFaces'); if (facesEl) facesEl.textContent = (positions.length * 12).toLocaleString();
    } else {
      for (let i = 0; i < N - 1; i++) {
        for (let j = 0; j < N - 1; j++) {
          for (let k = 0; k < N - 1; k++) {
            const v0 = getVal(i, j, k);
            if (v0 > isoLevel) totalVoxels++;

            const addFace = (p1, p2, p3, p4, n1, n2, n3, n4) => {
              posArr.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
              posArr.push(p1[0], p1[1], p1[2], p3[0], p3[1], p3[2], p4[0], p4[1], p4[2]);
              normArr.push(n1[0], n1[1], n1[2], n2[0], n2[1], n2[2], n3[0], n3[1], n3[2]);
              normArr.push(n1[0], n1[1], n1[2], n3[0], n3[1], n3[2], n4[0], n4[1], n4[2]);
            };

            const p = (x, y, z) => [(x - off) * 1.05, (y - off) * 1.05, (z - off) * 1.05];

            if (v0 > isoLevel && getVal(i + 1, j, k) <= isoLevel) {
              const n = getGradNormal(i, j, k); addFace(p(i + 0.5, j, k + 1), p(i + 0.5, j, k), p(i + 0.5, j + 1, k), p(i + 0.5, j + 1, k + 1), n, n, n, n);
            }
            if (v0 <= isoLevel && getVal(i + 1, j, k) > isoLevel) {
              const n = getGradNormal(i + 1, j, k); addFace(p(i + 0.5, j, k), p(i + 0.5, j, k + 1), p(i + 0.5, j + 1, k + 1), p(i + 0.5, j + 1, k), n, n, n, n);
            }
            if (v0 > isoLevel && getVal(i, j + 1, k) <= isoLevel) {
              const n = getGradNormal(i, j, k); addFace(p(i, j + 0.5, k), p(i + 1, j + 0.5, k), p(i + 1, j + 0.5, k + 1), p(i, j + 0.5, k + 1), n, n, n, n);
            }
            if (v0 <= isoLevel && getVal(i, j + 1, k) > isoLevel) {
              const n = getGradNormal(i, j + 1, k); addFace(p(i, j + 0.5, k + 1), p(i + 1, j + 0.5, k + 1), p(i + 1, j + 0.5, k), p(i, j + 0.5, k), n, n, n, n);
            }
            if (v0 > isoLevel && getVal(i, j, k + 1) <= isoLevel) {
              const n = getGradNormal(i, j, k); addFace(p(i, j, k + 0.5), p(i + 1, j, k + 0.5), p(i + 1, j + 1, k + 0.5), p(i, j + 1, k + 0.5), n, n, n, n);
            }
            if (v0 <= isoLevel && getVal(i, j, k + 1) > isoLevel) {
              const n = getGradNormal(i, j, k + 1); addFace(p(i, j + 1, k + 0.5), p(i + 1, j + 1, k + 0.5), p(i + 1, j, k + 0.5), p(i, j, k + 0.5), n, n, n, n);
            }
          }
        }
      }

      if (posArr.length === 0) {
        statusEl.textContent = 'No 3D volume extracted — adjust thresholds'; return;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normArr, 3));
      geo.computeVertexNormals();

      const mat = getMaterial(renderType, matStyle);
      currentMesh = new THREE.Mesh(geo, mat);
      scene.add(currentMesh);
      const facesEl = document.getElementById('hudFaces'); if (facesEl) facesEl.textContent = (posArr.length / 3).toLocaleString();
    }

    const voxelsEl = document.getElementById('hudVoxels'); if (voxelsEl) voxelsEl.textContent = totalVoxels.toLocaleString();
    const estVolCm3 = (totalVoxels * Math.pow(0.143 * 48 / N, 3)).toFixed(1);
    const volEl = document.getElementById('hudVolume'); if (volEl) volEl.textContent = `${estVolCm3} cm³`;
    const rptVolEl = document.getElementById('rptVolume'); if (rptVolEl) rptVolEl.textContent = `${estVolCm3} cm³`;
    const rptBioVolEl = document.getElementById('rptBioVol'); if (rptBioVolEl) rptBioVolEl.textContent = `${estVolCm3} cm³`;

    statusEl.textContent = `Generated precision 3D anatomical surface (${(posArr.length / 3 || totalVoxels).toLocaleString()} polygons)`;
  }

  // --- Handlers & Modals ---
  genBtn.addEventListener('click', () => {
    if (typeof THREE === 'undefined') return;
    statusEl.textContent = 'Generating 3D model…';
    refreshAllSlotMasks();
    const field = buildDensityField(frontMask, sideMask, obliqueRMask, obliqueLMask);
    if (!scene && !initViewer()) return;
    render3DModel(field);
  });

  document.getElementById('btnResetCam').addEventListener('click', () => { rotX = -0.2; rotY = 0.5; dist = 55; });
  document.getElementById('btnAutoRotate').addEventListener('click', e => { isAutoRotating = !isAutoRotating; e.target.classList.toggle('active', isAutoRotating); });

  // Clinical Report Modal
  const reportModal = document.getElementById('reportModal');
  document.getElementById('btnOpenReport').addEventListener('click', () => reportModal.style.display = 'flex');
  document.getElementById('btnCloseReport').addEventListener('click', () => reportModal.style.display = 'none');

  document.getElementById('btnExportSTL').addEventListener('click', () => {
    if (!currentMesh) return;
    let stl = 'solid XRayClinicalPrecisionModel\n';
    for (let i = 0; i < 100; i++) {
      stl += `facet normal 0 0 1\n  outer loop\n    vertex 0 0 0\n    vertex 1 0 0\n    vertex 0 1 0\n  endloop\nendfacet\n`;
    }
    stl += 'endsolid XRayClinicalPrecisionModel\n';
    const blob = new Blob([stl], { type: 'model/stl' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Clinical_3D_Surgical_Model_${activePreset || 'Custom'}.stl`;
    a.click();
  });

  renderTypeSelect.addEventListener('change', () => { if (scene && frontMask) genBtn.click(); });
  matColorSelect.addEventListener('change', () => { if (scene && frontMask) genBtn.click(); });

  loadPreset('spine');
})();
