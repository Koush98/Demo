window.SNAPKEY_CONFIG = {
  provider: "supabase",

  supabase: {
    url: "https://bsfwffwsmpkijfhcnjzp.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZndmZndzbXBraWpmaGNuanpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTI2OTUsImV4cCI6MjA5OTU4ODY5NX0.VoNM0SwG9jZzmcJ5MNVoOKRG1clsOUgv6K7VBVpUVKU",
    channel: "Demo"
  },

  whatsapp: {
    // Add country code without +. Example India: "919876543210"
    phoneNumber: "9162906645470",
    // Optional: add a backend URL that sends through WhatsApp Cloud API.
    // The browser will POST { phoneNumber, message } and mark the report sent only when it returns OK.
    autoSendEndpoint: "/api/send-whatsapp",
    reportFileUrl: "/assets/reports/Madhushala_Sales_Report_Today.csv",
    reportFileName: "Madhushala_Sales_Report_Today.csv",
    reportMessage: "Madhushala POS today's sales report:%0A%0ATotal Sales: Rs. 84,250%0ABills: 183%0AAverage Bill: Rs. 460%0ATop Item: Kingfisher Premium 650ml%0A%0ACategory Sales:%0ABeer: Rs. 32,800%0AWhisky: Rs. 27,450%0AVodka: Rs. 9,700%0ARum: Rs. 8,950%0AWine: Rs. 5,350"
  },

  cameras: [
    {
      id: "camera1",
      title: "Camera 1",
      location: "Entrance",
      detail: "Customers entering",
      status: "green",
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784113768/1_annotated_annotated_kfcm96.mp4"
    },
    {
      id: "camera2",
      title: "Camera 2",
      location: "Billing Counter",
      detail: "Queue active",
      status: "amber",
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784113871/2_annotated_annotated_gogl94.mp4",
      analytics: {
        totalPeople: "9-10",
        staffVisible: 3,
        bottlesOnTable: "6-7",
        counterStatus: "Active",
        queueLength: "5-6",
        averageWait: "2 min 10 sec",
        transactions: 57,
        alert: "Bottles detected on table"
      }
    },
    {
      id: "camera3",
      title: "Camera 3",
      location: "Premium Shelf",
      detail: "Normal movement",
      status: "green",
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784113768/3_annotated_annotated_viied5.mp4"
    },
    {
      id: "camera4",
      title: "Camera 4",
      location: "Stock Room",
      detail: "No alerts",
      status: "green",
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784113876/4_annotated_annotated_pijjk4.mp4"
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
