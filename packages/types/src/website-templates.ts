import type { SiteBlock, SiteBlockItem } from "./website";

/**
 * Prebuilt website templates (Wix/Squarespace-style). A template is a full,
 * ready-made page of content blocks a tenant can apply in one click, then edit
 * the copy and tweak layout (colors/alignment) on. Every Industry Solution
 * Pack category ships at least two, so any tenant starts from a real site
 * instead of a blank page. Pure configuration — no per-template code.
 */
export interface WebsiteTemplate {
  key: string;
  name: string;
  /** Solution-pack key this template is designed for (see SOLUTION_PACKS). */
  category: string;
  description: string;
  emoji: string;
  /** Dominant accent color, used for the template card swatch. */
  accent: string;
  blocks: SiteBlock[];
}

/* ----------------------------- block factories ---------------------------- */

type RawItem = Omit<SiteBlockItem, "id">;
type RawBlock = Omit<SiteBlock, "id" | "items"> & { items?: RawItem[] };

/** Stamps stable, unique ids onto a template's blocks/items for React keys.
 * (Applying a template to a live page regenerates these fresh — see the
 * builder's applyTemplate.) */
function stamp(blocks: RawBlock[]): SiteBlock[] {
  return blocks.map((b, i) => ({
    ...b,
    id: `b${i}`,
    items: b.items?.map((it, j) => ({ ...it, id: `b${i}i${j}` })),
  }));
}

const nav = (brand: string, links: string[], cta = "Contact"): RawBlock => ({
  type: "navbar",
  heading: brand,
  buttonLabel: cta,
  buttonHref: "#contact",
  items: links.map((l) => ({ text: l, href: `#${l.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` })),
});

const hero = (
  heading: string,
  text: string,
  button: string,
  imageUrl: string,
  bgColor?: string,
): RawBlock => ({
  type: "hero",
  heading,
  text,
  buttonLabel: button,
  buttonHref: "#contact",
  imageUrl,
  bgColor,
  align: "center",
});

const features = (heading: string, text: string, items: RawItem[], bgColor?: string): RawBlock => ({
  type: "features",
  heading,
  text,
  bgColor,
  align: "center",
  items,
});

const stats = (items: RawItem[], bgColor = "#0f172a"): RawBlock => ({
  type: "stats",
  bgColor,
  items,
});

const gallery = (heading: string, images: string[]): RawBlock => ({
  type: "gallery",
  heading,
  align: "center",
  items: images.map((imageUrl) => ({ imageUrl })),
});

const testimonials = (items: RawItem[]): RawBlock => ({
  type: "testimonials",
  heading: "What people say",
  align: "center",
  items,
});

const cta = (heading: string, text: string, button: string, bgColor?: string): RawBlock => ({
  type: "cta",
  heading,
  text,
  buttonLabel: button,
  buttonHref: "#contact",
  bgColor,
  align: "center",
});

const footer = (brand: string, tagline: string, links: string[]): RawBlock => ({
  type: "footer",
  heading: brand,
  text: tagline,
  items: links.map((l) => ({ text: l, href: `#${l.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` })),
});

// A dynamic online-booking block (appointments / reservations). Each item is a
// bookable service; `heading` holds the price (blank = free), `text` a duration.
const booking = (heading: string, text: string, items: RawItem[], bgColor?: string): RawBlock => ({
  type: "booking",
  heading,
  text,
  bgColor,
  align: "center",
  items,
});

// A dynamic online-ordering menu. Each item is orderable; `heading` holds the
// price and `text` a short description.
const menu = (heading: string, text: string, items: RawItem[], bgColor?: string): RawBlock => ({
  type: "menu",
  heading,
  text,
  bgColor,
  align: "center",
  items,
});

// A few royalty-free Unsplash source URLs used as tasteful placeholders.
const IMG = {
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=70",
  cafe: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=70",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=70",
  resort: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=70",
  retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=70",
  boutique: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1600&q=70",
  clinic: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=70",
  dental: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1600&q=70",
  agency: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=70",
  consulting: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=70",
  factory: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=70",
  warehouse: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=70",
  office: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1600&q=70",
  salon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=70",
  food1: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=70",
  food2: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=70",
  food3: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=70",
  room1: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=70",
  room2: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=70",
  room3: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=70",
  shop1: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=70",
  shop2: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=70",
  shop3: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=70",
};

