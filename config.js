window.SNAPKEY_CONFIG = {
  // Use "local", "firebase", or "supabase".
  // Leave as "local" for same-browser testing.
  provider: "local",

  // Optional Supabase Realtime config.
  // 1. Create a Supabase project.
  // 2. Copy Project URL and anon public key from Project Settings > API.
  // 3. Set provider to "supabase".
  //
  // supabase: {
  //   url: "https://YOUR_PROJECT.supabase.co",
  //   anonKey: "YOUR_ANON_PUBLIC_KEY",
  //   channel: "snapkey-demo"
  // },

  // Optional Firebase Realtime Database config.
  //
  // firebase: {
  //   apiKey: "YOUR_API_KEY",
  //   authDomain: "YOUR_PROJECT.firebaseapp.com",
  //   databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  //   projectId: "YOUR_PROJECT",
  //   appId: "YOUR_APP_ID"
  // },
  channelPath: "snapkey-demo/currentAction"
};
