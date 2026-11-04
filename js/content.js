/* =====================================================================
   DEVOCRAT — site content.  Edit text here; no other file needs to change.
   Keep the quotes, commas and brackets as they are.
   ===================================================================== */

// The 12 worlds. "name", "desc" and "tag" appear on the planet labels; order = orbit order (inner → outer).
// ("title" and "lead" are no longer shown — the hero text is in WORLD_COPY below.)
const WORLDS=[
  {
    "id": "modern",
    "name": "Modern",
    "desc": "Clean systems. Soft gradients. Sharp thinking.",
    "icon": "◐",
    "tag": "01 / CLEAN & CLEAR",
    "title": "Ideas, made intuitive.",
    "lead": "A confident, modern digital experience where every interaction feels effortless and every detail has a purpose."
  },
  {
    "id": "elegant",
    "name": "Elegant",
    "desc": "Quiet luxury, serif type and refined details.",
    "icon": "✦",
    "tag": "02 / QUIET LUXURY",
    "title": "Less noise. More meaning.",
    "lead": "A refined world of generous space, considered typography and understated detail — made for brands that value timeless quality."
  },
  {
    "id": "hospital",
    "name": "Hospital",
    "desc": "Calm, trustworthy and human-centred.",
    "icon": "✚",
    "tag": "03 / CARE & CLARITY",
    "title": "Technology that cares.",
    "lead": "Friendly, accessible interfaces designed to make complex services feel clear, safe and reassuring."
  },
  {
    "id": "salon",
    "name": "Salon",
    "desc": "Blush tones, soft curves and beauty energy.",
    "icon": "✿",
    "tag": "04 / BEAUTY & FEELING",
    "title": "Your next glow-up starts here.",
    "lead": "A polished, expressive digital world for beauty, lifestyle and service brands that want every visit to feel personal."
  },
  {
    "id": "illus",
    "name": "Illustrative",
    "desc": "Handmade character with playful lines.",
    "icon": "✎",
    "tag": "05 / MADE BY HAND",
    "title": "Make room for imagination.",
    "lead": "Expressive shapes, imperfect edges and unexpected details give your brand a voice that feels unmistakably human."
  },
  {
    "id": "mandala",
    "name": "Mandala",
    "desc": "Rangoli geometry, saffron light and block-print colour.",
    "icon": "✺",
    "tag": "06 / PATTERN & SOUL",
    "title": "Every detail has a rhythm.",
    "lead": "A bright, hand-made world of radial symmetry and block-print colour, where every pattern repeats with purpose and every detail earns its place."
  },
  {
    "id": "interior",
    "name": "Interior Designer",
    "desc": "Natural materials, warm tones and spatial calm.",
    "icon": "⌂",
    "tag": "07 / SPACE & FORM",
    "title": "Design the feeling of a space.",
    "lead": "A tactile, editorial experience built around materials, proportions and thoughtful spatial storytelling."
  },
  {
    "id": "arch",
    "name": "Architect",
    "desc": "Blueprint grids, precision and structure.",
    "icon": "⌗",
    "tag": "08 / STRUCTURE & VISION",
    "title": "Build with intention.",
    "lead": "A technical, architectural language where grids, linework and precise layouts make every idea feel engineered."
  },
  {
    "id": "funny",
    "name": "Funny",
    "desc": "Big personality, bold colour and cheeky motion.",
    "icon": "✹",
    "tag": "09 / BIG PERSONALITY",
    "title": "Serious about having fun.",
    "lead": "A loud, joyful digital playground for brands that refuse to blend in — full of energy, wit and playful movement."
  },
  {
    "id": "kids",
    "name": "Kids",
    "desc": "Bright, friendly, rounded and full of wonder.",
    "icon": "☁",
    "tag": "10 / PLAY & DISCOVERY",
    "title": "Little clicks. Big adventures.",
    "lead": "A welcoming, colourful world built to make exploration feel safe, delightful and easy to understand."
  },
  {
    "id": "auto",
    "name": "Automotive",
    "desc": "Carbon textures, racing lines and red accents.",
    "icon": "⌁",
    "tag": "11 / SPEED & PRECISION",
    "title": "Built to move you.",
    "lead": "A high-performance visual system with bold contrast, kinetic angles and a sense of speed in every interaction."
  },
  {
    "id": "future",
    "name": "Futuristic",
    "desc": "Neon grids, glowing edges and digital energy.",
    "icon": "◇",
    "tag": "12 / TOMORROW, NOW",
    "title": "Step into what’s next.",
    "lead": "A high-voltage interface world where luminous graphics, digital grids and sharp interactions bring the future closer."
  }
];

