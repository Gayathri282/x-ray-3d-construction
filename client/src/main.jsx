import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import "./style.css";

const API = "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

async function api(path, opt = {}) {
  const h = { ...(opt.headers || {}) };
  if (!(opt.body instanceof FormData)) h["Content-Type"] = "application/json";
  if (getToken()) h.Authorization = `Bearer ${getToken()}`;
  const r = await fetch(API + path, { ...opt, headers: h });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(d.message || "Request failed");
  return d;
}

// Medical Brand Logo Component
function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick} title="VetPulse — Medical Tele-Veterinary Care">
      <div className="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          <path d="M12 6.5a2.5 2.5 0 0 1 4.5 1.5c0 2.5-4.5 5.5-4.5 5.5S7.5 10.5 7.5 8A2.5 2.5 0 0 1 12 6.5z" />
        </svg>
      </div>
      <div className="logo-text">
        <b>VetPulse</b>
        <span>Clinical Tele-Care</span>
      </div>
    </div>
  );
}

// SVG Icons Collection
const Icons = {
  Video: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Rx: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  AI: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  Guide: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Records: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  History: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Star: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
};

// High Resolution Condition Articles Data
const ARTICLES_DATA = [
  {
    id: "ear-infection",
    title: "Otitis Externa (Ear Inflammation & Infection)",
    category: "Ears & Eyes",
    catClass: "cat-ears",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    meaning: "Otitis Externa is an acute or chronic inflammation of the outer ear canal causing intense discomfort, odor, and swelling.",
    symptoms: ["Head shaking & ear scratching", "Dark brown or yellow discharge", "Foul odor coming from ears", "Redness and heat sensitivity"],
    whatToDo: [
      "Avoid inserting cotton swabs deep into ear canals.",
      "Gently wipe outer ear flaps with a vet-approved cleaning wipe.",
      "Schedule a video consult for microscopic diagnosis and targeted medicated drops."
    ],
    urgency: "Moderate — Needs prompt medical treatment to prevent eardrum damage."
  },
  {
    id: "gastro-upset",
    title: "Gastroenteritis (Vomiting & Upset Stomach)",
    category: "Digestive",
    catClass: "cat-digestive",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    meaning: "Inflammation of stomach and intestines, usually triggered by sudden food changes, dietary indiscretion, parasites, or viral infections.",
    symptoms: ["Repeated vomiting or retching", "Watery or loose stool", "Loss of appetite and lethargy", "Abdominal discomfort & gurgling"],
    whatToDo: [
      "Offer small amounts of fresh water continuously to prevent dehydration.",
      "Fast from solid food for 6–8 hours, then introduce a bland diet (boiled chicken & white rice).",
      "Consult a doctor immediately if blood is present or symptoms exceed 24 hours."
    ],
    urgency: "High if persistent or accompanied by severe lethargy."
  },
  {
    id: "skin-dermatitis",
    title: "Allergic Dermatitis & Skin Rash",
    category: "Skin & Coat",
    catClass: "cat-skin",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
    meaning: "Hypersensitivity reaction caused by environmental allergens (pollen, dust mites), flea bites, or specific food ingredients.",
    symptoms: ["Obsessive licking, biting, or scratching", "Red, inflamed skin patches or hot spots", "Hair loss or flaky coat", "Secondary skin infections"],
    whatToDo: [
      "Maintain strict flea and tick preventive treatments year-round.",
      "Bathe with a mild hypoallergenic oat-based pet shampoo.",
      "Get a prescription for anti-itch therapy or hypoallergenic diet mapping."
    ],
    urgency: "Routine to Moderate — Causes significant distress if untreated."
  },
  {
    id: "dental-disease",
    title: "Periodontal Disease & Dental Tartar",
    category: "Dental & Mobility",
    catClass: "cat-dental",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    meaning: "Plaque accumulation hardens into tartar, leading to gingivitis, tooth loss, and bacterial infection beneath the gumline.",
    symptoms: ["Severe bad breath (halitosis)", "Yellow-brown tartar buildup on teeth", "Bleeding or inflamed gums", "Difficulty chewing food"],
    whatToDo: [
      "Incorporate daily teeth brushing with animal-safe enzymatic toothpaste.",
      "Provide veterinary-approved dental chews.",
      "Schedule routine professional dental scaling."
    ],
    urgency: "Routine — Progressive condition requiring routine maintenance."
  },
  {
    id: "heatstroke-dehydration",
    title: "Dehydration & Heat Stress Emergency",
    category: "Urgent Care",
    catClass: "cat-urgent",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=800&q=80",
    meaning: "Heat stress occurs when body temperature rises dangerously high due to hot climate exposure or overexertion, causing acute organ distress.",
    symptoms: ["Excessive heavy panting & drooling", "Bright red or pale gums", "Weakness, dizziness, or collapse", "Dry, non-elastic skin coat"],
    whatToDo: [
      "Move to a cool, shaded air-conditioned area immediately.",
      "Apply cool (NOT ice-cold) water to paws, chest, and ear flaps.",
      "Offer small sips of cool water and seek emergency vet care."
    ],
    urgency: "CRITICAL EMERGENCY — Act immediately!"
  }
];

