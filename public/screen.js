(async function () {
  const actions = window.SNAPKEY_ACTIONS || [];
  const scene = document.getElementById("scene");
  const heardText = document.getElementById("heardText");
  const responseText = document.getElementById("responseText");
  const voiceVisualizer = document.getElementById("voiceVisualizer");
  const permissionGate = document.getElementById("permissionGate");
  const permissionStart = document.getElementById("permissionStart");
  const permissionNote = document.getElementById("permissionNote");
  const agentCore = document.getElementById("agentCore");
  const agentState = document.getElementById("agentState");
  const agentDetail = document.getElementById("agentDetail");
  const activityList = document.getElementById("activityList");
  const appConfig = window.SNAPKEY_CONFIG || {};
  const cameras = appConfig.cameras || [];
  let lastActionAt = 0;
  let currentAudio = null;
  let activityTimers = [];
  let voiceReady = false;
  let currentSceneName = "idle";
  let activeCsrSlideId = null;

  const scenes = {
    welcome: renderWelcome,
    cameras: renderCameras,
    camera2: renderCamera2,
    dashboard: renderDashboard,
    whatsapp: renderWhatsapp,
    proDashboard: renderProDashboard,
    sales: renderSales,
    reportCenter: renderReportCenter,
    webExcise: renderWebExcise,
    socialMedia: renderSocialMedia,
    donatingSociety: renderDonatingSociety
  };

  try {
    await window.SnapKeySync.init();
  } catch (error) {
    console.warn("Firebase sync unavailable, using local fallback.", error);
  }

  renderIdle();
  setupPermissionGate();

  window.SnapKeySync.subscribe((payload) => {
    if (!payload || payload.at <= lastActionAt) return;
    lastActionAt = payload.at;
    if (payload.csrSlideId) {
      activeCsrSlideId = payload.csrSlideId;
      if (currentSceneName === "donatingSociety") renderDonatingSociety(activeCsrSlideId);
      return;
    }
    const action = actions.find((item) => item.id === payload.actionId);
    if (!action) return;
    runAction(action);
  });

  function runAction(action) {
    clearActivityTimers();
    setVoiceMode("listening");
    heardText.textContent = action.trigger;
    responseText.textContent = action.response;
    const render = scenes[action.scene] || renderIdle;

    if (action.presentationMode) {
      currentSceneName = action.scene;
      render();
      setAgentState("complete", "Presentation Mode", "Showing the selected slide presentation.");
      setVoiceMode("complete");
      playResponse(action);
      return;
    }

    renderProcessing(action);
    runActivity(action);
    playResponse(action);

    const timer = window.setTimeout(() => {
      currentSceneName = action.scene;
      render();
      setAgentState("complete", "Task Complete", "The requested screen is now live.");
    }, 1450);
    activityTimers.push(timer);
  }

  function playResponse(action) {
    if (!voiceReady) {
      setVoiceMode("thinking");
      return;
    }

    if (currentAudio) currentAudio.pause();
    const queue = (action.audioQueue && action.audioQueue.length ? action.audioQueue : [action.audio]).filter(Boolean);
    if (!queue.length) {
      setVoiceMode("complete");
      return;
    }
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
      console.warn("Recorded voice could not play; browser speech fallback is disabled.", fallbackText);
      setVoiceMode("complete");
    });
  }

  function setupPermissionGate() {
    permissionStart.addEventListener("click", async () => {
      permissionStart.disabled = true;
      permissionStart.textContent = "Starting...";

      permissionNote.textContent = "Speaker audio is ready.";

      try {
        const unlockAudio = new Audio(actions[0]?.audio || "");
        unlockAudio.muted = true;
        unlockAudio.volume = 0;
        await unlockAudio.play();
        unlockAudio.pause();
        unlockAudio.currentTime = 0;
      } catch (error) {
        console.warn("Speaker unlock fallback finished with browser warning.", error);
      }

      voiceReady = true;
      permissionGate.classList.add("hidden");
      renderIdle();
    });
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
        <div class="agent-loader fullscreen-loader" aria-label="Loading ${action.scene} view">
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
      </div>
    `;
  }

  function renderIdle() {
    const slides = getCsrSlides();
    currentSceneName = "idle";
    setAgentState("idle", "SnapKey AI Assistant", "Standing by for the next scripted command.");
    setVoiceMode("idle");
    heardText.textContent = "";
    responseText.textContent = "SnapKey Assistant";
    scene.innerHTML = `
      <div class="idle-panel assistant-standby">
        <div class="standby-bg">
          <span></span><span></span><span></span><span></span>
        </div>
        <div class="standby-carousel" aria-hidden="true">
          ${slides.map((slide, index) => `
            <article class="standby-slide standby-image-slide" style="--standby-image: url('${slide.image}'); --standby-tone: ${slide.tone}; --slide-delay: ${index * 7}s">
              <strong>${slide.title}</strong>
              <span>${slide.subtitle}</span>
            </article>
          `).join("")}
        </div>
        <div class="standby-grid" aria-hidden="true"></div>
        <div class="standby-core" aria-hidden="true">
          <div class="standby-orbit orbit-one"><i></i><i></i><i></i></div>
          <div class="standby-orbit orbit-two"><i></i><i></i><i></i></div>
          <div class="standby-pulse"></div>
          <div class="standby-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </div>
        <h2>SnapKey Assistant</h2>
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
    const cameraList = getCameras().slice(0, 4);
    scene.innerHTML = `
      <div class="camera-grid">
        ${cameraList.map((camera) => cameraCard(camera)).join("")}
      </div>
    `;
    keepCameraVideosLive();
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
        </div>
        <aside class="report-panel">
          <p class="eyebrow">Camera 2 report</p>
          <h2>Live Detection</h2>
          <div class="people-split">
            <article><span>Customers</span><strong>${analytics.customers || 5}</strong></article>
            <article><span>Staff</span><strong>${analytics.staff || 3}</strong></article>
            <article><span>Bottles</span><strong>${analytics.bottles || 2}</strong></article>
          </div>
        </aside>
      </div>
    `;
    keepCameraVideosLive();
  }

  function renderDashboard() {
    scene.innerHTML = `
      <div class="dashboard-image-frame">
        <img src="assets/images/madhushala-pro-screen.png?v=20260714-pro" alt="Madhushala Pro business dashboard">
      </div>
    `;
  }

  function renderProDashboard() {
    scene.innerHTML = `
      <section class="command-screen pro-view">
        <div class="command-hero">
          <p class="eyebrow">Madhushala Pro</p>
          <h2>Executive Dashboard</h2>
          <span>Live business command view</span>
        </div>
        <div class="command-kpis">
          <article><span>Today Sales</span><strong>Rs. 45,806</strong></article>
          <article><span>Stock Items</span><strong>843</strong></article>
          <article><span>AMC Remaining</span><strong>124 days</strong></article>
          <article><span>Low Stock Alerts</span><strong>05</strong></article>
        </div>
        <div class="command-grid two">
          <article>
            <h3>Business Modules</h3>
            <div class="module-strip"><span>Sales Entry</span><span>Item Master</span><span>Reports</span><span>Admin</span></div>
          </article>
          <article>
            <h3>Low Stock Items</h3>
            <div class="rank-list"><span>McDowell's No.1 Whisky</span><b>26</b><span>Bacardi Rum</span><b>17</b><span>Smirnoff Vodka</span><b>12</b></div>
          </article>
        </div>
      </section>
    `;
  }

  function renderSales() {
    const rows = [
      { item: "5000(B)500ML", category: "BEER MADE IN INDIA", sold: 96, unit: 110, gross: 10560, discount: 0, net: 10560 },
      { item: "5000(B)650ML", category: "BEER MADE IN INDIA", sold: 2, unit: 148, gross: 296, discount: 0, net: 296 },
      { item: "5000(B)650ML", category: "BEER MADE IN INDIA", sold: 10, unit: 150, gross: 1500, discount: 0, net: 1500 },
      { item: "BACARDI LIMON(R)375ML", category: "IMFL RUM", sold: 1, unit: 530, gross: 530, discount: 0, net: 530 },
      { item: "BACARDI MANGO CHILLI(R)180ML", category: "IMFL RUM", sold: 8, unit: 287, gross: 2296, discount: 0, net: 2296 },
      { item: "BACARDI MANGO CHILLI(R)180ML", category: "IMFL RUM", sold: 2, unit: 290, gross: 580, discount: 0, net: 580 },
      { item: "BACARDI MANGO CHILLI(R)375ML", category: "IMFL RUM", sold: 6, unit: 524, gross: 3144, discount: 0, net: 3144 },
      { item: "BACARDI MANGO CHILLI(R)375ML", category: "IMFL RUM", sold: 1, unit: 530, gross: 530, discount: 0, net: 530 },
      { item: "BACARDI MANGO CHILLI(R)750ML", category: "IMFL RUM", sold: 1, unit: 1000, gross: 1000, discount: 0, net: 1000 },
      { item: "BACARDI(R)180ML", category: "IMFL RUM", sold: 1, unit: 280, gross: 280, discount: 0, net: 280 }
    ];
    const money = (value) => value.toLocaleString("en-IN");
    const totals = rows.reduce((summary, row) => {
      summary.items += row.sold;
      summary.gross += row.gross;
      summary.discount += row.discount;
      summary.net += row.net;
      summary.categories[row.category] = (summary.categories[row.category] || 0) + row.net;
      return summary;
    }, { items: 0, gross: 0, discount: 0, net: 0, categories: {} });
    const categoryRows = Object.entries(totals.categories);
    const maxCategory = Math.max(...categoryRows.map(([, value]) => value));
    const topRow = rows.reduce((top, row) => row.sold > top.sold ? row : top, rows[0]);

    scene.innerHTML = `
      <section class="command-screen sales-view sales-report-screen">
        <div class="command-hero">
          <p class="eyebrow">Sales report</p>
          <h2>Item Wise Sales Performance</h2>
          <span>Live alcohol sales summary generated from item-wise report data</span>
        </div>
        <div class="command-kpis">
          <article><span>Net Total</span><strong>Rs. ${money(totals.net)}</strong></article>
          <article><span>Items Sold</span><strong>${money(totals.items)}</strong></article>
          <article><span>Gross Sales</span><strong>Rs. ${money(totals.gross)}</strong></article>
          <article><span>Top Item</span><strong>${topRow.item}</strong></article>
        </div>
        <div class="sales-report-layout">
          <article class="sales-chart-panel">
            <h3>Category Net Sales</h3>
            <div class="sales-category-chart">
              ${categoryRows.map(([category, value]) => `
                <div class="sales-category-row">
                  <span>${category}</span>
                  <div><i style="--w: ${(value / maxCategory) * 100}%"></i></div>
                  <strong>Rs. ${money(value)}</strong>
                </div>
              `).join("")}
            </div>
          </article>
          <article class="sales-donut-panel">
            <div class="sales-donut" style="--beer: ${(totals.categories["BEER MADE IN INDIA"] / totals.net) * 100}%">
              <strong>Rs. ${money(totals.net)}</strong>
              <span>Net Total</span>
            </div>
            <div class="sales-mini-ledger">
              <span>Discounts</span><b>Rs. ${money(totals.discount)}</b>
              <span>Rows Scanned</span><b>${rows.length}</b>
              <span>Report Type</span><b>Item Wise</b>
            </div>
          </article>
        </div>
        <div class="sales-report-table">
          <table>
            <thead>
              <tr><th>Item Name</th><th>Category</th><th>Items Sold</th><th>Unit Price</th><th>Gross Sales</th><th>Discounts</th><th>Net Total</th></tr>
            </thead>
            <tbody>
              ${rows.map((row) => `
                <tr>
                  <td>${row.item}</td>
                  <td>${row.category}</td>
                  <td>${row.sold}</td>
                  <td>${money(row.unit)}</td>
                  <td>${money(row.gross)}</td>
                  <td>${money(row.discount)}</td>
                  <td>${money(row.net)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderReportCenter() {
    scene.innerHTML = `
      <section class="command-screen report-view">
        <div class="command-hero">
          <p class="eyebrow">Reports</p>
          <h2>Report Center</h2>
          <span>Item, category, customer, and sale summary reports</span>
        </div>
        <div class="report-board">
          <article><b>Item Wise Report</b><span>Ready</span></article>
          <article><b>Category Wise Report</b><span>Ready</span></article>
          <article><b>Store Wise Report</b><span>Ready</span></article>
          <article><b>Sale Summary Report</b><span>Ready</span></article>
          <article><b>Sale Statement Report</b><span>Ready</span></article>
          <article><b>Date Wise Sale Summary</b><span>Ready</span></article>
        </div>
      </section>
    `;
  }

  function renderWebExcise() {
    const query = "last year web excise revenue";
    scene.innerHTML = `
      <section class="browser-screen fake-research-screen">
        <div class="browser-top">
          <span></span><span></span><span></span>
          <div>snapkey://live-research/west-bengal-excise-revenue</div>
        </div>
        <div class="browser-search">
          <p class="eyebrow">Live Research</p>
          <h2>${query}</h2>
          <span>Searching public web sources and preparing a presentation summary...</span>
        </div>
        <div class="search-results">
          <article><b>Query Parsed</b><span>West Bengal excise revenue, previous financial year.</span></article>
          <article><b>Source Scan</b><span>Government revenue reports, department updates, and public finance summaries.</span></article>
          <article><b>Live Summary</b><span>Result cards can be updated later with the final verified text.</span></article>
        </div>
      </section>
    `;
  }

  function renderSocialMedia() {
    scene.innerHTML = `
      <section class="command-screen social-view">
        <div class="command-hero">
          <p class="eyebrow">Social Media</p>
          <h2>Engagement Command Center</h2>
          <span>Campaign performance and audience response</span>
        </div>
        <div class="command-kpis">
          <article><span>Reach</span><strong>48.2K</strong></article>
          <article><span>Engagement</span><strong>8.7K</strong></article>
          <article><span>Leads</span><strong>312</strong></article>
          <article><span>Sentiment</span><strong>Positive</strong></article>
        </div>
        <div class="social-columns"><article>Instagram</article><article>Facebook</article><article>YouTube</article><article>WhatsApp</article></div>
      </section>
    `;
  }

  function renderDonatingSociety(selectedSlideId) {
    const slides = getCsrSlides();
    const activeSlide = selectedSlideId || activeCsrSlideId || slides[0]?.id;
    activeCsrSlideId = activeSlide;
    scene.innerHTML = `
      <section class="csr-impact-screen csr-presentation-screen manual">
        <div class="csr-backdrop" aria-hidden="true">
          ${slides.map((slide, index) => `
            <article class="csr-slide ${slide.id === activeSlide ? "active" : ""}" style="--slide-image: url('${slide.image}'); --slide-tone: ${slide.tone}; --slide-delay: ${index * 7}s">
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function getCsrSlides() {
    return appConfig.csrSlides || [];
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
          <div class="message document">Madhushala_Sales_Report_Today.csv</div>
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

      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(formatWhatsappError(response.status, result));
      status.textContent = "Today's sales report was accepted by WhatsApp.";
      title.textContent = "Report submitted";
      detail.textContent = "Waiting for WhatsApp delivery confirmation...";
      pollWhatsappStatus(whatsapp, status, title, detail);
    } catch (error) {
      console.warn(error);
      status.textContent = "Automatic WhatsApp send failed. Open WhatsApp to send manually.";
      title.textContent = "Delivery needs attention";
      detail.textContent = error.message || "Check the WhatsApp API endpoint or use the Open WhatsApp button.";
    }
  }

  function pollWhatsappStatus(whatsapp, status, title, detail) {
    let attempts = 0;
    const to = encodeURIComponent(whatsapp.phoneNumber || "");
    const timer = window.setInterval(async () => {
      attempts += 1;

      try {
        const response = await fetch(`/api/whatsapp-status?to=${to}`);
        const result = await response.json();
        const summary = result.summary || {};

        if (summary.status && summary.status !== "waiting") {
          title.textContent = `WhatsApp ${summary.label}`;
          detail.textContent = whatsappStatusDetail(summary.status, result.records || []);
        }

        if (attempts >= 24 && ["accepted", "waiting"].includes(summary.status)) {
          title.textContent = "Delivery status pending";
          detail.textContent = "WhatsApp accepted the report, but Meta has not sent a delivery webhook yet.";
        }

        if (["delivered", "read", "failed"].includes(summary.status) || attempts >= 24) {
          window.clearInterval(timer);
        }
      } catch (error) {
        console.warn(error);
        if (attempts >= 24) window.clearInterval(timer);
      }
    }, 2500);
  }

  function whatsappStatusDetail(status, records) {
    const reportRecord = records.find((record) => record.kind === "report") || records[0];
    if (status === "read") return "The recipient opened the WhatsApp report message.";
    if (status === "delivered") return "The CSV report reached the recipient's WhatsApp.";
    if (status === "sent") return "WhatsApp has sent the report toward the recipient.";
    if (status === "failed") return reportRecord?.errorMessage || "WhatsApp reported that delivery failed.";
    return "WhatsApp accepted the sales summary and CSV report. Waiting for Meta delivery webhook.";
  }

  function formatWhatsappError(statusCode, result) {
    const metaError = result?.details?.error;
    if (metaError?.message) {
      const code = metaError.code ? ` Code ${metaError.code}.` : "";
      const subcode = metaError.error_subcode ? ` Subcode ${metaError.error_subcode}.` : "";
      return `${result.error || "WhatsApp send failed."} ${metaError.message}.${code}${subcode}`;
    }

    if (result?.error) return `${result.error} Status ${statusCode}.`;
    return `WhatsApp endpoint failed with status ${statusCode}.`;
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
      <video class="camera-video" autoplay muted loop playsinline preload="auto" disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback" onerror="this.hidden=true">
        <source src="${camera.video}" type="video/mp4">
      </video>
    `;
  }

  function keepCameraVideosLive() {
    scene.querySelectorAll(".camera-video").forEach((video) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = false;

      const restart = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        video.currentTime = 0.05;
        video.play().catch(() => {});
      };

      video.addEventListener("ended", restart);
      video.addEventListener("pause", () => {
        if (!video.hidden) video.play().catch(() => {});
      });
      video.addEventListener("stalled", () => video.load());
      video.play().catch(() => {});
    });
  }
})();