// Per-world hero headline, the line under it, artwork placement (left / right / behind) and each section heading.
const WORLD_COPY={
  "modern": {
    "hero": "Ideas Into Digital Reality.",
    "sub": "Clean, intelligent websites, apps and software — designed with clarity, built to perform.",
    "art": "right",
    "about": "Our Story",
    "services": "What We Do",
    "lab": "The Innovation Lab",
    "contact": "Let's Connect"
  },
  "elegant": {
    "hero": "Where Vision Meets Excellence.",
    "sub": "Refined digital experiences for brands that value craft, detail and timeless quality.",
    "art": "behind",
    "about": "The Legacy",
    "services": "Our Craft",
    "lab": "The Atelier",
    "contact": "Begin Your Journey"
  },
  "hospital": {
    "hero": "Technology That Cares.",
    "sub": "Calm, accessible digital tools that make care simpler for patients and the people who look after them.",
    "art": "right",
    "about": "Who We Care For",
    "services": "Our Specialities",
    "lab": "The Medical Simulation Lab",
    "contact": "We're Here For You"
  },
  "salon": {
    "hero": "Where Every Style Finds Its Expression.",
    "sub": "Bookings, brands and beautiful apps for salons and studios — for every style and every client.",
    "art": "left",
    "about": "Beyond The Style",
    "services": "The Style Menu",
    "lab": "The Style Studio",
    "contact": "Book Your Experience"
  },
  "illus": {
    "hero": "Think It. Sketch It. Build It.",
    "sub": "From a pencil line to a working product — hand-made design with serious engineering underneath.",
    "art": "right",
    "about": "The Creative Minds",
    "services": "What We Create",
    "lab": "The Imagination Lab",
    "contact": "Let's Create Together"
  },
  "mandala": {
    "hero": "Every Detail. A Masterpiece.",
    "sub": "Patterned with purpose — digital products where every element repeats with meaning and works in harmony.",
    "art": "right",
    "about": "Our Inner Circle",
    "services": "Our Expressions",
    "lab": "The Creation Mandala",
    "contact": "Find Your Connection"
  },
  "interior": {
    "hero": "We Design Beyond Dimensions.",
    "sub": "Websites and tools that let people walk through your spaces before they ever step inside.",
    "art": "left",
    "about": "Behind The Spaces",
    "services": "Design Solutions",
    "lab": "The Design Studio",
    "contact": "Let's Shape Your Space"
  },
  "arch": {
    "hero": "Engineered Ideas. Exceptional Outcomes.",
    "sub": "Precise, structured digital systems — planned like a blueprint, built to stand.",
    "art": "behind",
    "about": "Our Foundation",
    "services": "Our Structures",
    "lab": "The Blueprint Lab",
    "contact": "Build With Us"
  },
  "funny": {
    "hero": "Got an Idea? We Make It Click!",
    "sub": "Bold, cheerful websites and apps people actually enjoy clicking. Serious work, zero boring bits.",
    "art": "right",
    "about": "Who Are These People?",
    "services": "Things We Do (Pretty Well!)",
    "lab": "The Mad Scientist's Lab",
    "contact": "Come Say Hello!"
  },
  "kids": {
    "hero": "Big Ideas Start With Little Dreams.",
    "sub": "Safe, colourful and easy-to-use digital worlds that make learning and play feel like an adventure.",
    "art": "behind",
    "about": "Meet The Dreamers",
    "services": "Our Superpowers",
    "lab": "The Wonder Lab",
    "contact": "Let's Make Magic"
  },
  "auto": {
    "hero": "Built for Speed. Designed for Impact.",
    "sub": "High-performance websites and apps for brands that move fast — sharp design, zero lag.",
    "art": "right",
    "about": "Under The Hood",
    "services": "Performance Services",
    "lab": "The Engineering Garage",
    "contact": "Start Your Engines"
  },
  "future": {
    "hero": "The Future Is Not Coming. We're Building It.",
    "sub": "Next-generation interfaces, smart systems and digital experiences engineered for tomorrow.",
    "art": "behind",
    "about": "The Origin Protocol",
    "services": "Our Capabilities",
    "lab": "The Quantum Lab",
    "contact": "Establish Connection"
  }
};

