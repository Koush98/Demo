(async function () {
  const actions = window.SNAPKEY_ACTIONS || [];
  const list = document.getElementById("actionList");
  const syncMode = document.getElementById("syncMode");
  const lastTrigger = document.getElementById("lastTrigger");
  const previewTitle = document.getElementById("previewTitle");
  const previewStage = document.getElementById("previewStage");
  const previewResponse = document.getElementById("previewResponse");
  const reloadScreen = document.getElementById("reloadScreen");
  const pauseVoice = document.getElementById("pauseVoice");
  const csrSlideList = document.getElementById("csrSlideList");
  const cameraControlList = document.getElementById("cameraControlList");
  const csrSlides = [
    ...(window.SNAPKEY_CONFIG?.csrSlides || []),
    ...(window.SNAPKEY_CONFIG?.manualOnlySlides || [])
  ];
  const cameras = window.SNAPKEY_CONFIG?.cameras || [];
  const imageSlidesAction = actions.find((action) => action.id === "donating-society");
  const cameraWallAction = actions.find((action) => action.id === "shop-cameras");
  const camera2ReportAction = actions.find((action) => action.id === "camera-2-report");
  const hiddenMainActionIds = new Set([
    "shop-cameras",
    "camera-2-report",
    "whatsapp-report",
    "pro-new-dashboard",
    "report-screen",
    "social-media",
    "donating-society"
  ]);

  try {
    await window.SnapKeySync.init();
  } catch (error) {
    console.warn("Firebase sync unavailable, using local fallback.", error);
  }

  syncMode.textContent = window.SnapKeySync.usingSupabase()
    ? "Supabase live"
    : window.SnapKeySync.usingFirebase()
      ? "Firebase live"
      : "Local fallback";

  renderActionGroups();

  reloadScreen.addEventListener("click", async () => {
    await window.SnapKeySync.publish({ reload: true });
    lastTrigger.textContent = "Pause / Reload";
    previewTitle.textContent = "Standby";
    previewResponse.textContent = "Screen returned to reload page.";
    previewStage.innerHTML = `
      <div class="preview-idle">
        <span></span>
        <p>Standby page</p>
      </div>
    `;
  });

  pauseVoice.addEventListener("click", async () => {
    await window.SnapKeySync.publish({ mediaToggle: true });
    lastTrigger.textContent = "Pause / Play";
    previewResponse.textContent = "Current voice or video playback toggled. Screen view was not changed.";
  });

  if (imageSlidesAction) {
    const button = document.createElement("button");
    button.className = "csr-slide-button open-slide-deck-button";
    button.type = "button";
    button.innerHTML = `
      <span class="csr-thumb slide-deck-thumb"><i></i></span>
      <span>
        <b>Open image slides</b>
        <small>Show the manual image slide screen</small>
      </span>
    `;
    button.addEventListener("click", () => runAction(imageSlidesAction));
    csrSlideList.appendChild(button);
  }

  csrSlides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.className = "csr-slide-button";
    button.type = "button";
    button.innerHTML = `
      <span class="csr-thumb" style="background-image: url('${slide.image}')"></span>
      <span>
        <b>${index + 1}. ${slide.title}</b>
        <small>${slide.subtitle}</small>
      </span>
    `;
    button.addEventListener("click", () => changeCsrSlide(slide));
    csrSlideList.appendChild(button);
  });

  if (cameraWallAction) {
    const button = document.createElement("button");
    button.className = "csr-slide-button camera-control-button open-camera-wall-button";
    button.type = "button";
    button.innerHTML = `
      <span class="camera-control-thumb camera-wall-thumb"><i></i></span>
      <span>
        <b>Show all cameras</b>
        <small>Open the live camera wall</small>
      </span>
    `;
    button.addEventListener("click", () => runAction(cameraWallAction));
    cameraControlList.appendChild(button);
  }

  cameras.forEach((camera, index) => {
    const button = document.createElement("button");
    button.className = "csr-slide-button camera-control-button";
    button.type = "button";
    button.innerHTML = `
      <span class="camera-control-thumb"><i></i></span>
      <span>
        <b>${index + 1}. ${camera.title}</b>
        <small>${camera.location} - ${camera.detail}</small>
      </span>
    `;
    button.addEventListener("click", () => changeCamera(camera));
    cameraControlList.appendChild(button);
  });

  window.addEventListener("keydown", (event) => {
    const number = Number(event.key);
    if (!number || !actions[number - 1]) return;
    runAction(actions[number - 1]);
  });

  async function runAction(action) {
    updatePreview(action);
    await window.SnapKeySync.publish({ actionId: action.id });
    lastTrigger.textContent = action.trigger;
  }

  async function changeCsrSlide(slide) {
    await window.SnapKeySync.publish({ csrSlideId: slide.id });
    lastTrigger.textContent = `CSR slide: ${slide.title}`;
    previewTitle.textContent = slide.title;
    previewResponse.textContent = slide.subtitle;
    previewStage.innerHTML = `<div class="mini-csr-slide" style="background-image: url('${slide.image}')"></div>`;
  }

  async function changeCamera(camera) {
    await window.SnapKeySync.publish({
      cameraId: camera.id,
      cameraActionId: camera.id === "camera2" ? camera2ReportAction?.id : undefined
    });
    lastTrigger.textContent = `Camera: ${camera.title}`;
    previewTitle.textContent = `${camera.title} - ${camera.location}`;
    previewResponse.textContent = camera.detail;
    previewStage.innerHTML = `
      <div class="mini-focus">
        <span></span>
        <div><b></b><b></b><b></b></div>
      </div>
    `;
  }

  window.SnapKeySync.subscribe((payload) => {
    if (!payload) return;
    const action = actions.find((item) => item.id === payload.actionId);
    if (action) updatePreview(action);
  });

  function updatePreview(action) {
    previewTitle.textContent = action.trigger;
    previewResponse.textContent = action.response;
    previewStage.innerHTML = previewMarkup(action.scene);
  }

  function previewMarkup(scene) {
    if (scene === "cameras") {
      return `
        <div class="mini-camera-grid">
          <span></span><span class="hot"></span><span></span><span></span>
        </div>
      `;
    }

    if (scene === "camera2") {
      return `
        <div class="mini-focus">
          <span></span>
          <div><b></b><b></b><b></b></div>
        </div>
      `;
    }

    if (scene === "dashboard") {
      return `
        <div class="mini-dashboard">
          <div><span></span><span></span><span></span></div>
          <p></p>
        </div>
      `;
    }

    if (scene === "whatsapp") {
      return `
        <div class="mini-phone">
          <span></span><span></span><b></b>
        </div>
      `;
    }

    if (["proDashboard", "sales", "reportCenter", "webExcise", "socialMedia", "donatingSociety", "videoPresentation1", "videoPresentation2", "videoPresentation3", "videoPresentation4"].includes(scene)) {
      return `
        <div class="mini-dashboard">
          <div><span></span><span></span><span></span></div>
          <p></p>
        </div>
      `;
    }

    return `
      <div class="preview-idle">
        <span></span>
        <p>Assistant active</p>
      </div>
    `;
  }

  function renderActionGroups() {
    const groups = [
      ["core", "Core commands"],
      ["business", "Business screens"],
      ["camera", "Camera screens"],
      ["presentation", "Presentation slides"],
      ["videos", "Video playback"]
    ];
    const used = new Set();
    list.className = "action-groups";
    list.innerHTML = groups.map(([groupId, label]) => {
      const groupActions = actions.filter((action) => !hiddenMainActionIds.has(action.id) && (action.group || "core") === groupId);
      if (!groupActions.length) return "";
      groupActions.forEach((action) => used.add(action.id));
      return `
        <section class="action-group">
          <div class="action-group-heading">
            <span class="label">${label}</span>
            <strong>${groupActions.length}</strong>
          </div>
          <div class="operator-grid">
            ${groupActions.map((action) => actionButtonMarkup(action, actions.indexOf(action))).join("")}
          </div>
        </section>
      `;
    }).join("");

    const uncategorized = actions.filter((action) => !hiddenMainActionIds.has(action.id) && !used.has(action.id));
    if (uncategorized.length) {
      list.insertAdjacentHTML("beforeend", `
        <section class="action-group">
          <div class="action-group-heading">
            <span class="label">Other commands</span>
            <strong>${uncategorized.length}</strong>
          </div>
          <div class="operator-grid">
            ${uncategorized.map((action) => actionButtonMarkup(action, actions.indexOf(action))).join("")}
          </div>
        </section>
      `);
    }

    list.querySelectorAll("[data-action-id]").forEach((button) => {
      const action = actions.find((item) => item.id === button.dataset.actionId);
      if (action) button.addEventListener("click", () => runAction(action));
    });
  }

  function actionButtonMarkup(action, index) {
    return `
      <button class="action-button" type="button" data-action-id="${action.id}">
        <span class="key">${index + 1}</span>
        <span>
          <span class="trigger">${action.trigger}</span>
          <span class="response">${action.response}</span>
        </span>
      </button>
    `;
  }
})();