// Production Clinical Hero Banner Component
function HeroBanner({ onBookNow, onAskAI }) {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <h1>Expert Veterinary Care,<br />Right From Your Home.</h1>
        <p>
          Book 1-on-1 video consultations with top certified veterinarians, receive digital prescriptions in chat, and get 24/7 AI health guidance for your animals.
        </p>
        
        <div className="hero-actions">
          <button style={{ padding: "14px 28px", fontSize: "14px" }} onClick={onBookNow}>
            <Icons.Calendar /> Book a Consultation
          </button>
          <button className="button-indigo" style={{ padding: "14px 24px", fontSize: "14px" }} onClick={onAskAI}>
            <Icons.AI /> Ask AI Health Assistant
          </button>
        </div>

        <div className="hero-stats-row">
          <div className="stat-card">
            <b>4.9 / 5</b>
            <span>Satisfaction</span>
          </div>
          <div className="stat-card">
            <b>50+</b>
            <span>Certified Vets</span>
          </div>
          <div className="stat-card">
            <b>15 Min</b>
            <span>Fast Slots</span>
          </div>
          <div className="stat-card">
            <b>100%</b>
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      <div className="hero-widget-card">
        <img
          src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80"
          alt="Veterinary Tele-Health Care"
        />
        <h3 style={{ margin: "0 0 6px", fontSize: "20px" }}>Trusted Tele-Veterinary Care</h3>
        <p style={{ fontSize: "14px", margin: "0 0 20px" }}>
          Instant HD video calls, digital Rx prescriptions, and secure lab report management.
        </p>
        <button style={{ width: "100%" }} onClick={onBookNow}>
          Find Available Specialists
        </button>
      </div>
    </div>
  );
}

