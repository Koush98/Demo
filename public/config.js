window.SNAPKEY_CONFIG = {
  provider: "supabase",

  supabase: {
    url: "https://bsfwffwsmpkijfhcnjzp.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZndmZndzbXBraWpmaGNuanpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTI2OTUsImV4cCI6MjA5OTU4ODY5NX0.VoNM0SwG9jZzmcJ5MNVoOKRG1clsOUgv6K7VBVpUVKU",
    channel: "Demo"
  },

  whatsapp: {
    // Add country code without +. Example India: "919876543210"
    phoneNumber: "919831004803",
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
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784119579/cam_2_fasvxn.mp4",
      analytics: {
        customers: 5,
        staff: 3,
        bottles: 2
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

  presentationVideos: [
    {
      id: "video1",
      title: "ABM Video 1",
      subtitle: "ABM Techno Matrix presentation",
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784236566/abm1_mmksar.mp4"
    },
    {
      id: "video2",
      title: "ABM Video 2",
      subtitle: "ABM Techno Matrix showcase",
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784259793/abmnew_jn1blz.mp4"
    },
    {
      id: "video3",
      title: "Lions Association",
      subtitle: "Community service presentation",
      video: "https://res.cloudinary.com/dhluqyjl5/video/upload/v1784236804/lions_v2mrzf.mp4"
    }
  ],

  standbySlides: [
    {
      id: "abm",
      title: "ABM Techno Matrix",
      subtitle: "Technology, service, and business growth",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233304/abm_meviav.png",
      tone: "#e5b72f"
    },
    {
      id: "madhushalapro",
      title: "Madhushala Pro",
      subtitle: "Smart software for wine shop operations",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233302/madhusalapro_q39hnx.png",
      tone: "#25b87b"
    },
    {
      id: "abmai",
      title: "ABM AI",
      subtitle: "Automation-led business assistance",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233773/abmai_skp1w1.png",
      tone: "#48a7ff"
    },
    {
      id: "thanku",
      title: "Thank You",
      subtitle: "For the opportunity to serve",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233310/thanku_p0q8qv.png",
      tone: "#f0c935"
    }
  ],

  csrSlides: [
    {
      id: "foodcamp",
      title: "2000+ Food Camps",
      subtitle: "Serving communities across the last 10 years",
      metric: "10 Years",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784206738/foodcamp_p1lhh7.png",
      tone: "#e5b72f"
    },
    {
      id: "eyetest",
      title: "Eye Testing Camps",
      subtitle: "Accessible healthcare support for communities",
      metric: "Health",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784206738/eyetest_bmvsxi.png",
      tone: "#25b87b"
    },
    {
      id: "childhealth",
      title: "Child Health Camp",
      subtitle: "Care, checkups, and welfare initiatives",
      metric: "Child Care",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784206738/childhealth_cj5e6q.png",
      tone: "#48a7ff"
    },
    {
      id: "training",
      title: "Industrial Training",
      subtitle: "Skill development for college pass students",
      metric: "Training",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784206746/training_x0ugyg.png",
      tone: "#f0c935"
    },
    {
      id: "placed",
      title: "500 Students Placed",
      subtitle: "Good salary opportunities in good companies",
      metric: "500",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784206737/placed_pacydy.png",
      tone: "#6fd35f"
    },
    {
      id: "abm",
      title: "ABM Techno Matrix",
      subtitle: "Technology, service, and business growth",
      metric: "ABM",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233304/abm_meviav.png",
      tone: "#e5b72f"
    },
    {
      id: "madhushalapro",
      title: "Madhushala Pro",
      subtitle: "Smart software for wine shop operations",
      metric: "Pro",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233302/madhusalapro_q39hnx.png",
      tone: "#25b87b"
    },
    {
      id: "abmai",
      title: "ABM AI",
      subtitle: "Automation-led business assistance",
      metric: "AI",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233773/abmai_skp1w1.png",
      tone: "#48a7ff"
    },
    {
      id: "thanku",
      title: "Thank You",
      subtitle: "For the opportunity to serve",
      metric: "Thanks",
      image: "https://res.cloudinary.com/dhluqyjl5/image/upload/v1784233310/thanku_p0q8qv.png",
      tone: "#f0c935"
    }
  ],

  channelPath: "Demo/currentAction"
};