// Services cards: [icon, title, text] — the same in every world.
const SERVICES=[
  [
    "✳",
    "Websites",
    "Distinctive, responsive websites that tell your story and turn visitors into customers."
  ],
  [
    "▤",
    "Web applications",
    "Dashboards, booking systems and workflow tools built around how your business actually runs."
  ],
  [
    "▣",
    "Mobile apps",
    "Clear, fast mobile experiences, from the first tap to the task complete."
  ],
  [
    "⌘",
    "Custom software",
    "Purpose-built systems for the problems off-the-shelf tools can't solve."
  ]
];

// About section per world: lead line, three paragraphs, three highlight cards [title, text].
const ABOUT={
  "modern": {
    "lead": "Big Ideas. Smarter Technology.",
    "p": [
      "We are DEVOCRAT, a creative technology studio where great design meets powerful software. We believe businesses shouldn't have to spend a fortune to get technology that works beautifully.",
      "Manoj (Lucky) transforms ideas into modern, intuitive designs. Venkatesh (Venky) turns those designs into powerful websites, applications and feature-rich software.",
      "From custom business platforms to everyday digital tools, we create affordable solutions that adapt to your requirements, simplify your work and grow with your ambitions. No unnecessary complexity. Just technology built around you."
    ],
    "cards": [
      [
        "Smart On Your Budget",
        "Cost-effective digital solutions without compromising essential quality."
      ],
      [
        "Made To Fit Your Vision",
        "Customizable designs, features and workflows built around your needs."
      ],
      [
        "Simple Outside. Powerful Inside.",
        "User-friendly interfaces backed by feature-rich technology."
      ]
    ]
  },
  "elegant": {
    "lead": "Premium Experiences. Sensible Investment.",
    "p": [
      "Luxury isn't about spending more. It's about getting more value from every detail. At DEVOCRAT, we bring sophisticated design and powerful technology together to create digital experiences that feel premium without unnecessary costs.",
      "Manoj (Lucky) brings elegance, visual identity and attention to detail. Venkatesh (Venky) engineers the performance, functionality and flexibility behind every product.",
      "Whether it's a refined website, a customized business application or advanced management software, we deliver experiences tailored to your brand, budget and business requirements."
    ],
    "cards": [
      [
        "Premium Without The Premium Price",
        "Smart development choices that deliver exceptional value."
      ],
      [
        "Exclusively Yours",
        "Every interface, feature and detail can be customized."
      ],
      [
        "Elegance With Intelligence",
        "Sophisticated design combined with powerful, easy-to-use software."
      ]
    ]
  },
  "hospital": {
    "lead": "Better Technology. Easier Care.",
    "p": [
      "Technology should make people's lives easier, not create another complication. At DEVOCRAT, we design accessible and cost-conscious digital solutions that help businesses and service providers manage their operations more efficiently.",
      "Manoj (Lucky) focuses on clear layouts, accessible interfaces and user-friendly experiences. Venkatesh (Venky) develops the software, integrations and functional systems that bring those experiences to life.",
      "From appointment platforms and patient management systems to customized business software, we build practical, feature-rich solutions that can adapt to different requirements and budgets."
    ],
    "cards": [
      [
        "Technology Within Reach",
        "Cost-conscious solutions designed for organizations of different sizes."
      ],
      [
        "Designed Around People",
        "Easy navigation and interfaces that reduce learning time."
      ],
      [
        "Your System, Your Rules",
        "Customizable features and workflows for your operational needs."
      ]
    ]
  },
  "salon": {
    "lead": "Your Brand Deserves Its Own Style.",
    "p": [
      "Why should every business look and operate the same? At DEVOCRAT, we give every brand its own digital personality. We combine eye-catching design with affordable technology to create experiences that stand out and work effortlessly.",
      "Manoj (Lucky) takes care of the creativity, aesthetics and visual identity. Venkatesh (Venky) brings those ideas to life through websites, applications and powerful business software.",
      "From personalized interfaces to customized features, we make technology fit your business instead of forcing your business to fit the technology."
    ],
    "cards": [
      [
        "Beautiful On A Budget",
        "Professional digital design with cost-effective development."
      ],
      [
        "Your Style. Your Features.",
        "Customize colours, layouts, functions and experiences."
      ],
      [
        "Looks Good. Works Better.",
        "Attractive interfaces with powerful software functionality."
      ]
    ]
  },
  "illus": {
    "lead": "Imagine It. Customize It. Experience It.",
    "p": [
      "We see every idea as a blank canvas. At DEVOCRAT, creativity has no fixed template, and technology has no reason to be boring. We transform imagination into digital products that are practical, affordable and uniquely yours.",
      "Manoj (Lucky) creates the visual stories and interactive experiences. Venkatesh (Venky) turns those creative concepts into functional software and digital solutions.",
      "Whether you dream of a distinctive website, a personalized application or a feature-packed software platform, we build around your imagination, your requirements and your budget."
    ],
    "cards": [
      [
        "Creativity Without Expensive Limits",
        "Unique digital experiences made with smart, cost-effective development."
      ],
      [
        "Nothing Off The Shelf",
        "Customizable designs and features shaped around your ideas."
      ],
      [
        "More Than Just A Pretty Picture",
        "Interactive, user-friendly and powerful digital products."
      ]
    ]
  },
  "mandala": {
    "lead": "Every Detail Has A Purpose.",
    "p": [
      "Like a mandala, great digital products are built from many connected elements. Design, functionality, accessibility and technology must work in harmony. That's the philosophy behind DEVOCRAT.",
      "Manoj (Lucky) creates balanced visual experiences, while Venkatesh (Venky) develops the structure and technology that make everything work together.",
      "We build flexible, feature-rich and cost-effective solutions where every component has a purpose. From the smallest interface detail to the largest software function, everything is designed to fit together around your requirements."
    ],
    "cards": [
      [
        "Balanced Investment",
        "The right features and functionality without unnecessary expenses."
      ],
      [
        "Every Element Is Customizable",
        "Flexible layouts, modules and workflows that work together."
      ],
      [
        "Complex Technology. Simple Experience.",
        "Powerful functionality presented through intuitive interfaces."
      ]
    ]
  },
  "interior": {
    "lead": "Designed Around The Way You Work.",
    "p": [
      "A beautiful space should be functional. A great digital product should be exactly the same. At DEVOCRAT, we approach technology like thoughtful interior design: every element has a purpose, every feature has a place and every experience should feel natural.",
      "Manoj (Lucky) plans the visual structure, interface and user experience. Venkatesh (Venky) builds the functional framework, software and technical systems.",
      "We create customized websites, applications and management software that fit your business requirements, make everyday operations easier and deliver more value for your investment."
    ],
    "cards": [
      [
        "Smart Design. Smart Spending.",
        "Practical and cost-effective digital solutions."
      ],
      [
        "Built To Your Measurements",
        "Customizable interfaces, modules and functionality."
      ],
      [
        "Functionality In Every Corner",
        "Easy-to-use software with features that work for you."
      ]
    ]
  },
  "arch": {
    "lead": "Strong Ideas. Smarter Foundations.",
    "p": [
      "Every great building starts with a blueprint. Every great digital product starts with a clear understanding of what it needs to accomplish. At DEVOCRAT, we combine creative planning and technical engineering to turn ideas into functional digital structures.",
      "Manoj (Lucky) develops the visual blueprint and user experience. Venkatesh (Venky) engineers the architecture, features and systems behind the product.",
      "We focus on affordable development, flexible customization and scalable software that can evolve as your business grows. From a simple website to a sophisticated management platform, we build with purpose."
    ],
    "cards": [
      [
        "Built Within Your Budget",
        "Cost-effective planning and development from the foundation up."
      ],
      [
        "Architecture That Adapts",
        "Flexible features and customizable software structures."
      ],
      [
        "Engineered For Everyday Use",
        "Powerful systems with simple, intuitive interfaces."
      ]
    ]
  },
  "funny": {
    "lead": "We Make Ideas Work. Not Just Look Good.",
    "p": [
      "One designer. One developer. Two people who think they can turn almost anything into an app. Welcome to DEVOCRAT!",
      "Manoj (Lucky) makes things look awesome. Venkatesh (Venky) makes sure they actually do something. One moves pixels, the other fights bugs. Together, we build websites, applications and feature-packed software without making your budget cry.",
      "Want a custom design? Done. Need a complicated feature? Let's figure it out. Want software that's easy to use? That's the whole point. No unnecessary extras, no one-size-fits-all products and definitely no boring technology."
    ],
    "cards": [
      [
        "Your Wallet Can Relax",
        "Smart, affordable solutions without unnecessary spending."
      ],
      [
        "We Don't Do One-Size-Fits-All",
        "Your business, your design, your customized features."
      ],
      [
        "Easy To Use. Hard To Outgrow.",
        "Friendly interfaces with powerful software underneath."
      ]
    ]
  },
  "kids": {
    "lead": "Little Ideas. Big Digital Adventures.",
    "p": [
      "Every big invention starts with a little imagination. At DEVOCRAT, we believe technology should be exciting, simple to understand and accessible to everyone.",
      "Manoj (Lucky) brings imagination to life through colourful designs and creative experiences. Venkatesh (Venky) turns those designs into interactive websites, applications and powerful software.",
      "We make complicated technology feel simple. Our solutions are customizable, affordable and designed around the people who use them. Because creating something amazing shouldn't have to be difficult or expensive."
    ],
    "cards": [
      [
        "Big Dreams. Smart Budgets.",
        "Affordable digital solutions for ideas of every size."
      ],
      [
        "Made Just For You",
        "Personalize designs, features and experiences."
      ],
      [
        "Easy As Playing",
        "Simple interfaces with powerful features behind the scenes."
      ]
    ]
  },
  "auto": {
    "lead": "Engineered For Performance. Designed For People.",
    "p": [
      "Great technology is like a great machine. Every component needs to work together, performance matters and the experience should feel effortless. That's what drives DEVOCRAT.",
      "Manoj (Lucky) designs the interface, visual experience and creative direction. Venkatesh (Venky) engineers the software, functionality and technical performance.",
      "We build customized digital platforms and feature-rich applications that help businesses operate smarter. With cost-effective development and flexible functionality, we deliver the performance you need without unnecessary overhead."
    ],
    "cards": [
      [
        "Performance Without Overspending",
        "Cost-effective technology with a focus on practical value."
      ],
      [
        "Customized To Your Specifications",
        "Flexible software, workflows and functionality."
      ],
      [
        "Power Under The Hood. Simplicity At The Wheel.",
        "Advanced features with user-friendly experiences."
      ]
    ]
  },
  "future": {
    "lead": "Tomorrow's Technology. Built Around You.",
    "p": [
      "The future of technology isn't just about having more features. It's about making powerful technology accessible, adaptable and effortless to use. At DEVOCRAT, we bring creative vision and smart engineering together to make that possible.",
      "Manoj (Lucky) explores new possibilities in design and digital interaction. Venkatesh (Venky) engineers the applications, software and technology that turn those possibilities into reality.",
      "We create cost-effective, customizable and feature-rich digital solutions that evolve with your ideas. Our mission is to make advanced technology practical for businesses of every size, today and tomorrow."
    ],
    "cards": [
      [
        "Advanced Technology. Accessible Cost.",
        "Powerful digital solutions designed with budget in mind."
      ],
      [
        "Your Future. Your Configuration.",
        "Flexible and customizable platforms that adapt as you grow."
      ],
      [
        "Powerful Intelligence. Effortless Interaction.",
        "Feature-rich software built around user-friendly experiences."
      ]
    ]
  }
};

