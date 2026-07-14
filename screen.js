(async function () {
  const actions = window.SNAPKEY_ACTIONS || [];
  const scene = document.getElementById("scene");
  const heardText = document.getElementById("heardText");
  const responseText = document.getElementById("responseText");
  const agentCore = document.getElementById("agentCore");
  const agentState = document.getElementById("agentState");
  const agentDetail = document.getElementById("agentDetail");
  const activityList = document.getElementById("activityList");
  const appConfig = window.SNAPKEY_CONFIG || {};
  const cameras = appConfig.cameras || [];
  let lastActionAt = 0;
  let currentAudio = null;
  let activityTimers = [];

  const scenes = {
    welcome: renderWelcome,
    cameras: renderCameras,
    camera2: renderCamera2,
    dashboard: renderDashboard,
    whatsapp: renderWhatsapp
  };

  try {
    await window.SnapKeySync.init();
  } catch (error) {
    console.warn("Firebase sync unavailable, using local fallback.", error);
  }

  renderIdle();

  window.SnapKeySync.subscribe((payload) => {
    if (!payload || payload.at <= lastActionAt) return;
    lastActionAt = payload.at;
    const action = actions.find((item) => item.id === payload.actionId);
    if (!action) return;
    runAction(action);
  });

  function runAction(action) {
    clearActivityTimers();
    heardText.textContent = action.trigger;
    responseText.textContent = action.response;
    renderProcessing(action);
    runActivity(action);
    playResponse(action);

    const timer = window.setTimeout(() => {
      const render = scenes[action.scene] || renderIdle;
      render();
      setAgentState("complete", "Task Complete", "The requested screen is now live.");
    }, 900);
    activityTimers.push(timer);
  }

  function playResponse(action) {
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(action.audio);
    currentAudio.play().catch(() => speakFallback(action.response));
  }

  function speakFallback(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function clearActivityTimers() {
    activityTimers.forEach((timer) => window.clearTimeout(timer));
    activityTimers = [];
  }

  function setAgentState(state, title, detail) {
    agentCore.className = `agent-core ${state}`;
    agentState.textContent = title;
    agentDetail.textContent = detail;
  }

  function runActivity(action) {
    activityList.innerHTML = "";
    setAgentState("thinking", "Understanding Command", "Mapping the command to a fixed demo workflow.");

    const steps = action.steps || ["Command received", "Workflow selected", "Screen updated"];
    steps.forEach((step, index) => {
      const timer = window.setTimeout(() => {
        const item = document.createElement("li");
        item.textContent = step;
        item.className = "active";
        activityList.appendChild(item);

        if (index === 1) {
          setAgentState("executing", "Executing Workflow", "Updating dashboard modules and visual response.");
        }
      }, index * 420);
      activityTimers.push(timer);
    });
  }

  function renderProcessing(action) {
    scene.innerHTML = `
      <div class="processing-panel">
        <div class="processing-grid">
          <span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span>
        </div>
        <div>
          <p class="eyebrow">Live action</p>
          <h2>${action.trigger}</h2>
          <p>SnapKey is preparing the ${action.scene} view.</p>
        </div>
      </div>
    `;
  }

  function renderIdle() {
    setAgentState("idle", "Idle", "Waiting for the next scripted command.");
    scene.innerHTML = `
      <div class="idle-panel">
        <div>
          <p class="eyebrow">System status</p>
          <h2>Ready for the next shop command</h2>
        </div>
        <div class="metric-row">
          <article><span>Today Sales</span><strong>Rs. 84,250</strong></article>
          <article><span>Orders</span><strong>183</strong></article>
          <article><span>Cameras</span><strong>${cameras.length || 5} Online</strong></article>
        </div>
      </div>
    `;
  }

  function renderWelcome() {
    scene.innerHTML = `
      <div class="welcome-panel">
        <div class="orbital-status">
          <span></span><span></span><span></span>
        </div>
        <h2>Hello Mr. Tiwari</h2>
        <p>Your store systems are online. Sales, cameras, and reports are ready.</p>
      </div>
    `;
  }

  function renderCameras() {
    const cameraList = getCameras();
    scene.innerHTML = `
      <div class="camera-grid">
        ${cameraList.map((camera) => cameraCard(camera)).join("")}
      </div>
    `;
  }

  function renderCamera2() {
    const camera = getCameras().find((item) => item.id === "camera2") || getCameras()[1];
    const analytics = camera.analytics || {};
    scene.innerHTML = `
      <div class="focus-layout">
        <div class="camera-feed large ${camera.status || ""}">
          ${videoMarkup(camera)}
          <div class="scan-lines"></div>
          <span class="camera-title">${camera.title} - ${camera.location}</span>
          <span class="timestamp">${new Date().toLocaleTimeString()}</span>
        </div>
        <aside class="report-panel">
          <p class="eyebrow">Camera 2 report</p>
          <h2>People Analytics</h2>
          <div class="people-split">
            <article><span>Total People</span><strong>${analytics.totalPeople || 18}</strong></article>
            <article><span>Male</span><strong>${analytics.male || 11}</strong></article>
            <article><span>Female</span><strong>${analytics.female || 7}</strong></article>
            <article><span>Near Counter</span><strong>${analytics.nearCounter || 6}</strong></article>
          </div>
          <div class="report-list">
            <div><span>Queue length</span><strong>${analytics.queueLength || 6} people</strong></div>
            <div><span>Average wait</span><strong>${analytics.averageWait || "3 min 20 sec"}</strong></div>
            <div><span>Staff visible</span><strong>${analytics.staffVisible || 2}</strong></div>
            <div><span>Transactions</span><strong>${analytics.transactions || 57} today</strong></div>
            <div><span>Alert</span><strong>${analytics.alert || "Counter busy"}</strong></div>
          </div>
        </aside>
      </div>
    `;
  }

  function renderDashboard() {
    scene.innerHTML = `
      <div class="dashboard-layout">
        <div class="metric-row">
          <article><span>Total Sales</span><strong>Rs. 84,250</strong></article>
          <article><span>Orders</span><strong>183</strong></article>
          <article><span>Avg. Bill</span><strong>Rs. 460</strong></article>
          <article><span>Top Item</span><strong>Kingfisher 650ml</strong></article>
        </div>
        <div class="chart-panel">
          <p class="eyebrow">Hourly sales</p>
          <div class="bar-chart">
            ${[34, 48, 43, 58, 72, 67, 88, 76].map((height) => `<span style="height:${height}%"></span>`).join("")}
          </div>
        </div>
        <div class="table-panel">
          <p class="eyebrow">Liquor category performance</p>
          <table>
            <tr><th>Category</th><th>Sales</th><th>Status</th></tr>
            <tr><td>Beer</td><td>Rs. 32,800</td><td>High</td></tr>
            <tr><td>Whisky</td><td>Rs. 27,450</td><td>High</td></tr>
            <tr><td>Vodka</td><td>Rs. 9,700</td><td>Stable</td></tr>
            <tr><td>Rum</td><td>Rs. 8,950</td><td>Stable</td></tr>
            <tr><td>Wine</td><td>Rs. 5,350</td><td>Growing</td></tr>
          </table>
        </div>
      </div>
    `;
  }

  function renderWhatsapp() {
    const whatsapp = appConfig.whatsapp || {};
    const phoneNumber = whatsapp.phoneNumber || "";
    const message = whatsapp.reportMessage || "Madhushala POS sales report is ready.";
    const sendUrl = phoneNumber
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://wa.me/?text=${message}`;

    scene.innerHTML = `
      <div class="whatsapp-panel">
        <div class="phone-shell">
          <div class="chat-header">WhatsApp - Mr. Tiwari</div>
          <div class="message">Today's sales report is ready.</div>
          <div class="message document">Madhushala_Sales_Report_Today.pdf</div>
          <a class="send-whatsapp" href="${sendUrl}" target="_blank" rel="noopener">Open WhatsApp</a>
        </div>
        <aside>
          <p class="eyebrow">Report prepared</p>
          <h2>Liquor sales report queued</h2>
          <p>Beer, whisky, vodka, rum, wine, total bills, and top item summary are ready for WhatsApp.</p>
        </aside>
      </div>
    `;
  }

  function getCameras() {
    return cameras.length
      ? cameras
      : [
          { id: "camera1", title: "Camera 1", location: "Entrance", detail: "Customers entering", status: "green", video: "assets/videos/camera1.mp4" },
          { id: "camera2", title: "Camera 2", location: "Billing Counter", detail: "Queue active", status: "amber", video: "assets/videos/camera2.mp4" },
          { id: "camera3", title: "Camera 3", location: "Premium Shelf", detail: "Normal movement", status: "green", video: "assets/videos/camera3.mp4" },
          { id: "camera4", title: "Camera 4", location: "Stock Room", detail: "No alerts", status: "green", video: "assets/videos/camera4.mp4" },
          { id: "camera5", title: "Camera 5", location: "Exit Gate", detail: "Exit flow normal", status: "green", video: "assets/videos/camera5.mp4" }
        ];
  }

  function cameraCard(camera) {
    return `
      <article class="camera-card">
        <div class="camera-feed ${camera.status || ""}">
          ${videoMarkup(camera)}
          <div class="scan-lines"></div>
          <span class="camera-title">${camera.title}</span>
        </div>
        <div>
          <strong>${camera.location}</strong>
          <span>${camera.detail}</span>
        </div>
      </article>
    `;
  }

  function videoMarkup(camera) {
    if (!camera.video) return "";
    return `
      <video class="camera-video" autoplay muted loop playsinline onerror="this.hidden=true">
        <source src="${camera.video}" type="video/mp4">
      </video>
    `;
  }
})();
