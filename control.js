(async function () {
  const actions = window.SNAPKEY_ACTIONS || [];
  const list = document.getElementById("actionList");
  const syncMode = document.getElementById("syncMode");
  const lastTrigger = document.getElementById("lastTrigger");

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

  actions.forEach((action, index) => {
    const button = document.createElement("button");
    button.className = "action-button";
    button.type = "button";
    button.innerHTML = `
      <span class="key">${index + 1}</span>
      <span>
        <span class="trigger">${action.trigger}</span>
        <span class="response">${action.response}</span>
      </span>
    `;
    button.addEventListener("click", () => runAction(action));
    list.appendChild(button);
  });

  window.addEventListener("keydown", (event) => {
    const number = Number(event.key);
    if (!number || !actions[number - 1]) return;
    runAction(actions[number - 1]);
  });

  async function runAction(action) {
    await window.SnapKeySync.publish({ actionId: action.id });
    lastTrigger.textContent = action.trigger;
  }
})();
