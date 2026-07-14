window.SNAPKEY_CONFIG = {
  provider: "supabase",

  supabase: {
    url: "https://bsfwffwsmpkijfhcnjzp.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZndmZndzbXBraWpmaGNuanpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTI2OTUsImV4cCI6MjA5OTU4ODY5NX0.VoNM0SwG9jZzmcJ5MNVoOKRG1clsOUgv6K7VBVpUVKU",
    channel: "Demo"
  },

  whatsapp: {
    // Add country code without +. Example India: "919876543210"
    phoneNumber: "62906645470",
    reportMessage: "Madhushala POS today's sales report:%0A%0ATotal Sales: Rs. 84,250%0ABills: 183%0AAverage Bill: Rs. 460%0ATop Item: Kingfisher Premium 650ml%0A%0ACategory Sales:%0ABeer: Rs. 32,800%0AWhisky: Rs. 27,450%0AVodka: Rs. 9,700%0ARum: Rs. 8,950%0AWine: Rs. 5,350"
  },

  cameras: [
    {
      id: "camera1",
      title: "Camera 1",
      location: "Entrance",
      detail: "Customers entering",
      status: "green",
      video: "assets/videos/camera1.mp4"
    },
    {
      id: "camera2",
      title: "Camera 2",
      location: "Billing Counter",
      detail: "Queue active",
      status: "amber",
      video: "assets/videos/camera2.mp4",
      analytics: {
        totalPeople: 18,
        male: 11,
        female: 7,
        nearCounter: 6,
        queueLength: 6,
        averageWait: "3 min 20 sec",
        staffVisible: 2,
        transactions: 57,
        alert: "Counter busy"
      }
    },
    {
      id: "camera3",
      title: "Camera 3",
      location: "Premium Shelf",
      detail: "Normal movement",
      status: "green",
      video: "assets/videos/camera3.mp4"
    },
    {
      id: "camera4",
      title: "Camera 4",
      location: "Stock Room",
      detail: "No alerts",
      status: "green",
      video: "assets/videos/camera4.mp4"
    },
    {
      id: "camera5",
      title: "Camera 5",
      location: "Exit Gate",
      detail: "Exit flow normal",
      status: "green",
      video: "assets/videos/camera5.mp4"
    }
  ],

  channelPath: "Demo/currentAction"
};
