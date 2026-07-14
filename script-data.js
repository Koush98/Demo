window.SNAPKEY_ACTIONS = [
  {
    id: "hi",
    trigger: "Hi SnapKey",
    response: "Hello Mr. Tiwari, how can I help you?",
    scene: "welcome",
    steps: ["Voice command received", "Identity matched: Mr. Tiwari", "Shop systems checked", "Assistant response ready"],
    audio: "assets/audio/hi-snapkey.mp3"
  },
  {
    id: "shop-cameras",
    trigger: "Can you show me my shop camera?",
    response: "Ok, showing your shop cameras.",
    scene: "cameras",
    steps: ["Voice command received", "Connecting to shop CCTV feed", "Checking 4 camera streams", "Camera wall opened"],
    audio: "assets/audio/show-shop-cameras.mp3"
  },
  {
    id: "camera-2-report",
    trigger: "Show camera 2 and show me report",
    response: "Opening camera 2 with the latest activity report.",
    scene: "camera2",
    steps: ["Camera 2 selected", "Reading billing counter activity", "Estimating queue length", "Report generated"],
    audio: "assets/audio/camera-2-report.mp3"
  },
  {
    id: "today-report",
    trigger: "Show me my today's report",
    response: "Opening today's business dashboard.",
    scene: "dashboard",
    steps: ["Fetching today's sales", "Calculating order summary", "Ranking categories", "Dashboard opened"],
    audio: "assets/audio/todays-report.mp3"
  },
  {
    id: "whatsapp-report",
    trigger: "Send me sales report on my WhatsApp",
    response: "Your sales report is ready to send on WhatsApp.",
    scene: "whatsapp",
    steps: ["Sales report compiled", "PDF summary prepared", "WhatsApp contact selected", "Message queued"],
    audio: "assets/audio/whatsapp-sales-report.mp3"
  }
];
