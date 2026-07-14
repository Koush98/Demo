(async function () {
  const actions = window.SNAPKEY_ACTIONS || [];
  const scene = document.getElementById("scene");
  const heardText = document.getElementById("heardText");
  const responseText = document.getElementById("responseText");
  const voiceVisualizer = document.getElementById("voiceVisualizer");
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
  runInitialGreeting();

  window.SnapKeySync.subscribe((payload) => {
    if (!payload || payload.at <= lastActionAt) return;
    lastActionAt = payload.at;
    const action = actions.find((item) => item.id === payload.actionId);
    if (!action) return;
    runAction(action);
  });

  function runAction(action) {
    clearActivityTimers();
    setVoiceMode("listening");
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
    const queue = action.audioQueue && action.audioQueue.length ? action.audioQueue : [action.audio];
    playAudioQueue(queue, action.response, 0);
  }

  function playAudioQueue(queue, fallbackText, index) {
    if (!queue[index]) {
      setVoiceMode("complete");
      return;
    }

    currentAudio = new Audio(queue[index]);
    currentAudio.volume = 1;
    currentAudio.addEventListener("play", () => setVoiceMode("speaking"));
    currentAudio.addEventListener("ended", () => playAudioQueue(queue, fallbackText, index + 1));
    currentAudio.play().catch(() => {
      speakFallback(fallbackText);
    });
  }

  function speakFallback(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.onstart = () => setVoiceMode("speaking");
    utterance.onend = () => setVoiceMode("complete");
    window.speechSynthesis.speak(utterance);
  }

  function runInitialGreeting() {
    const greeting = actions.find((item) => item.id === "hi") || actions[0];
    if (!greeting) return;

    const timer = window.setTimeout(() => runAction(greeting), 450);
    activityTimers.push(timer);
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

  function setVoiceMode(mode) {
    voiceVisualizer.className = `voice-visualizer ${mode}`;
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
          setVoiceMode("thinking");
          setAgentState("executing", "Executing Workflow", "Updating dashboard modules and visual response.");
        }
      }, index * 420);
      activityTimers.push(timer);
    });
  }

  function renderProcessing(action) {
    scene.innerHTML = `
      <div class="processing-panel">
        <div class="agent-loader">
          <div class="loader-orbit">
            <span></span><span></span><span></span>
          </div>
          <div class="loader-wave">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          </div>
          <div class="loader-grid">
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div>
          <p class="eyebrow">Live action</p>
          <h2>${action.trigger}</h2>
          <p>SnapKey is listening, reasoning, and preparing the ${action.scene} view.</p>
        </div>
      </div>
    `;
  }

  function renderIdle() {
    setAgentState("idle", "Idle", "Waiting for the next scripted command.");
    setVoiceMode("idle");
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
      <div class="dashboard-image-frame">
        <img src="assets/images/madhushala-pro-screen.png?v=20260714-pro" alt="Madhushala Pro business dashboard">
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
          <div class="message" id="whatsappStatus">Sending today's sales report...</div>
          <div class="message document">Madhushala_Sales_Report_Today.pdf</div>
          <a class="send-whatsapp" href="${sendUrl}" target="_blank" rel="noopener">Open WhatsApp</a>
        </div>
        <aside>
          <p class="eyebrow">Report prepared</p>
          <h2 id="whatsappTitle">Sending report</h2>
          <p id="whatsappDetail">SnapKey is preparing the WhatsApp delivery status.</p>
        </aside>
      </div>
    `;
    sendWhatsappReport(whatsapp);
  }

  async function sendWhatsappReport(whatsapp) {
    const status = document.getElementById("whatsappStatus");
    const title = document.getElementById("whatsappTitle");
    const detail = document.getElementById("whatsappDetail");
    const endpoint = whatsapp.autoSendEndpoint;

    if (!endpoint) {
      status.textContent = "WhatsApp API is not connected. Open WhatsApp to send manually.";
      title.textContent = "Manual send required";
      detail.textContent = "For automatic sending, connect a backend endpoint using WhatsApp Cloud API.";
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: whatsapp.phoneNumber,
          message: decodeURIComponent(whatsapp.reportMessage || ""),
          reportFileUrl: whatsapp.reportFileUrl,
          reportFileName: whatsapp.reportFileName
        })
      });

      if (!response.ok) throw new Error(`WhatsApp endpoint failed: ${response.status}`);
      status.textContent = "Today's sales report has been sent on WhatsApp.";
      title.textContent = "Report sent";
      detail.textContent = "Beer, whisky, vodka, rum, wine, total bills, and top item summary were delivered.";
    } catch (error) {
      console.warn(error);
      status.textContent = "Automatic WhatsApp send failed. Open WhatsApp to send manually.";
      title.textContent = "Delivery needs attention";
      detail.textContent = "Check the WhatsApp API endpoint or use the Open WhatsApp button.";
    }
  }

  function itemRows() {
    return [
      { name: "5000(B)500ML", category: "BEER MADE IN INDIA", sold: 96, price: 110, gross: "10,560.00", net: "10,560.00" },
      { name: "5000(B)650ML", category: "BEER MADE IN INDIA", sold: 2, price: 148, gross: "296.00", net: "296.00" },
      { name: "5000(B)650ML", category: "BEER MADE IN INDIA", sold: 10, price: 150, gross: "1,500.00", net: "1,500.00" },
      { name: "BACARDI LIMON(R)375ML", category: "IMFL RUM", sold: 1, price: 530, gross: "530.00", net: "530.00" },
      { name: "BACARDI MANGO CHILLI(R)180ML", category: "IMFL RUM", sold: 8, price: 287, gross: "2,296.00", net: "2,296.00" },
      { name: "BACARDI MANGO CHILLI(R)180ML", category: "IMFL RUM", sold: 2, price: 290, gross: "580.00", net: "580.00" },
      { name: "BACARDI MANGO CHILLI(R)375ML", category: "IMFL RUM", sold: 6, price: 524, gross: "3,144.00", net: "3,144.00" },
      { name: "BACARDI MANGO CHILLI(R)375ML", category: "IMFL RUM", sold: 1, price: 530, gross: "530.00", net: "530.00" },
      { name: "BACARDI MANGO CHILLI(R)750ML", category: "IMFL RUM", sold: 1, price: 1000, gross: "1,000.00", net: "1,000.00" },
      { name: "BACARDI(R)180ML", category: "IMFL RUM", sold: 1, price: 280, gross: "280.00", net: "280.00" }
    ];
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
