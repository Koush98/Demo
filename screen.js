(async function () {
  const actions = window.SNAPKEY_ACTIONS || [];
  const scene = document.getElementById("scene");
  const heardText = document.getElementById("heardText");
  const responseText = document.getElementById("responseText");
  const agentCore = document.getElementById("agentCore");
  const agentState = document.getElementById("agentState");
  const agentDetail = document.getElementById("agentDetail");
  const activityList = document.getElementById("activityList");
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
          <article><span>Cameras</span><strong>4 Online</strong></article>
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
    scene.innerHTML = `
      <div class="camera-grid">
        ${cameraCard("Camera 1", "Entrance", "Customers entering", "green")}
        ${cameraCard("Camera 2", "Billing Counter", "Queue active", "amber")}
        ${cameraCard("Camera 3", "Aisle 4", "Normal movement", "green")}
        ${cameraCard("Camera 4", "Stock Room", "No alerts", "green")}
      </div>
    `;
  }

  function renderCamera2() {
    scene.innerHTML = `
      <div class="focus-layout">
        <div class="camera-feed large">
          <div class="scan-lines"></div>
          <span class="camera-title">Camera 2 - Billing Counter</span>
          <span class="timestamp">${new Date().toLocaleTimeString()}</span>
        </div>
        <aside class="report-panel">
          <p class="eyebrow">Camera 2 report</p>
          <h2>Billing Counter Activity</h2>
          <div class="report-list">
            <div><span>Queue length</span><strong>6 people</strong></div>
            <div><span>Average wait</span><strong>3 min 20 sec</strong></div>
            <div><span>Transactions</span><strong>57 today</strong></div>
            <div><span>Alert</span><strong>Counter busy</strong></div>
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
          <article><span>Top Item</span><strong>Rice 5kg</strong></article>
        </div>
        <div class="chart-panel">
          <p class="eyebrow">Hourly sales</p>
          <div class="bar-chart">
            ${[34, 48, 43, 58, 72, 67, 88, 76].map((height) => `<span style="height:${height}%"></span>`).join("")}
          </div>
        </div>
        <div class="table-panel">
          <p class="eyebrow">Category performance</p>
          <table>
            <tr><th>Category</th><th>Sales</th><th>Status</th></tr>
            <tr><td>Grocery</td><td>Rs. 36,400</td><td>High</td></tr>
            <tr><td>Dairy</td><td>Rs. 18,950</td><td>Stable</td></tr>
            <tr><td>Personal Care</td><td>Rs. 12,700</td><td>Growing</td></tr>
          </table>
        </div>
      </div>
    `;
  }

  function renderWhatsapp() {
    scene.innerHTML = `
      <div class="whatsapp-panel">
        <div class="phone-shell">
          <div class="chat-header">WhatsApp - Mr. Tiwari</div>
          <div class="message">Today's sales report is ready.</div>
          <div class="message document">Sales_Report_Today.pdf</div>
          <button type="button">Ready to Send</button>
        </div>
        <aside>
          <p class="eyebrow">Report prepared</p>
          <h2>Sales report queued</h2>
          <p>Total sales, order count, top categories, and camera summary are attached.</p>
        </aside>
      </div>
    `;
  }

  function cameraCard(title, location, detail, status) {
    return `
      <article class="camera-card">
        <div class="camera-feed ${status}">
          <div class="scan-lines"></div>
          <span class="camera-title">${title}</span>
        </div>
        <div>
          <strong>${location}</strong>
          <span>${detail}</span>
        </div>
      </article>
    `;
  }
})();
