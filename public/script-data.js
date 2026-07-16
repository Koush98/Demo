window.SNAPKEY_ACTIONS = [
  {
    id: "hi",
    trigger: "Hi SnapKey",
    response: "Hello Mr. Tiwari, how can I help you?",
    scene: "welcome",
    steps: ["Voice command received", "Identity matched: Mr. Tiwari", "Shop systems checked", "Assistant response ready"],
    audio: "assets/videos/hii.mp3",
    aliases: ["hi snapkey", "who are you"]
  },
  {
    id: "shop-cameras",
    trigger: "Can you show me my shop camera?",
    response: "Ok, showing your shop cameras.",
    scene: "cameras",
    steps: ["Voice command received", "Connecting to shop CCTV feed", "Checking 5 camera streams", "Camera wall opened"],
    audio: "assets/videos/dukan.mp3",
    aliases: ["show my shop camera", "show me my shop camera", "show cameras"]
  },
  {
    id: "camera-2-report",
    trigger: "Show camera 2 and show me report",
    response: "Opening camera 2 with the latest activity report.",
    scene: "camera2",
    steps: ["Camera 2 selected", "Reading billing counter activity", "Estimating queue length", "Report generated"],
    audio: "assets/videos/camera2-report.mp3",
    aliases: ["show camera 2", "show camera two", "show camera 2 report", "show camera two report"]
  },
  {
    id: "today-report",
    trigger: "Show me my today's report",
    response: "Opening today's business dashboard.",
    scene: "dashboard",
    steps: ["Fetching today's sales", "Calculating order summary", "Ranking categories", "Dashboard opened"],
    audio: "assets/videos/dashboard.mp3",
    audioQueue: [
      "assets/videos/dashboard.mp3",
      "assets/videos/dashboard/1.mp3",
      "assets/videos/dashboard/2.mp3",
      "assets/videos/dashboard/3.mp3"
    ],
    aliases: ["show today's report", "show todays report", "open dashboard", "show dashboard"]
  },
  {
    id: "whatsapp-report",
    trigger: "Send me sales report on my WhatsApp",
    response: "Your sales report is ready to send on WhatsApp.",
    scene: "whatsapp",
    steps: ["Sales report compiled", "PDF summary prepared", "WhatsApp contact selected", "Message queued"],
    audio: "assets/videos/report.mp3",
    aliases: ["send sales report on whatsapp", "send me sales report on whatsapp", "send report on whatsapp"]
  },
  {
    id: "pro-new-dashboard",
    trigger: "Show me pro new dashboard",
    response: "Opening the new pro dashboard view.",
    scene: "proDashboard",
    steps: ["Command received", "Loading pro dashboard", "Preparing executive tiles", "Dashboard opened"],
    audio: "",
    aliases: ["show pro dashboard", "show new dashboard", "show pro new dashboard"]
  },
  {
    id: "sales-screen",
    trigger: "Show me sales",
    response: "Opening sales performance screen.",
    scene: "sales",
    steps: ["Sales command received", "Collecting sales indicators", "Preparing charts", "Sales screen opened"],
    audio: "",
    aliases: ["show sales", "show me sales", "open sales"]
  },
  {
    id: "report-screen",
    trigger: "Show me report",
    response: "Opening the report center.",
    scene: "reportCenter",
    steps: ["Report command received", "Reading report modules", "Preparing report summary", "Report center opened"],
    audio: "",
    aliases: ["show report", "show me report", "open report"]
  },
  {
    id: "web-excise-revenue",
    trigger: "Show me last year web excise revenue",
    response: "Opening a live web search for last year web excise revenue.",
    scene: "webExcise",
    steps: ["Search command received", "Opening browser workspace", "Searching excise revenue", "Results screen opened"],
    audio: "",
    aliases: ["show last year web excise revenue", "last year web excise revenue", "open chrome excise revenue", "search excise revenue"]
  },
  {
    id: "social-media",
    trigger: "Show me social media screen",
    response: "Opening the social media monitoring screen.",
    scene: "socialMedia",
    steps: ["Social command received", "Checking social channels", "Preparing engagement view", "Social screen opened"],
    audio: "",
    aliases: ["show social media", "show social media screen", "open social media"]
  },
  {
    id: "donating-society",
    trigger: "Show me donating society",
    response: "Opening the donating society dashboard.",
    scene: "donatingSociety",
    steps: ["Society command received", "Loading donation records", "Preparing community metrics", "Society dashboard opened"],
    audio: "",
    presentationMode: true,
    aliases: ["show donating society", "donating society", "open donating society"]
  }
];