// Icons for the three About cards, per world.
const HIGHLIGHT_ICONS={
  "modern": [
    "₹︎",
    "⧉︎",
    "◎︎"
  ],
  "elegant": [
    "♛︎",
    "✦︎",
    "❦︎"
  ],
  "hospital": [
    "✚︎",
    "♡︎",
    "⚕︎"
  ],
  "salon": [
    "✂︎",
    "✿︎",
    "✧︎"
  ],
  "illus": [
    "✎︎",
    "✐︎",
    "✪︎"
  ],
  "mandala": [
    "❂︎",
    "✺︎",
    "❁︎"
  ],
  "interior": [
    "⌂︎",
    "▦︎",
    "☘︎"
  ],
  "arch": [
    "⌗︎",
    "⊞︎",
    "△︎"
  ],
  "funny": [
    "💸",
    "🤪",
    "🚀"
  ],
  "kids": [
    "🎈",
    "🧩",
    "🎮"
  ],
  "auto": [
    "⚡︎",
    "⚙︎",
    "◉︎"
  ],
  "future": [
    "⬡︎",
    "⟁︎",
    "◈︎"
  ]
};

// Prototypes shown in the lab. Each id needs a matching file in apps/<id>.html.
const appMeta=[
  {
    "id": "guard",
    "name": "Guard Management App",
    "kind": "Web application",
    "icon": "🛡",
    "desc": "Role-based security operations demo"
  },
  {
    "id": "salon",
    "name": "Lumière Salon",
    "kind": "Booking app",
    "icon": "✂️",
    "desc": "Salon bookings, try-on and memberships"
  },
  {
    "id": "interior",
    "name": "Manoj Interior Studio",
    "kind": "3D design tool",
    "icon": "⌂",
    "desc": "Interactive room and interior design workspace"
  },
  {
    "id": "pica",
    "name": "Pica & Co. Typewriter Studio",
    "kind": "Website",
    "icon": "⌨️",
    "desc": "Editorial website with interactive typewriter"
  }
];

