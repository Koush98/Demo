(function () {
  const config = window.SNAPKEY_CONFIG || {};
  const channelPath = config.channelPath || "snapkey-demo/currentAction";
  const fallbackKey = "snapkey-current-action";
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("snapkey-demo") : null;
  let firebaseReady = false;
  let supabaseReady = false;
  let dbRef = null;
  let supabaseChannel = null;

  function cleanPayload(payload) {
    return {
      actionId: payload.actionId,
      csrSlideId: payload.csrSlideId,
      cameraId: payload.cameraId,
      cameraActionId: payload.cameraActionId,
      reload: payload.reload,
      voicePause: payload.voicePause,
      at: Date.now()
    };
  }

  async function loadFirebase() {
    if (config.provider !== "firebase" || !config.firebase || !config.firebase.databaseURL) return false;

    const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const dbModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js");
    const app = appModule.initializeApp(config.firebase);
    const db = dbModule.getDatabase(app);
    dbRef = {
      ref: dbModule.ref(db, channelPath),
      set: dbModule.set,
      onValue: dbModule.onValue
    };
    firebaseReady = true;
    return true;
  }

  async function loadSupabase() {
    if (config.provider !== "supabase" || !config.supabase || !config.supabase.url || !config.supabase.anonKey) {
      return false;
    }

    const module = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
    const client = module.createClient(config.supabase.url, config.supabase.anonKey);
    supabaseChannel = client.channel(config.supabase.channel || "snapkey-demo", {
      config: { broadcast: { self: true } }
    });

    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Supabase channel connection timed out.")), 8000);
      supabaseChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          window.clearTimeout(timeout);
          resolve();
        }
      });
    });

    supabaseReady = true;
    return true;
  }

  function publishFallback(payload) {
    const clean = cleanPayload(payload);
    localStorage.setItem(fallbackKey, JSON.stringify(clean));
    if (channel) channel.postMessage(clean);
  }

  async function publish(payload) {
    const clean = cleanPayload(payload);
    if (firebaseReady && dbRef) {
      await dbRef.set(dbRef.ref, clean);
      return;
    }
    if (supabaseReady && supabaseChannel) {
      await supabaseChannel.send({
        type: "broadcast",
        event: "action",
        payload: clean
      });
      return;
    }
    publishFallback(clean);
  }

  function subscribeFallback(callback) {
    window.addEventListener("storage", (event) => {
      if (event.key !== fallbackKey || !event.newValue) return;
      callback(JSON.parse(event.newValue));
    });

    if (channel) {
      channel.onmessage = (event) => callback(event.data);
    }

    const current = localStorage.getItem(fallbackKey);
    if (current) callback(JSON.parse(current));
  }

  async function subscribe(callback) {
    if (firebaseReady && dbRef) {
      dbRef.onValue(dbRef.ref, (snapshot) => {
        const value = snapshot.val();
        if (value) callback(value);
      });
      return;
    }
    if (supabaseReady && supabaseChannel) {
      supabaseChannel.on("broadcast", { event: "action" }, (event) => {
        if (event.payload) callback(event.payload);
      });
      return;
    }
    subscribeFallback(callback);
  }

  window.SnapKeySync = {
    init: async () => {
      if (await loadSupabase()) return true;
      if (await loadFirebase()) return true;
      return false;
    },
    publish,
    subscribe,
    usingFirebase: () => firebaseReady,
    usingSupabase: () => supabaseReady
  };
})();
