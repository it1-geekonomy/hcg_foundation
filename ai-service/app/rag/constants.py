OFFICIAL_EMAIL = "hcgfoundation@gmail.com"
OFFICIAL_PHONE = "+91-80-4660-7760"
OFFICIAL_ADDRESS = (
    "Ground Floor, Tower Block, Unity Building Complex, Mission Road, "
    "Bangalore 560027, Karnataka, India"
)
FOUNDER_NAME = "Dr. B.S. Ajaikumar"
FOUNDER_ROLE = "Founder and Managing Trustee"

# --- Public website routes (must match frontend/src/app/(client)) ---
# Every page renders the donate form, so donation links scroll to it in place.
DONATE_URL = "#donate-form"
PATIENT_AID_URL = "/financial-support-for-pediatric-patients"
AWARENESS_URL = "/awareness-and-screening-camps"
PARTICIPATE_URL = "/participate"
CSR_URL = "/csr-partner"
GRANTS_URL = "/grant-and-philanthropy"
TRANSPARENCY_URL = "/transparency-and-knowledge-hub"
# Trustees and team are sections of the About Us page; the chatbot widget scrolls to them.
TEAM_URL = "/about-us#team"
TRUSTEES_URL = "/about-us#trustees"
EVENTS_URL = "/events"
PROJECTS_URL = "/projects"
PATIENT_STORIES_URL = "/patient-stories"
TESTIMONIALS_URL = "/testimonials"

PAGE_LABELS = {
    "/": "Home",
    "/about-us": "About Us",
    TEAM_URL: "Our Team",
    TRUSTEES_URL: "Board of Trustees",
    "/contact": "Contact Us",
    DONATE_URL: "Donate Now",
    PATIENT_AID_URL: "Financial Support for Pediatric Patients",
    AWARENESS_URL: "Awareness & Screening Camps",
    PARTICIPATE_URL: "Volunteer & Internships",
    CSR_URL: "CSR Partnership",
    GRANTS_URL: "Grants & Philanthropy",
    PATIENT_STORIES_URL: "Patient Stories",
    TESTIMONIALS_URL: "Testimonials",
    EVENTS_URL: "Events",
    PROJECTS_URL: "Projects",
    TRANSPARENCY_URL: "Annual Reports & Newsletters",
    "/privacy": "Privacy Policy",
    "/terms": "Terms & Conditions",
}

# Old routes that may still be stored on indexed chunks or written by the model.
LEGACY_URLS = {
    "/donate": DONATE_URL,
    "/patient-aid": PATIENT_AID_URL,
    "/internship": PARTICIPATE_URL,
    "/partnerships": CSR_URL,
    "/awareness": AWARENESS_URL,
    "/resources": TRANSPARENCY_URL,
    "/resources/annual-reports": TRANSPARENCY_URL,
    "/our-programs/financial-support-for-pediatric-patients": PATIENT_AID_URL,
    "/our-programs/awareness-and-screening-camps": AWARENESS_URL,
    "/getinvolved/participate": PARTICIPATE_URL,
    "/getinvolved/csr-partner": CSR_URL,
    "/getinvolved/grants-and-philanthropy": GRANTS_URL,
    "/grants-and-philanthropy": GRANTS_URL,
    "/resources/transparency-and-knowledge-hub": TRANSPARENCY_URL,
    "/resources/events": EVENTS_URL,
    "/resources/projects": PROJECTS_URL,
    "/journey-of-hope/patient-stories": PATIENT_STORIES_URL,
    "/journey-of-hope/testimonials": TESTIMONIALS_URL,
    "/about/our-team": TEAM_URL,
    "/about/our-story": "/about-us",
}

# Old detail routes whose items now live in a section of one page.
LEGACY_SECTION_PREFIXES = {
    "/about/our-team/": TEAM_URL,
}