// One-line description of each prototype.
const APP_BLURB={
  "guard": "Role-based security operations, from guards to admin.",
  "salon": "Salon bookings, style try-on and memberships.",
  "interior": "Design and arrange a room interactively in 3D.",
  "pica": "An editorial website with a working interactive typewriter."
};

// Accessible name of each world's scroll-built scene (read by screen readers).
const SCROLL_COPY={
  "modern": {
    "title": "From blank grid to finished space.",
    "steps": [
      "A blank grid appears",
      "Geometric shapes slide into place",
      "Surfaces and lighting refine",
      "A polished modern space"
    ]
  },
  "elegant": {
    "title": "Revealed in stages.",
    "steps": [
      "A fine gold outline",
      "Rich materials",
      "Reflective details",
      "Warm lighting",
      "The grand reveal"
    ]
  },
  "hospital": {
    "title": "Planned around care.",
    "steps": [
      "The floor plan draws itself",
      "Rooms and corridors build",
      "Beds, equipment and wayfinding",
      "A calm, welcoming place"
    ]
  },
  "salon": {
    "title": "Every station, styled.",
    "steps": [
      "A mirror outline appears",
      "Stations, chairs and tools assemble",
      "The lights switch on",
      "Hair sweeps across the scene",
      "The finished salon"
    ]
  },
  "illus": {
    "title": "Drawn to life.",
    "steps": [
      "A pencil line starts the scene",
      "Characters appear stroke by stroke",
      "Colour fills the page",
      "Small details come alive"
    ]
  },
  "mandala": {
    "title": "From one point, a whole world.",
    "steps": [
      "A single point expands into rings",
      "Petals draw outward in symmetry",
      "Colour fills each layer",
      "The mandala breathes and turns"
    ]
  },
  "interior": {
    "title": "A room, by design.",
    "steps": [
      "An empty room in blueprint lines",
      "Walls and flooring form",
      "Furniture moves into place",
      "Materials and light finish it"
    ]
  },
  "arch": {
    "title": "Built floor by floor.",
    "steps": [
      "Site grid and blueprint",
      "The foundation is laid",
      "The structure rises",
      "Facade and landscaping complete it"
    ]
  },
  "funny": {
    "title": "A perfectly serious room…",
    "steps": [
      "A very serious room builds",
      "The chair has other plans",
      "The lamp gives up",
      "Surprise!"
    ]
  },
  "kids": {
    "title": "Once upon a scroll.",
    "steps": [
      "A storybook landscape draws itself",
      "Friends pop in to play",
      "Little adventures unfold",
      "A whole playful world"
    ]
  },
  "auto": {
    "title": "Assembled for speed.",
    "steps": [
      "The chassis assembles",
      "Wheels and engine",
      "Body panels form",
      "Paint, glass and lights",
      "Off it drives"
    ]
  },
  "future": {
    "title": "System online.",
    "steps": [
      "A digital grid powers on",
      "Data lines converge",
      "Components assemble in midair",
      "Lights and interfaces activate",
      "The city opens up"
    ]
  }
};