// Production Core Services Grid with Subtle Medical Icon Boxes
function ServicesSection({ onServiceClick }) {
  const services = [
    {
      icon: <Icons.Video />,
      theme: "theme-teal",
      title: "WebRTC Video Consultations",
      desc: "Connect face-to-face with licensed veterinarians over secure HD video calls from home."
    },
    {
      icon: <Icons.Rx />,
      theme: "theme-coral",
      title: "Digital Prescriptions (Rx)",
      desc: "Receive official digital prescriptions with clear medication dosages and care instructions in chat."
    },
    {
      icon: <Icons.AI />,
      theme: "theme-indigo",
      title: "24/7 AI Pet Assistant",
      desc: "Get immediate AI guidance on symptoms, toxic food alerts, vaccine schedules, and emergency flags."
    },
    {
      icon: <Icons.Guide />,
      theme: "theme-amber",
      title: "Common Health Guides",
      desc: "Explore detailed articles on ear infections, digestive distress, skin allergies, dental care, and heatstroke."
    },
    {
      icon: <Icons.Records />,
      theme: "theme-purple",
      title: "Digital Medical Records",
      desc: "Securely upload and manage pet lab reports, blood work, vaccination logs, and medical history."
    },
    {
      icon: <Icons.History />,
      theme: "theme-sage",
      title: "Consultation History",
      desc: "Access your past doctor notes, prescription downloads, and easily schedule follow-up appointments."
    }
  ];

  return (
    <div className="services-section">
      <div className="section-header">
        <div>
          <h2>Comprehensive Veterinary Services</h2>
          <p>Everything you need to keep your pets healthy, happy, and thriving.</p>
        </div>
      </div>

      <div className="services-grid">
        {services.map((s, i) => (
          <div className="service-card" key={i} onClick={() => onServiceClick(s.title)}>
            <div className={`service-icon-wrapper ${s.theme}`}>{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <span style={{ color: "var(--brand-primary-dark)", fontWeight: "700", fontSize: "13px" }}>
              Explore Service →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Subtle Clinical CTA Banner
function CTABanner({ onConnect }) {
  return (
    <div className="cta-banner">
      <div className="cta-content">
        <h2>Want to consult a veterinary doctor now?</h2>
        <p>Book an instant 1-on-1 video consultation, share health reports, and receive official prescriptions online.</p>
      </div>
      <button
        style={{ background: "#ffffff", color: "var(--brand-navy)", padding: "14px 28px", fontSize: "15px", whiteSpace: "nowrap" }}
        onClick={onConnect}
      >
        Connect Now
      </button>
    </div>
  );
}

// Articles & News Section
function ArticlesSection({ onSelectDoctor }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ["All", "Ears & Eyes", "Digestive", "Skin & Coat", "Dental & Mobility", "Urgent Care"];

  const filtered = ARTICLES_DATA.filter(a => {
    const matchCat = filter === "All" || a.category === filter;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.meaning.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="articles-section" id="articles-section">
      <div className="section-header">
        <div>
          <h2>Common Animal Health Conditions</h2>
          <p>Learn what symptoms mean, home care steps, and when to consult a veterinarian.</p>
        </div>
        <input
          type="text"
          placeholder="Search conditions (e.g., ear, vomiting, rash)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "270px" }}
        />
      </div>

      <div className="articles-filter-bar">
        {categories.map(c => (
          <button key={c} className={filter === c ? "active" : ""} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="articles-grid">
        {filtered.map(art => (
          <div className="article-card" key={art.id}>
            <img src={art.image} alt={art.title} className="article-image" />
            <div className="article-body">
              <span className={`article-category ${art.catClass}`}>{art.category}</span>
              <h3>{art.title}</h3>
              
              <div className="article-snippet">
                <b>What does this mean?</b>
                <p style={{ margin: 0 }}>{art.meaning.substring(0, 95)}...</p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", gap: "10px" }}>
                <button style={{ flex: 1 }} onClick={() => setSelectedArticle(art)}>Read Care Guide</button>
                <button className="button-outline" onClick={() => onSelectDoctor?.()}>Ask Vet</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <div className="modal" onClick={() => setSelectedArticle(null)}>
          <div className="article-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className={`article-category ${selectedArticle.catClass}`}>{selectedArticle.category}</span>
              <button className="ghost" onClick={() => setSelectedArticle(null)}>✕ Close</button>
            </div>
            
            <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>{selectedArticle.title}</h2>
            <img src={selectedArticle.image} alt={selectedArticle.title} style={{ width: "100%", height: "240px", objectFit: "cover", borderRadius: "16px", marginBottom: "20px" }} />

            <div style={{ background: "#f0fdfa", padding: "16px 20px", borderRadius: "14px", marginBottom: "20px", border: "1px solid #ccfbf1" }}>
              <h4 style={{ margin: "0 0 6px", color: "var(--brand-primary-dark)" }}>What Does This Mean?</h4>
              <p style={{ margin: 0 }}>{selectedArticle.meaning}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 10px" }}>Key Symptoms To Watch For</h4>
              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                {selectedArticle.symptoms.map((s, i) => <li key={i} style={{ marginBottom: "6px" }}>{s}</li>)}
              </ul>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 10px" }}>What To Do (Action Plan)</h4>
              <ol style={{ paddingLeft: "20px", margin: 0 }}>
                {selectedArticle.whatToDo.map((step, i) => <li key={i} style={{ marginBottom: "8px" }}>{step}</li>)}
              </ol>
            </div>

            <div style={{ background: "var(--med-rose-light)", border: "1px solid var(--med-rose-border)", padding: "14px", borderRadius: "12px", marginBottom: "24px", color: "var(--med-rose)", fontSize: "14px" }}>
              <b>Urgency & Warning:</b> {selectedArticle.urgency}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button style={{ flex: 1 }} onClick={() => { setSelectedArticle(null); onSelectDoctor?.(); }}>
                Connect With Veterinary Doctor Now
              </button>
              <button className="button-outline" onClick={() => setSelectedArticle(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Doctors Section
function DoctorsSection({ doctors, slots, onBookSlot }) {
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docTab, setDocTab] = useState("slots");

  const activeDoc = doctors.find(d => d._id === selectedDocId) || doctors[0];
  const docSlots = slots.filter(s => !selectedDocId || String(s.doctorId) === String(activeDoc?._id));

  return (
    <div className="doctors-section" id="doctors-section">
      <div className="section-header">
        <div>
          <h2>Our Certified Veterinary Doctors</h2>
          <p>Select a specialist below to view availability and book a video consultation.</p>
        </div>
      </div>

      <div className="doctors-grid">
        {doctors.map(doc => (
          <div
            className="doctor-card"
            key={doc._id}
            style={{ border: activeDoc?._id === doc._id ? "2px solid var(--brand-primary)" : "1px solid var(--border-subtle)" }}
          >
            <div className="doctor-profile-top">
              <img src={doc.avatar || "/vet_doctor_female.png"} alt={doc.name} className="doctor-avatar" />
              <div className="doctor-meta">
                <h3>{doc.name}</h3>
                <div className="doctor-specialty">{doc.specialty || "Veterinary Specialist"}</div>
                <div className="doctor-rating">
                  <Icons.Star /> {doc.rating || 4.9} ({doc.reviewsCount || 120}+ reviews) · {doc.experienceYears || 10}+ yrs exp
                </div>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
              {doc.bio || "Expert in veterinary general medicine, dermatology, and preventive health care."}
            </p>

            <div className="doctor-prices">
              <div className="price-pill">30 min · ₹500</div>
              <div className="price-pill">45 min · ₹750</div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button
                className={activeDoc?._id === doc._id && docTab === "slots" ? "" : "button-outline"}
                style={{ flex: 1, padding: "9px", fontSize: "12px" }}
                onClick={() => { setSelectedDocId(doc._id); setDocTab("slots"); }}
              >
                Available Slots
              </button>
              <button
                className={activeDoc?._id === doc._id && docTab === "overview" ? "" : "button-outline"}
                style={{ flex: 1, padding: "9px", fontSize: "12px" }}
                onClick={() => { setSelectedDocId(doc._id); setDocTab("overview"); }}
              >
                Profile & Bio
              </button>
            </div>

            {activeDoc?._id === doc._id && docTab === "slots" && (
              <div>
                <b style={{ fontSize: "13px", color: "var(--brand-primary-dark)", display: "block", marginBottom: "8px" }}>Select Date & Time Slot:</b>
                <div className="slots-grid">
                  {docSlots.map((s, i) => (
                    <button key={i} className="slot-btn" onClick={() => onBookSlot(doc, s)}>
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][s.dayOfWeek]} · {s.start} ({s.duration}m)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeDoc?._id === doc._id && docTab === "overview" && (
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", fontSize: "13px" }}>
                <b>Qualifications:</b> BVSc & AH, MVSc (Veterinary Medicine). Certified Tele-Vet Specialist.<br />
                <b>Languages Spoken:</b> English, Hindi.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Patient Appointments Portal Component
function MyAppointmentsSection({ apps, onOpenConsultation }) {
  return (
    <div className="appointments-card" id="my-appointments">
      <div className="section-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2>My Scheduled Consultations</h2>
          <p>View active video appointments, status, and consultation room access.</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No booked consultations yet. Select a veterinarian above to schedule.</p>
      ) : (
        apps.map(a => (
          <div className="appointment-item" key={a._id}>
            <div>
              <b>{new Date(a.startAt).toLocaleString()}</b>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                With {a.doctorId?.name || "Veterinarian"}
              </div>
            </div>
            <span>{a.duration} min · ₹{a.price}</span>
            <span className={`pill ${a.status}`}>{a.status}</span>
            <button onClick={() => onOpenConsultation(a)}>
              {a.paymentStatus === "paid" ? "Open Consultation Room" : "Payment Required"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// AI Chatbot Drawer Component
function AIChatDrawer({ isOpen, onClose, onConnectDoctor }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your VetPulse AI Health Assistant. Ask me any question about pet health, symptoms, diet, or vaccine guidance!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickQuestions = ["Upset Stomach / Vomiting", "Ear Scratching & Smell", "Skin Rash & Itching", "Diet & Toxic Foods", "Vaccine Schedule"];

  const handleSend = async (qText) => {
    const text = qText || input;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    if (!qText) setInput("");
    setLoading(true);

    try {
      const res = await api("/api/ai-chat", { method: "POST", body: JSON.stringify({ question: text }) });
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: res.answer,
          category: res.category,
          recommendedAction: res.recommendedAction
        }
      ]);
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I had trouble processing that request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-drawer">
      <div className="ai-header">
        <h3>VetPulse AI Health Assistant</h3>
        <button className="ghost" style={{ color: "#fff" }} onClick={onClose}>✕</button>
      </div>

      <div className="ai-body">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.sender}`}>
            {m.category && <span style={{ fontSize: "11px", fontWeight: "700", opacity: 0.8, display: "block", marginBottom: "4px" }}>[{m.category}]</span>}
            <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
            {m.recommendedAction && (
              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #ccfbf1" }}>
                <button
                  style={{ width: "100%", padding: "8px", fontSize: "12px", background: "var(--brand-primary-dark)" }}
                  onClick={() => { onClose(); onConnectDoctor?.(); }}
                >
                  Connect With Licensed Vet Doctor
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="ai-msg bot">Checking medical guidelines...</div>}
      </div>

      <div className="ai-quick-chips">
        {quickQuestions.map((q, i) => (
          <button key={i} className="chip-btn" onClick={() => handleSend(q)}>{q}</button>
        ))}
      </div>

      <div className="ai-input-area">
        <input
          placeholder="Ask general animal health question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button onClick={() => handleSend()}>Ask</button>
      </div>
    </div>
  );
}

// Authentication Component
function Login({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [f, setF] = useState({
    name: "Demo Pet Parent",
    email: "patient@vetpulse.demo",
    password: "patient123",
    petName: "Milo",
    petType: "Dog"
  });
  const [err, setErr] = useState("");

  const submit = async (e, customPayload) => {
    if (e) e.preventDefault();
    const payload = customPayload || f;
    try {
      const d = await api(register ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localStorage.setItem("token", d.token);
      onLogin(d.user);
    } catch (x) {
      setErr(x.message);
    }
  };

  const quickLogin = (email, password) => {
    setF(prev => ({ ...prev, email, password }));
    submit(null, { email, password });
  };

  return (
    <div className="auth" style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f0fdfa", padding: "20px 0" }}>
      <div className="card authbox" style={{ width: "min(460px, 94vw)", padding: "36px", borderRadius: "24px", background: "#fff", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: "24px", margin: "0 0 8px", textAlign: "center" }}>
          {register ? "Create Pet Parent Account" : "Welcome to VetPulse"}
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "0 0 24px", textAlign: "center" }}>
          Clinical tele-veterinary consultation platform.
        </p>

        {register && (
          <div style={{ display: "grid", gap: "12px", marginBottom: "12px" }}>
            <input placeholder="Your Full Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
            <input placeholder="Pet Name" value={f.petName} onChange={e => setF({ ...f, petName: e.target.value })} />
          </div>
        )}
        <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
          <input placeholder="Email Address" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
          <input type="password" placeholder="Password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
        </div>
        
        {err && <div style={{ color: "#a33", background: "#fff0ef", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }}>{err}</div>}
        
        <button onClick={submit} style={{ width: "100%", padding: "13px", fontSize: "15px" }}>
          {register ? "Create Account" : "Sign In to Portal"}
        </button>
        
        <button className="link" style={{ width: "100%", marginTop: "12px" }} onClick={() => setRegister(!register)}>
          {register ? "Already have an account? Sign in" : "Create a new account"}
        </button>

        <div className="demo-credentials-box">
          <b style={{ fontSize: "13px", color: "var(--brand-primary-dark)", display: "block" }}>⚡ Click any Demo Profile for 1-Click Login:</b>
          <div className="demo-login-grid">
            <button className="demo-login-btn" type="button" onClick={() => quickLogin("doctor@vetpulse.demo", "doctor123")}>
              <span>🩺 <b>Doctor 1:</b> Dr. Ananya Nair (Dermatology)</span>
              <span style={{ fontSize: "11px", color: "var(--brand-blue)" }}>Sign in →</span>
            </button>

            <button className="demo-login-btn" type="button" onClick={() => quickLogin("vikram@vetpulse.demo", "doctor123")}>
              <span>🩺 <b>Doctor 2:</b> Dr. Vikram Rao (Surgeon)</span>
              <span style={{ fontSize: "11px", color: "var(--brand-blue)" }}>Sign in →</span>
            </button>

            <button className="demo-login-btn" type="button" onClick={() => quickLogin("sophia@vetpulse.demo", "doctor123")}>
              <span>🩺 <b>Doctor 3:</b> Dr. Sophia Chen (Exotic Pets)</span>
              <span style={{ fontSize: "11px", color: "var(--brand-blue)" }}>Sign in →</span>
            </button>

            <button className="demo-login-btn" type="button" onClick={() => quickLogin("admin@vetpulse.demo", "admin123")}>
              <span>👑 <b>Admin:</b> System Administrator</span>
              <span style={{ fontSize: "11px", color: "#dc2626" }}>Sign in →</span>
            </button>

            <button className="demo-login-btn" type="button" onClick={() => quickLogin("patient@vetpulse.demo", "patient123")}>
              <span>🐾 <b>Patient:</b> Demo Pet Parent (Milo)</span>
              <span style={{ fontSize: "11px", color: "var(--brand-green)" }}>Sign in →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Patient View Portal Component
function Patient({ user, onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [apps, setApps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api("/api/doctors"),
      api("/api/availability"),
      api("/api/appointments")
    ]).then(([docs, s, a]) => {
      setDoctors(docs);
      setSlots(s);
      setApps(a);
    }).catch(err => console.error(err));
  }, []);

  const bookSlot = async (doc, s) => {
    try {
      const day = new Date();
      day.setDate(day.getDate() + ((s.dayOfWeek - day.getDay() + 7) % 7 || 7));
      const [h, m] = s.start.split(":");
      day.setHours(h, m, 0, 0);

      const a = await api("/api/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          doctorId: doc._id,
          startAt: day,
          duration: s.duration,
          price: s.price
        })
      });
      setApps([a, ...apps]);
      alert(`Demo payment successful! Appointment booked with ${doc.name}.`);
    } catch (e) {
      alert(e.message);
    }
  };

  const scrollToSection = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header>
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <div className="nav-links">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</button>
          <button onClick={() => scrollToSection("doctors-section")}>Find Vets</button>
          <button onClick={() => scrollToSection("articles-section")}>Health Guides</button>
          <button onClick={() => scrollToSection("my-appointments")}>My Consultations</button>
          <button onClick={() => setAiOpen(true)}>💬 AI Assistant</button>
        </div>
        <div className="header-right">
          <div className="user-badge">
            <span>🐾</span> {user.name} ({user.petName || "Pet"})
          </div>
          <button className="ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main>
        {/* Subtle Clinical Hero Banner */}
        <HeroBanner
          onBookNow={() => scrollToSection("doctors-section")}
          onAskAI={() => setAiOpen(true)}
        />

        {/* Services Overview Grid */}
        <ServicesSection onServiceClick={title => {
          if (title.includes("Video") || title.includes("History")) scrollToSection("doctors-section");
          else if (title.includes("AI")) setAiOpen(true);
          else scrollToSection("articles-section");
        }} />

        {/* Common Health Conditions & Symptom Guides */}
        <ArticlesSection onSelectDoctor={() => scrollToSection("doctors-section")} />

        {/* Subtle CTA Banner */}
        <CTABanner onConnect={() => scrollToSection("doctors-section")} />

        {/* Doctor Profiles & Availability Booking */}
        <DoctorsSection doctors={doctors} slots={slots} onBookSlot={bookSlot} />

        {/* My Consultations Appointments Portal */}
        <MyAppointmentsSection
          apps={apps}
          onOpenConsultation={ap => { setSelected(ap); setChat(true); }}
        />
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{ marginTop: "14px" }}>
              VetPulse provides 1-on-1 video consultations, digital prescriptions, and 24/7 AI assistance for pets and domestic animals.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="#doctors-section">Find Veterinarians</a>
            <a href="#articles-section">Health & Symptom Guides</a>
            <a href="#my-appointments">My Appointments</a>
          </div>
          <div>
            <h4>Services</h4>
            <a href="#doctors-section">WebRTC Video Consult</a>
            <a href="#doctors-section">Digital Prescriptions</a>
            <a href="#articles-section">Lab Report Storage</a>
          </div>
          <div>
            <h4>Emergency Contact</h4>
            <p>For urgent life-threatening emergencies, visit your nearest emergency veterinary hospital immediately.</p>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} VetPulse Healthcare Technologies Inc. All rights reserved.
        </div>
      </footer>

      {/* Floating AI Pet Assistant Drawer */}
      <button className="ai-fab" onClick={() => setAiOpen(!aiOpen)}>
        <Icons.AI /> VetPulse AI
      </button>

      <AIChatDrawer
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onConnectDoctor={() => scrollToSection("doctors-section")}
      />

      {/* WebRTC Video Call & Consultation Modal */}
      {selected && chat && (
        <Consultation app={selected} user={user} onClose={() => setChat(false)} />
      )}
    </>
  );
}

// Doctor View Portal Component
function Doctor({ user, onLogout }) {
  const [apps, setApps] = useState([]);
  const [active, setActive] = useState(null);
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(500);

  useEffect(() => {
    api("/api/appointments").then(setApps);
  }, []);

  return (
    <>
      <header>
        <Logo />
        <div className="header-right">
          <div className="user-badge"><b>Doctor Portal:</b> {user.name}</div>
          <button className="ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>
      <main>
        <div style={{ background: "#fff", border: "1.5px solid var(--border-subtle)", borderRadius: "20px", padding: "32px", marginBottom: "28px", boxShadow: "var(--shadow-sm)" }}>
          <h1>{user.name} — Practice Portal</h1>
          <p>Manage appointments, video consultations, prescriptions, and patient records.</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
            <select value={duration} onChange={e => setDuration(+e.target.value)} style={{ width: "200px" }}>
              <option value="30">30 minutes slot</option>
              <option value="45">45 minutes slot</option>
            </select>
            <input type="number" value={price} onChange={e => setPrice(+e.target.value)} placeholder="Price (₹)" style={{ width: "150px" }} />
            <button onClick={async () => {
              await api("/api/availability", {
                method: "POST",
                body: JSON.stringify({ dayOfWeek: 1, start: "10:00", end: "18:00", duration, price })
              });
              alert("New Monday slot template added.");
            }}>
              Add Slot Template
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid var(--border-subtle)", borderRadius: "20px", padding: "32px", boxShadow: "var(--shadow-sm)" }}>
          <h2>Scheduled Patient Consultations</h2>
          {apps.length === 0 ? <p>No scheduled patient appointments yet.</p> : apps.map(a => (
            <div className="appointment-item" key={a._id}>
              <div>
                <b>{new Date(a.startAt).toLocaleString()}</b>
                <div style={{ fontSize: "13px" }}>Patient: {a.patientId?.name} ({a.patientId?.petName || "Pet"})</div>
              </div>
              <span>{a.duration} min · ₹{a.price}</span>
              <span className={`pill ${a.status}`}>{a.status}</span>
              <button onClick={() => setActive(a)}>Open Consultation Room</button>
            </div>
          ))}
        </div>
      </main>

      {active && (
        <Consultation
          app={active}
          user={user}
          doctorMode
          onClose={() => { setActive(null); api("/api/appointments").then(setApps); }}
        />
      )}
    </>
  );
}

// WebRTC Consultation Modal Component
function Consultation({ app, user, doctorMode, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [docs, setDocs] = useState([]);
  const [med, setMed] = useState({ name: "", dose: "", frequency: "", duration: "", instructions: "" });
  const [advice, setAdvice] = useState("");
  const [peer, setPeer] = useState(false);
  const [timer, setTimer] = useState(1104);

  const socket = useRef(null);
  const local = useRef(null);
  const remote = useRef(null);
  const pc = useRef(null);

  useEffect(() => {
    const tInterval = setInterval(() => setTimer(x => x + 1), 1000);
    api(`/api/appointments/${app._id}/messages`).then(setMessages);
    api(`/api/appointments/${app._id}/documents`).then(setDocs);

    socket.current = io(API, { auth: { token: getToken() } });
    socket.current.emit("join-appointment", { appointmentId: app._id });
    socket.current.on("new-message", m => setMessages(x => [...x, m]));
    socket.current.on("document-added", d => setDocs(x => [d, ...x]));

    socket.current.on("webrtc-signal", async ({ data }) => {
      if (data.offer) {
        await ensurePC();
        await pc.current.setRemoteDescription(data.offer);
        const ans = await pc.current.createAnswer();
        await pc.current.setLocalDescription(ans);
        socket.current.emit("webrtc-signal", { appointmentId: app._id, data: { answer: pc.current.localDescription } });
      } else if (data.answer) {
        await pc.current.setRemoteDescription(data.answer);
      } else if (data.candidate) {
        try { await pc.current.addIceCandidate(data.candidate); } catch {}
      }
    });

    socket.current.on("peer-presence", x => setPeer(x.present));

    return () => {
      clearInterval(tInterval);
      socket.current?.disconnect();
    };
  }, []);

  const ensurePC = async () => {
    if (pc.current) return;
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.current.onicecandidate = e => e.candidate && socket.current.emit("webrtc-signal", { appointmentId: app._id, data: { candidate: e.candidate } });
    pc.current.ontrack = e => { if (remote.current) remote.current.srcObject = e.streams[0]; };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (local.current) local.current.srcObject = stream;
      stream.getTracks().forEach(t => pc.current.addTrack(t, stream));
    } catch {
      console.log("WebRTC demo mode.");
    }
  };

  const call = async () => {
    await ensurePC();
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    socket.current.emit("presence", { appointmentId: app._id, present: true });
    socket.current.emit("webrtc-signal", { appointmentId: app._id, data: { offer: pc.current.localDescription } });
  };

  const send = () => {
    if (text.trim()) {
      socket.current.emit("chat-message", { appointmentId: app._id, text });
      setText("");
    }
  };

  const sendPrescription = async () => {
    await api(`/api/appointments/${app._id}/prescription`, {
      method: "POST",
      body: JSON.stringify({ medicines: [med], advice })
    });
    setMed({ name: "", dose: "", frequency: "", duration: "", instructions: "" });
    setAdvice("");
    alert("Prescription generated & sent to chat!");
  };

  const complete = async ok => {
    await api(`/api/appointments/${app._id}/complete`, {
      method: "POST",
      body: JSON.stringify({ completed: ok })
    });
    alert(ok ? "Appointment completed." : "Appointment marked uncompleted.");
  };

  const formatTimer = sec => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `00:${m}:${s}`;
  };

  return (
    <div className="modal">
      <div className="consult">
        <div className="video">
          <div className="videohead">
            <b>{doctorMode ? `Patient Consultation` : `Consultation with ${app.doctorId?.name || 'Doctor'}`}</b>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span className="timer-badge">⏱ {formatTimer(timer)}</span>
              <span style={{ fontSize: "13px" }}>{peer ? "🟢 Connected" : "🟡 Waiting for participant"}</span>
            </div>
          </div>

          <video ref={remote} autoPlay playsInline className="remote" poster="/vet_doctor_female.png" />
          <video ref={local} autoPlay muted playsInline className="local" />

          <div className="controls">
            <button onClick={call}>Start / Join Video Call</button>
            <button className="ghost" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>Mute</button>
            <button className="ghost" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>Camera</button>
            <button className="danger" onClick={onClose}>End Call</button>
          </div>
        </div>

        <aside>
          <div className="tabs">
            <b>Consultation Chat</b>
            {doctorMode && <b>Prescription Rx</b>}
          </div>

          <div className="chatlog">
            {messages.map(m => (
              <div className={m.senderId?._id === user.id ? "mine" : "theirs"} key={m._id}>
                <b>{m.senderId?.name}</b>
                <p>{m.text}</p>
                {m.prescriptionId && (
                  <div style={{ background: "#fff7dc", border: "1px solid #ecd889", borderRadius: "10px", padding: "10px", marginTop: "8px" }}>
                    <b>Rx Prescription</b>
                    {m.prescriptionId.medicines?.map((x, i) => (
                      <div key={i} style={{ margin: "4px 0", fontSize: "13px" }}>
                        <strong>{x.name}</strong> — {x.dose}, {x.frequency}, {x.duration}
                      </div>
                    ))}
                    <p style={{ margin: "6px 0 0", fontStyle: "italic", fontSize: "13px" }}>{m.prescriptionId.advice}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {doctorMode ? (
            <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <b>Write Digital Prescription (Rx)</b>
              <input placeholder="Medicine name (e.g. Amoxicillin 250mg)" value={med.name} onChange={e => setMed({ ...med, name: e.target.value })} />
              <input placeholder="Dose (e.g. 1 tablet)" value={med.dose} onChange={e => setMed({ ...med, dose: e.target.value })} />
              <input placeholder="Frequency (e.g. twice daily)" value={med.frequency} onChange={e => setMed({ ...med, frequency: e.target.value })} />
              <input placeholder="Duration (e.g. 7 days)" value={med.duration} onChange={e => setMed({ ...med, duration: e.target.value })} />
              <textarea placeholder="Advice & Care Instructions" value={advice} onChange={e => setAdvice(e.target.value)} />
              <button onClick={sendPrescription}>Send Prescription to Chat</button>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button style={{ flex: 1 }} onClick={() => complete(true)}>Mark Completed</button>
                <button className="ghost" style={{ flex: 1 }} onClick={() => complete(false)}>Mark Uncompleted</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
                <label style={{ display: "block" }}>
                  <b style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>Upload Pet Reports & Documents</b>
                  <input type="file" onChange={async e => {
                    if (e.target.files[0]) {
                      const f = new FormData();
                      f.append("file", e.target.files[0]);
                      const d = await api(`/api/appointments/${app._id}/documents`, { method: "POST", body: f });
                      setDocs(x => [d, ...x]);
                    }
                  }} />
                </label>
                {docs.map(d => <div key={d._id} style={{ fontSize: "12px", marginTop: "4px" }}>📄 {d.originalName}</div>)}
              </div>

              <div className="composer">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Message doctor..."
                />
                <button onClick={send}>Send</button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

// Admin Control Portal Component
function Admin({ user, onLogout }) {
  const [stats, setStats] = useState({ doctorsCount: 0, patientsCount: 0, appointmentsCount: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tab, setTab] = useState("overview");

  const [newDoc, setNewDoc] = useState({
    name: "",
    email: "",
    password: "doctor123",
    specialty: "Veterinary Specialist · General Care",
    bio: "Licensed tele-veterinarian providing expert care for pets.",
    experienceYears: 5,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const refreshData = () => {
    api("/api/admin/stats").then(setStats).catch(console.error);
    api("/api/admin/users").then(setUsers).catch(console.error);
    api("/api/admin/appointments").then(setApps).catch(console.error);
    api("/api/doctors").then(setDoctors).catch(console.error);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api("/api/admin/doctors/create", {
        method: "POST",
        body: JSON.stringify(newDoc)
      });
      setMsg(`Doctor profile for ${newDoc.name} created successfully!`);
      setNewDoc({
        name: "",
        email: "",
        password: "doctor123",
        specialty: "Veterinary Specialist · General Care",
        bio: "Licensed tele-veterinarian providing expert care for pets.",
        experienceYears: 5,
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
      });
      refreshData();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <>
      <header>
        <Logo />
        <div className="header-right">
          <div className="user-badge" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            👑 Admin Portal: {user.name}
          </div>
          <button className="ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main>
        {/* Admin Header Banner */}
        <div style={{ background: "var(--brand-navy)", color: "#fff", padding: "32px 36px", borderRadius: "24px", marginBottom: "28px" }}>
          <h1 style={{ color: "#fff", margin: "0 0 8px", fontSize: "28px" }}>Platform Administration & Management</h1>
          <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>
            Overview of platform analytics, doctor profile management, appointments history, and registered users.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>TOTAL DOCTORS</span>
              <b style={{ fontSize: "26px", color: "#fff" }}>{stats.doctorsCount || doctors.length}</b>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>REGISTERED PATIENTS</span>
              <b style={{ fontSize: "26px", color: "#fff" }}>{stats.patientsCount || 1}</b>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>TOTAL APPOINTMENTS</span>
              <b style={{ fontSize: "26px", color: "#fff" }}>{stats.appointmentsCount || apps.length}</b>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>PLATFORM REVENUE</span>
              <b style={{ fontSize: "26px", color: "#4ade80" }}>₹{stats.totalRevenue || 0}</b>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "2px solid var(--border-subtle)", paddingBottom: "12px" }}>
          <button className={tab === "overview" ? "" : "button-outline"} onClick={() => setTab("overview")}>
            📊 Doctor Profiles & Management
          </button>
          <button className={tab === "appointments" ? "" : "button-outline"} onClick={() => setTab("appointments")}>
            📅 All Platform Appointments ({apps.length})
          </button>
          <button className={tab === "users" ? "" : "button-outline"} onClick={() => setTab("users")}>
            👥 User Directory ({users.length})
          </button>
        </div>

        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
              {/* Doctor Profiles List */}
              <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ margin: "0 0 16px" }}>Active Doctor Profiles</h3>
                <div style={{ display: "grid", gap: "14px" }}>
                  {doctors.map(doc => (
                    <div key={doc._id} style={{ display: "flex", gap: "14px", alignItems: "center", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)" }}>
                      <img src={doc.avatar || "/vet_doctor_female.png"} alt={doc.name} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <b>{doc.name}</b>
                        <div style={{ fontSize: "12px", color: "var(--brand-blue)" }}>{doc.specialty}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{doc.email} · {doc.experienceYears || 10}+ yrs exp</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Doctor Profile Form */}
              <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ margin: "0 0 16px" }}>➕ Create New Doctor Profile</h3>
                
                {msg && <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", border: "1px solid #bbf7d0" }}>{msg}</div>}
                {err && <div style={{ background: "#fff0ef", color: "#a33", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{err}</div>}

                <form onSubmit={handleCreateDoctor} style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Doctor Full Name</label>
                    <input required placeholder="e.g. Dr. Rajesh Sharma" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Email Address (Login)</label>
                    <input required type="email" placeholder="e.g. rajesh@vetpulse.demo" value={newDoc.email} onChange={e => setNewDoc({ ...newDoc, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Initial Password</label>
                    <input required type="text" value={newDoc.password} onChange={e => setNewDoc({ ...newDoc, password: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Specialty / Sub-specialization</label>
                    <input required placeholder="e.g. Veterinary Cardiology & Internal Medicine" value={newDoc.specialty} onChange={e => setNewDoc({ ...newDoc, specialty: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Years of Experience</label>
                    <input type="number" value={newDoc.experienceYears} onChange={e => setNewDoc({ ...newDoc, experienceYears: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Bio / Professional Summary</label>
                    <textarea rows="2" value={newDoc.bio} onChange={e => setNewDoc({ ...newDoc, bio: e.target.value })} />
                  </div>
                  <button type="submit" style={{ marginTop: "6px" }}>
                    Create & Activate Doctor Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ margin: "0 0 14px" }}>System Appointments History</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Duration</th>
                    <th>Fee</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>No platform appointments recorded yet.</td></tr>
                  ) : (
                    apps.map(a => (
                      <tr key={a._id}>
                        <td>{new Date(a.startAt).toLocaleString()}</td>
                        <td><b>{a.patientId?.name || "Patient"}</b> ({a.patientId?.petName || "Pet"})</td>
                        <td><b>{a.doctorId?.name || "Doctor"}</b></td>
                        <td>{a.duration} mins</td>
                        <td>₹{a.price}</td>
                        <td>
                          <span style={{ color: a.paymentStatus === "paid" ? "var(--brand-green)" : "#d97706", fontWeight: "700" }}>
                            {a.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ margin: "0 0 14px" }}>Registered Platform Users</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Pet Info</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><b>{u.name}</b></td>
                      <td>{u.email}</td>
                      <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                      <td>{u.petName ? `${u.petName} (${u.petType || 'Pet'})` : '—'}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  const login = u => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <Login onLogin={login} />;
  if (user.role === "doctor") return <Doctor user={user} onLogout={logout} />;
  if (user.role === "admin") return <Admin user={user} onLogout={logout} />;
  return <Patient user={user} onLogout={logout} />;
}

createRoot(document.getElementById("root")).render(<App />);