const contactForm: RawBlock = { type: "form", heading: "Get in touch", text: "We usually reply within a day." };

/* --------------------------------- templates ------------------------------ */

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  /* ---------- General Business ---------- */
  {
    key: "general-startup",
    name: "Modern Startup",
    category: "general",
    description: "Bold hero, feature grid, and metrics — for a product or SaaS.",
    emoji: "🚀",
    accent: "#6366f1",
    blocks: stamp([
      nav("Northwind", ["Features", "About", "Pricing", "Contact"], "Get started"),
      hero(
        "Software that grows with your business",
        "One platform for your team to plan, build, and ship — without the busywork.",
        "Start free",
        IMG.office,
      ),
      features("Everything you need", "Powerful features, thoughtfully designed.", [
        { icon: "⚡", title: "Fast by default", text: "Snappy performance your team will actually enjoy." },
        { icon: "🔒", title: "Secure", text: "Bank-grade encryption and role-based access, built in." },
        { icon: "🔗", title: "Connected", text: "Integrates with the tools you already use." },
      ]),
      stats([
        { title: "10k+", text: "Active teams" },
        { title: "99.9%", text: "Uptime" },
        { title: "4.9/5", text: "Customer rating" },
      ]),
      testimonials([
        { text: "It replaced five tools and paid for itself in a month.", title: "Aarav — Founder, Loop" },
        { text: "Onboarding took an afternoon. The whole team was in by Friday.", title: "Sara — COO, Bright" },
      ]),
      cta("Ready to get started?", "Create your workspace in minutes — no credit card required.", "Start free"),
      contactForm,
      footer("Northwind", "Software for modern teams.", ["Features", "Pricing", "About", "Contact"]),
    ]),
  },
  {
    key: "general-simple",
    name: "Simple Business",
    category: "general",
    description: "Clean, professional single-pager for any local business.",
    emoji: "🏢",
    accent: "#0ea5e9",
    blocks: stamp([
      nav("Your Company", ["Services", "About", "Contact"]),
      hero(
        "Helping local businesses do more",
        "Trusted by our community for quality work and honest service.",
        "Book a call",
        IMG.consulting,
        "#0f766e",
      ),
      features("What we do", "Services tailored to what you need.", [
        { icon: "✅", title: "Reliable service", text: "On time, on budget, every time." },
        { icon: "💬", title: "Real support", text: "Talk to a person, not a ticket queue." },
        { icon: "🌟", title: "Proven results", text: "A track record our customers vouch for." },
      ]),
      cta("Let's work together", "Tell us what you need and we'll take it from there.", "Get a quote"),
      contactForm,
      footer("Your Company", "Serving the community since day one.", ["Services", "About", "Contact"]),
    ]),
  },
  {
    key: "general-salon",
    name: "Salon & Beauty",
    category: "general",
    description: "Service menu with online appointment booking and payment — for a salon, spa, or barber.",
    emoji: "💇",
    accent: "#db2777",
    blocks: stamp([
      nav("Luxe Salon", ["Services", "Gallery", "Book"], "Book now"),
      hero(
        "Look good, feel amazing",
        "Expert stylists, a relaxing space, and easy online booking.",
        "Book an appointment",
        IMG.salon,
        "#831843",
      ),
      booking("Book a service", "Pick a service, choose your time, and pay online.", [
        { title: "Haircut & Styling", text: "Wash, cut, and blow-dry.", heading: "₹600" },
        { title: "Hair Color", text: "Full color or highlights.", heading: "₹2,500" },
        { title: "Facial & Cleanup", text: "45 min glow treatment.", heading: "₹1,200" },
        { title: "Manicure & Pedicure", text: "Relax and refresh.", heading: "₹900" },
      ]),
      gallery("Our work", [IMG.salon, IMG.boutique, IMG.office]),
      testimonials([
        { text: "Booked in seconds and the cut was perfect. My new regular spot.", title: "Ananya R." },
      ]),
      cta("Ready for a fresh look?", "Book online today — walk-ins welcome too.", "Book now"),
      contactForm,
      footer("Luxe Salon", "Beauty, booked in a tap.", ["Services", "Gallery", "Book"]),
    ]),
  },

  /* ---------- Restaurant ---------- */
  {
    key: "restaurant-fine-dining",
    name: "Fine Dining",
    category: "restaurant",
    description: "Elegant hero, signature dishes, gallery, and reservations.",
    emoji: "🍽️",
    accent: "#b91c1c",
    blocks: stamp([
      nav("Saffron", ["Menu", "Gallery", "Reserve", "Contact"], "Reserve"),
      hero(
        "A table worth remembering",
        "Seasonal plates, a curated cellar, and warm hospitality in the heart of the city.",
        "Reserve a table",
        IMG.restaurant,
      ),
      menu("Order online", "Add dishes to your cart and pay securely — pickup or dine-in.", [
        { title: "Tasting Menu", text: "Seven courses, chef's choice.", heading: "₹2,400" },
        { title: "Wine Pairing", text: "Hand-picked for each course.", heading: "₹1,200" },
        { title: "Garden Plate", text: "Vegetarian, farm-to-table.", heading: "₹1,600" },
      ]),
      gallery("From our kitchen", [IMG.food1, IMG.food2, IMG.food3]),
      testimonials([
        { text: "The tasting menu was the best meal we've had all year.", title: "Priya & Rohan" },
        { text: "Impeccable service and a wine list to match.", title: "The Hindu — Dining" },
      ]),
      cta("Join us for dinner", "Reservations recommended, especially on weekends.", "Reserve now"),
      contactForm,
      footer("Saffron", "Fine dining, every evening.", ["Menu", "Reserve", "Contact"]),
    ]),
  },
  {
    key: "restaurant-cafe",
    name: "Cozy Café",
    category: "restaurant",
    description: "Warm, friendly layout for a café or bakery with an online menu.",
    emoji: "☕",
    accent: "#92400e",
    blocks: stamp([
      nav("Bean & Co.", ["Menu", "Order", "Visit"], "Order online"),
      hero(
        "Freshly brewed, freshly baked",
        "Your neighborhood spot for great coffee, warm pastries, and a comfy corner.",
        "See the menu",
        IMG.cafe,
        "#78350f",
      ),
      menu("Order online", "Made fresh every morning — order ahead and pay online.", [
        { title: "Cappuccino", text: "Single-origin, roasted in-house.", heading: "₹120" },
        { title: "Butter Croissant", text: "Baked fresh each morning.", heading: "₹80" },
        { title: "Chicken Sandwich", text: "On sourdough, with salad.", heading: "₹180" },
      ]),
      gallery("A peek inside", [IMG.food2, IMG.cafe, IMG.food3]),
      cta("Order ahead", "Skip the queue — order online and pick up in minutes.", "Order online"),
      contactForm,
      footer("Bean & Co.", "Open 7am–9pm, every day.", ["Menu", "Order", "Visit"]),
    ]),
  },

  /* ---------- Hotel ---------- */
  {
    key: "hotel-boutique",
    name: "Boutique Hotel",
    category: "hotel",
    description: "Room showcase, amenities, and a booking call-to-action.",
    emoji: "🏨",
    accent: "#0369a1",
    blocks: stamp([
      nav("The Grand Stay", ["Rooms", "Amenities", "Gallery", "Book"], "Book now"),
      hero(
        "Your home away from home",
        "Thoughtfully designed rooms, warm service, and a location you'll love.",
        "Check availability",
        IMG.hotel,
      ),
      booking("Book a room", "Check availability and reserve online in seconds.", [
        { title: "Deluxe Room", text: "Queen bed, city view.", heading: "₹4,500" },
        { title: "Executive Suite", text: "Separate living area.", heading: "₹7,900" },
        { title: "Grand Suite", text: "Top floor, panoramic view.", heading: "₹12,000" },
      ]),
      gallery("Take a look", [IMG.room1, IMG.room2, IMG.room3]),
      stats([
        { title: "120", text: "Rooms" },
        { title: "24/7", text: "Concierge" },
        { title: "4.8★", text: "Guest rating" },
      ]),
      cta("Reserve your stay", "Best rates guaranteed when you book direct.", "Book now"),
      contactForm,
      footer("The Grand Stay", "Hospitality, perfected.", ["Rooms", "Amenities", "Book"]),
    ]),
  },
  {
    key: "hotel-resort",
    name: "Resort & Spa",
    category: "hotel",
    description: "Relaxed, spacious layout for a resort, villa, or wellness retreat.",
    emoji: "🌴",
    accent: "#047857",
    blocks: stamp([
      nav("Palm Cove", ["Stay", "Spa", "Experiences", "Book"], "Book a getaway"),
      hero(
        "Escape to somewhere better",
        "Sun, sea, and slow mornings — a resort built for switching off.",
        "Plan your escape",
        IMG.resort,
        "#065f46",
      ),
      booking("Book a spa treatment", "Reserve your session and pay online.", [
        { title: "Signature Massage", text: "60 min, full body.", heading: "₹2,500" },
        { title: "Facial & Glow", text: "45 min, deep cleanse.", heading: "₹1,800" },
        { title: "Couples Retreat", text: "90 min, side by side.", heading: "₹5,500" },
      ]),
      gallery("Moments here", [IMG.resort, IMG.room2, IMG.room1]),
      testimonials([
        { text: "The most relaxed we've felt in years. We're already planning our return.", title: "The Mehtas" },
      ]),
      cta("Your getaway is waiting", "Reserve now for the season's best rates.", "Book a getaway"),
      contactForm,
      footer("Palm Cove", "Resort & spa by the sea.", ["Stay", "Spa", "Book"]),
    ]),
  },

  /* ---------- Retail ---------- */
  {
    key: "retail-storefront",
    name: "Storefront",
    category: "retail",
    description: "Product highlights, collections, and a visit/shop CTA.",
    emoji: "🛍️",
    accent: "#7c3aed",
    blocks: stamp([
      nav("Marketplace", ["Shop", "Collections", "Visit"], "Shop now"),
      hero(
        "Everything you love, in one store",
        "Quality products, fair prices, and friendly staff who know their stuff.",
        "Browse the shop",
        IMG.retail,
      ),
      features("Shop by category", "Something for everyone.", [
        { icon: "👕", title: "Apparel", text: "Everyday essentials and new arrivals." },
        { icon: "🏠", title: "Home", text: "Décor and goods that make a house a home." },
        { icon: "🎁", title: "Gifts", text: "Hand-picked, for every occasion." },
      ]),
      gallery("New this week", [IMG.shop1, IMG.shop2, IMG.shop3]),
      cta("Come say hello", "Visit us in store or shop online — your choice.", "Get directions"),
      contactForm,
      footer("Marketplace", "Your friendly neighborhood store.", ["Shop", "Collections", "Visit"]),
    ]),
  },
  {
    key: "retail-boutique",
    name: "Boutique Shop",
    category: "retail",
    description: "Minimal, style-forward layout for a boutique or specialty store.",
    emoji: "👗",
    accent: "#db2777",
    blocks: stamp([
      nav("Atelier", ["Collection", "Lookbook", "Contact"], "Visit us"),
      hero(
        "Curated, not crowded",
        "A small shop with a big eye for the pieces worth keeping.",
        "See the collection",
        IMG.boutique,
        "#831843",
      ),
      features("Why shop with us", "Considered choices, always.", [
        { icon: "✨", title: "Hand-picked", text: "Every piece chosen with care." },
        { icon: "🧵", title: "Quality first", text: "Made to last, not to landfill." },
        { icon: "🤝", title: "Personal service", text: "Styling help whenever you want it." },
      ]),
      gallery("The lookbook", [IMG.shop3, IMG.boutique, IMG.shop1]),
      cta("Find your next favorite", "New pieces land every week — come take a look.", "Visit us"),
      contactForm,
      footer("Atelier", "A boutique with an eye.", ["Collection", "Lookbook", "Contact"]),
    ]),
  },

  /* ---------- Clinic / Healthcare ---------- */
  {
    key: "clinic-practice",
    name: "Medical Practice",
    category: "clinic",
    description: "Reassuring layout with services, team, and appointment booking.",
    emoji: "🩺",
    accent: "#0d9488",
    blocks: stamp([
      nav("City Health", ["Services", "Doctors", "Book"], "Book appointment"),
      hero(
        "Care you can count on",
        "Compassionate, evidence-based medicine for your whole family.",
        "Book an appointment",
        IMG.clinic,
        "#115e59",
      ),
      booking("Book an appointment", "Pick a service and reserve your slot online.", [
        { title: "General consultation", text: "Check-ups, diagnoses, and treatment.", heading: "₹500" },
        { title: "Diagnostics", text: "On-site labs and quick results.", heading: "₹800" },
        { title: "Preventive care", text: "Vaccinations and health screenings.", heading: "₹300" },
      ]),
      stats([
        { title: "15+", text: "Years of care" },
        { title: "20k+", text: "Patients treated" },
        { title: "Same-day", text: "Appointments" },
      ]),
      testimonials([
        { text: "The doctors actually listen. I always leave feeling cared for.", title: "Neha K." },
      ]),
      cta("Feeling unwell?", "Book an appointment online — same-day slots available.", "Book now"),
      contactForm,
      footer("City Health", "Family healthcare you can trust.", ["Services", "Doctors", "Book"]),
    ]),
  },
  {
    key: "clinic-dental",
    name: "Dental Care",
    category: "clinic",
    description: "Bright, friendly layout for a dental or specialty clinic.",
    emoji: "🦷",
    accent: "#2563eb",
    blocks: stamp([
      nav("Bright Smile", ["Treatments", "About", "Book"], "Book a visit"),
      hero(
        "A healthier, brighter smile",
        "Gentle, modern dentistry in a calm and welcoming clinic.",
        "Book a visit",
        IMG.dental,
      ),
      booking("Book a visit", "Choose a treatment and reserve online.", [
        { title: "Check-up & cleaning", text: "Keep your smile healthy.", heading: "₹800" },
        { title: "Whitening", text: "Brighten in a single visit.", heading: "₹4,000" },
        { title: "Braces consultation", text: "Straighten with confidence.", heading: "₹500" },
      ]),
      testimonials([
        { text: "Painless, friendly, and my teeth have never looked better.", title: "Arjun S." },
      ]),
      cta("Ready for your appointment?", "New patients welcome — book online today.", "Book a visit"),
      contactForm,
      footer("Bright Smile", "Modern, gentle dentistry.", ["Treatments", "About", "Book"]),
    ]),
  },

  /* ---------- Professional Services ---------- */
  {
    key: "prosvc-agency",
    name: "Creative Agency",
    category: "professional-services",
    description: "Portfolio-style layout for an agency or studio.",
    emoji: "💼",
    accent: "#4f46e5",
    blocks: stamp([
      nav("Studio North", ["Work", "Services", "Contact"], "Start a project"),
      hero(
        "We build brands people remember",
        "Strategy, design, and marketing that moves the numbers that matter.",
        "Start a project",
        IMG.agency,
        "#312e81",
      ),
      features("What we do", "Full-service, senior-led.", [
        { icon: "🎨", title: "Brand & design", text: "Identities that stand out and scale." },
        { icon: "📈", title: "Marketing", text: "Campaigns that reach the right people." },
        { icon: "💻", title: "Web & product", text: "Fast, modern sites and apps." },
      ]),
      stats([
        { title: "120+", text: "Projects shipped" },
        { title: "40+", text: "Happy clients" },
        { title: "8 yrs", text: "In business" },
      ]),
      testimonials([
        { text: "They understood our business in a week and delivered in a month.", title: "Head of Growth, Kite" },
      ]),
      cta("Have a project in mind?", "Tell us about it — we'll get back within a day.", "Start a project"),
      contactForm,
      footer("Studio North", "A creative agency for ambitious brands.", ["Work", "Services", "Contact"]),
    ]),
  },
  {
    key: "prosvc-consulting",
    name: "Consulting Firm",
    category: "professional-services",
    description: "Authoritative layout for consultants, lawyers, or accountants.",
    emoji: "📊",
    accent: "#334155",
    blocks: stamp([
      nav("Meridian Partners", ["Expertise", "About", "Contact"], "Request a consult"),
      hero(
        "Advice that drives results",
        "Trusted counsel for the decisions that shape your business.",
        "Request a consultation",
        IMG.consulting,
        "#1e293b",
      ),
      features("Our expertise", "Deep experience across disciplines.", [
        { icon: "📊", title: "Strategy", text: "Clarity on where to focus and why." },
        { icon: "⚖️", title: "Advisory", text: "Practical guidance you can act on." },
        { icon: "💹", title: "Finance", text: "Planning, modeling, and controls." },
      ]),
      testimonials([
        { text: "Meridian's advice reshaped our roadmap for the better.", title: "CEO, Horizon Ltd" },
        { text: "Rigorous, responsive, and genuinely invested in our outcome.", title: "CFO, Anchor Co" },
      ]),
      cta("Let's talk", "Book a no-obligation consultation to explore how we can help.", "Request a consult"),
      contactForm,
      footer("Meridian Partners", "Consulting that delivers.", ["Expertise", "About", "Contact"]),
    ]),
  },

  /* ---------- Manufacturing ---------- */
  {
    key: "manufacturing-industrial",
    name: "Industrial Co.",
    category: "manufacturing",
    description: "Capabilities, capacity stats, and a quote request.",
    emoji: "🏭",
    accent: "#ca8a04",
    blocks: stamp([
      nav("Ironworks", ["Capabilities", "Quality", "Contact"], "Request a quote"),
      hero(
        "Precision manufacturing at scale",
        "Reliable production, tight tolerances, and on-time delivery — every order.",
        "Request a quote",
        IMG.factory,
        "#78350f",
      ),
      features("Capabilities", "End-to-end, in-house.", [
        { icon: "⚙️", title: "Fabrication", text: "Cutting, forming, and machining." },
        { icon: "🔩", title: "Assembly", text: "Sub-assembly to finished product." },
        { icon: "📦", title: "Logistics", text: "Warehousing and on-time dispatch." },
      ]),
      stats([
        { title: "50k+", text: "Units / month" },
        { title: "ISO 9001", text: "Certified" },
        { title: "99.5%", text: "On-time delivery" },
      ]),
      cta("Need a manufacturing partner?", "Send us your specs and we'll quote within 48 hours.", "Request a quote"),
      contactForm,
      footer("Ironworks", "Manufacturing you can rely on.", ["Capabilities", "Quality", "Contact"]),
    ]),
  },
  {
    key: "manufacturing-supply",
    name: "Factory & Supply",
    category: "manufacturing",
    description: "Product-line and distribution focus for suppliers and wholesalers.",
    emoji: "📦",
    accent: "#0891b2",
    blocks: stamp([
      nav("SupplyLine", ["Products", "Distribution", "Contact"], "Get pricing"),
      hero(
        "From our floor to your shelf",
        "Consistent quality and dependable supply for businesses that can't afford delays.",
        "Get wholesale pricing",
        IMG.warehouse,
        "#155e75",
      ),
      features("Product lines", "Made and stocked in volume.", [
        { icon: "🏭", title: "Manufacturing", text: "Produced to spec at scale." },
        { icon: "🚚", title: "Distribution", text: "Nationwide, on schedule." },
        { icon: "📋", title: "Custom orders", text: "Bulk and private-label welcome." },
      ]),
      stats([
        { title: "500+", text: "SKUs in stock" },
        { title: "48 hr", text: "Dispatch" },
        { title: "300+", text: "Trade partners" },
      ]),
      cta("Become a partner", "Request our catalogue and wholesale pricing.", "Get pricing"),
      contactForm,
      footer("SupplyLine", "Factory-direct supply, done right.", ["Products", "Distribution", "Contact"]),
    ]),
  },
];

/** Templates for a given solution-pack category, always including the
 * cross-industry "general" ones as a fallback so every tenant sees options. */
export function templatesForCategory(category?: string | null): WebsiteTemplate[] {
  const inCategory = category
    ? WEBSITE_TEMPLATES.filter((t) => t.category === category)
    : [];
  const general = WEBSITE_TEMPLATES.filter((t) => t.category === "general");
  // Category-specific first, then general (de-duped).
  const seen = new Set(inCategory.map((t) => t.key));
  return [...inCategory, ...general.filter((t) => !seen.has(t.key))];
}

export function getWebsiteTemplate(key: string): WebsiteTemplate | undefined {
  return WEBSITE_TEMPLATES.find((t) => t.key === key);
}