// Name, nickname, role and phone for the designer (des) and developer (dev).
const TEAM_ROLES={
  "des": [
    "Manoj",
    "aka Lucky",
    "Designer · Creative direction",
    "7418566607"
  ],
  "dev": [
    "Venkatesh Kumar",
    "aka Venky",
    "Developer · Engineering",
    "6383941862"
  ]
};

// Small tags on the photo frames, per world.
const TEAM_TAGS={
  "arch": [
    "A-01 · DESIGN",
    "A-02 · BUILD"
  ],
  "auto": [
    "#01 · DESIGN",
    "#02 · ENGINEERING"
  ],
  "hospital": [
    "DR. DESIGN",
    "DR. CODE"
  ],
  "modern": [
    "Design",
    "Development"
  ],
  "salon": [
    "Style Director",
    "Tech Stylist"
  ],
  "mandala": [
    "रचना · Design",
    "निर्माण · Build"
  ],
  "future": [
    "UNIT-01 // DESIGN",
    "UNIT-02 // CODE"
  ],
  "interior": [
    "The Designer",
    "The Developer"
  ],
  "elegant": [
    "Creative Direction",
    "Engineering"
  ]
};

// Stickers on the photo frames (Kids, Funny, Illustrative).
const TEAM_STICK={
  "kids": [
    "✏️",
    "💻"
  ],
  "funny": [
    "LOL!",
    "WOW!"
  ],
  "illus": [
    "✎",
    "{ }"
  ]
};