LEGACY_DETAIL_PREFIXES = {
    "/journey-of-hope/patient-stories/": PATIENT_STORIES_URL + "/",
    "/resources/events/": EVENTS_URL + "/",
    "/resources/projects/": PROJECTS_URL + "/",
}

DETAIL_PREFIXES = (
    PATIENT_STORIES_URL + "/",
    EVENTS_URL + "/",
    PROJECTS_URL + "/",
)

# Organisation compliance details (safe to share when visitors ask)
OFFICIAL_PAN = "AAATH6254R"
FCRA_BANK_NAME = "State Bank of India (SBI)"
FCRA_ACCOUNT_HOLDER = "M/S HCG FOUNDATION"
FCRA_ACCOUNT_NUMBER = "40676010670"
FCRA_IFSC = "SBIN0000691"
FCRA_SWIFT = "SBININBB104"
FCRA_BRANCH = "New Delhi Main Branch — FCRA Cell, 11 Sansad Marg, New Delhi 110001"

NO_ANSWER_TOKEN = "NO_ANSWER_FOUND"

FALLBACK_ANSWER = (
    "I could not find that in HCG Foundation’s published information. "
    f"For help, email {OFFICIAL_EMAIL} or call {OFFICIAL_PHONE}."
)

OUT_OF_SCOPE_ANSWER = (
    "I’m here to help with questions about HCG Foundation and its cancer-care work, "
    "so I can’t answer that. You can ask me about donations, Patient Aid, screening camps, "
    "volunteering, internships, or events."
)

SMALL_TALK_ANSWER = (
    "I’m doing well, thank you for asking! How can I help you today? I can answer questions "
    "about donating, Patient Aid, screening camps, volunteering, internships and events."
)

ABOUT_BOT_ANSWER = (
    "I’m Hope, the HCG Foundation AI Assistant. I can help you find information about "
    "HCG Foundation’s programs, Patient Aid, donations, screening camps, volunteering, "
    f"internships, and events. For further assistance, contact {OFFICIAL_EMAIL} or {OFFICIAL_PHONE}."
)

ACK_ANSWER = "Glad to help! Is there anything else you’d like to know about HCG Foundation?"

SETUP_ANSWER = (
    "I’m still setting up my knowledge base. Please try again in a moment, "
    f"or reach us at {OFFICIAL_EMAIL} / {OFFICIAL_PHONE}."
)

GREETING_ANSWER = (
    "Hello! I’m the HCG Foundation AI Assistant. I can help with donations, "
    "Patient Aid, programs, trustees, volunteering, internships, and registration details "
    f"like 80G/FCRA. Official contact: {OFFICIAL_EMAIL}, {OFFICIAL_PHONE}."
)

CONTACT_ANSWER = (
    "You can reach HCG Foundation at:\n"
    f"- Phone: {OFFICIAL_PHONE}\n"
    f"- Email: {OFFICIAL_EMAIL}\n"
    f"- Address: {OFFICIAL_ADDRESS}"
)

THANKS_ANSWER = "You’re welcome. Happy to help with anything else about HCG Foundation."

GOODBYE_ANSWER = (
    f"Thank you for visiting. For more help: {OFFICIAL_EMAIL} or {OFFICIAL_PHONE}."
)

HELP_ANSWER = (
    "You can ask about donating, Patient Aid applications, internship, "
    "trustees and leadership, programs/projects, 80G/FCRA certificates, "
    "or privacy/terms. What would you like to know?"
)

DONATE_INTENT_ANSWER = (
    "You can support HCG Foundation using the Donate Now form on the website. "
    "Eligible donations from Indian donors qualify for an 80G tax receipt. "
    f"Contact: {OFFICIAL_EMAIL}, {OFFICIAL_PHONE}. Address: {OFFICIAL_ADDRESS}."
)

FOUNDER_INTENT_ANSWER = (
    f"{FOUNDER_NAME} is the {FOUNDER_ROLE} of HCG Foundation."
)