// WhatsApp number that receives "Send message" (country code, no +).
const ENQUIRY_WHATSAPP="917418566607";

// Email address that receives "Send by email".
const ENQUIRY_EMAIL="devocrat.tjf@gmail.com";

// Designer / developer photos per world (images/team). Remove a world to hide its photos.
const TEAM_PHOTOS={
  "arch": {
    "des": "images/team/arch-des.webp",
    "dev": "images/team/arch-dev.webp"
  },
  "auto": {
    "des": "images/team/auto-des.webp",
    "dev": "images/team/auto-dev.webp"
  },
  "elegant": {
    "des": "images/team/elegant-des.webp",
    "dev": "images/team/elegant-dev.webp"
  },
  "funny": {
    "des": "images/team/funny-des.webp",
    "dev": "images/team/funny-dev.webp"
  },
  "future": {
    "des": "images/team/future-des.webp",
    "dev": "images/team/future-dev.webp"
  },
  "hospital": {
    "des": "images/team/hospital-des.webp",
    "dev": "images/team/hospital-dev.webp"
  },
  "illus": {
    "des": "images/team/illus-des.webp",
    "dev": "images/team/illus-dev.webp"
  },
  "interior": {
    "des": "images/team/interior-des.webp",
    "dev": "images/team/interior-dev.webp"
  },
  "kids": {
    "des": "images/team/kids-des.webp",
    "dev": "images/team/kids-dev.webp"
  },
  "mandala": {
    "des": "images/team/mandala-des.webp",
    "dev": "images/team/mandala-dev.webp"
  },
  "modern": {
    "des": "images/team/modern-des.webp",
    "dev": "images/team/modern-dev.webp"
  },
  "salon": {
    "des": "images/team/salon-des.webp",
    "dev": "images/team/salon-dev.webp"
  }
};

// Planet surface images (2:1 equirectangular) per world (images/planets).
const PLANET_IMAGES={
  "arch": "images/planets/arch.webp",
  "auto": "images/planets/auto.webp",
  "elegant": "images/planets/elegant.webp",
  "funny": "images/planets/funny.webp",
  "future": "images/planets/future.webp",
  "hospital": "images/planets/hospital.webp",
  "illus": "images/planets/illus.webp",
  "interior": "images/planets/interior.webp",
  "kids": "images/planets/kids.webp",
  "mandala": "images/planets/mandala.webp",
  "modern": "images/planets/modern.webp",
  "salon": "images/planets/salon.webp"
};
