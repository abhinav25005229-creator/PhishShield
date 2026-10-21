
const topics = [
  ["How to Verify an HR Email and Company Domain Before Accepting a Job Offer", "Job Scams"],
  ["How to Check If a Website Is Legit in India: 12 Checks Before You Pay", "Website Safety"],
  ["Payment Successful but Money Not Received? Verify UPI Credit and Fake Screenshots", "UPI Scams"],
  ["Elderly Mangaluru Woman Loses ₹16.20 Lakh: Safety Checks", "Scam Case Studies"],
  ["App Store India Head, Telegram Officials Booked in Hyderabad Cyber Fraud", "Scam Case Studies"],
  ["Fake Payment UPI GPay: How to Verify Before You Act", "UPI Scams"],
  ["Fake GPay UPI Screenshot: How to Spot a Fake Google Pay Payment", "UPI Scams"],
  ["Fake PhonePe Transaction Scam: How to Catch It Before You Lose Money", "UPI Scams"],
  ["Is This Number a Scam? How to Check Unknown Mobile Numbers Online", "Phone Scams"],
  ["Fake PhonePe Transaction: How to Spot and Verify It", "UPI Scams"],
  ["Online Shopping Scams in India: Spot Fake Sites Before Paying", "Shopping Scams"],
  ["Mahadev App Scam: Understanding the Betting Fraud", "Investment Scams"],
  ["What Information Is Safe to Share Online?", "Privacy"],
  ["Deepfake Scam in India: How AI Is Used to Cheat You", "AI Scams"],
  ["How to Report a Scam Call or Fraud Number in India", "Reporting"],
  ["WhatsApp Accounts Linked to Digital Arrest Scams: Safety Guide", "Phone Scams"],
  ["How to Verify a Company Before Joining or Paying in India", "Job Scams"],
  ["Matrimonial Scams in India: Fake Profiles and NRI Fraud", "Social Media Scams"],
  ["Online Gaming Scams: Free Fire, BGMI and Roblox Frauds", "Gaming Scams"],
  ["Identity Theft in India: How It Happens and What to Do", "Privacy"],
  ["How Law Enforcement Investigates Cyber Scams in India", "Reporting"],
  ["Cyber Crime Helpline 1930: How to Report Online Fraud", "Reporting"],
  ["Screen Sharing Scam in India: AnyDesk Fraud Explained", "Phone Scams"],
  ["Fake Customer Care Scam: Verify Support Numbers Safely", "Phone Scams"],
  ["WhatsApp Wedding Invite Scam: Warning Signs and Safety", "Messaging Scams"],
  ["FedEx and DHL Parcel Scams: Verify Delivery Messages", "Messaging Scams"],
  ["Fraud Pattern Alerts: How to Recognise Similar Complaints", "Scam Case Studies"],
  ["Fake UPI Payment Apps: How to Spot Fake PhonePe and GPay", "UPI Scams"],
  ["How to Verify a UPI Transaction ID Safely", "UPI Scams"],
  ["Top 10 Online Scams in India: Warning Signs", "Scam Awareness"],
  ["Cyber Insurance in India: What to Know After a UPI Scam", "Financial Safety"],
  ["IPL Betting App Scams: Warning Signs and Safety", "Investment Scams"],
  ["Is This URL Safe? Free Ways to Check Links", "Website Safety"],
  ["Fake Rent Agreement Scams: Avoid Advance Payment Fraud", "Shopping Scams"],
  ["OLX and Facebook Marketplace Scams: Fake Advance Payments", "Shopping Scams"],
  ["UPI QR Code Scams: How to Identify Suspicious QR Codes", "UPI Scams"],
  ["Why Is Your Bank Account Frozen? Safe Steps to Take", "Financial Safety"],
  ["Fake Aadhaar and PAN Update Scams: How to Stay Safe", "Identity Scams"],
  ["Fake PhonePe Screenshots: Seven Ways to Verify Payments", "UPI Scams"],
  ["Fake Offer Letter Detection: Verify Company Details", "Job Scams"],
  ["Mule Account Scams: How Your Bank Account Can Be Misused", "Financial Safety"],
  ["Telegram Task Scams: Fake Work From Home Jobs", "Job Scams"],
  ["SIM Swap Scam: Warning Signs and Protection", "Identity Scams"],
  ["How to Recover Money Lost in an Online Scam in India", "Reporting"],
  ["Ten Ways to Check a Fake Job Offer in India", "Job Scams"],
  ["KYC Scams: Fake Bank Messages and Account Warnings", "Banking Scams"],
  ["E-Challan Scams: How to Check Fake Traffic Fine Messages", "Messaging Scams"],
  ["AI Voice Cloning Scams: Verify Calls from Family Members", "AI Scams"],
  ["Pig Butchering Scams: Fake Trading Apps and Relationships", "Investment Scams"],
  ["How to Report Cyber Crime in India: Step-by-Step Guide", "Reporting"],
  ["Donation Scams: How to Verify NGOs and Charity Appeals", "Financial Safety"],
  ["Fake Work From Home Jobs: Protect Students and Job Seekers", "Job Scams"],
  ["Like YouTube Videos and Earn Money Scams", "Job Scams"],
  ["Fake Online Shopping Websites: Identify Warning Signs", "Shopping Scams"],
  ["Fake Loan Apps: How to Identify and Avoid Fraud", "Financial Safety"],
  ["Fake PhonePe Screenshots: Examples and Verification Tips", "UPI Scams"],
  ["UPI Collect Request Scams: How to Recognise Payment Traps", "UPI Scams"],
  ["20 Text Message Scams in India: Examples and Reporting", "Messaging Scams"],
  ["How to Check Whether a UPI Payment Screenshot Is Real", "UPI Scams"],
  ["Fake Electricity Bill Disconnection Scams", "Messaging Scams"],
  ["Top Phone and SMS Scams: Warning Signs to Watch", "Phone Scams"],
  ["LPG Cylinder Scams on WhatsApp: How to Stay Safe", "Messaging Scams"],
  ["BC/EBC Scholarship Fake Portal Warning: Verify Before Applying", "Scholarship Scams"],
  ["Fake UPI Payment Screenshot Scams: Guide for Shopkeepers", "UPI Scams"],
  ["Fake Offer Letters in the Name of Major Companies", "Job Scams"],
  ["Is This Link Safe? Check a Suspicious URL Before Clicking", "Website Safety"],
  ["Digital Arrest Scams: How to Recognise and Respond", "Phone Scams"],
  ["Fake Offer Letter Check Online: Step-by-Step Guide", "Job Scams"],
  ["Fake Government Scheme Portals: How to Spot Fraud", "Government Scams"],
  ["Fake Job Offer Letter Scams: Verify Companies Before Joining", "Job Scams"],
  ["Latest Online Scams in India: Warning Signs and Prevention", "Scam Awareness"],
  ["Digital Banking Fraud: Common Types and Prevention", "Banking Scams"],
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makePost([title, category], index) {
  const slug = slugify(title);

  return {
    slug,
    title,
    category,
    readTime: "5 min read",
    summary: `Learn how to recognise warning signs, verify claims safely, and protect yourself from ${title.toLowerCase()}.`,
    image: "/images/threat-globe.svg",
    intro: `${title}. Online scams can look convincing, especially when they imitate familiar companies, banks, employers, or government services. The safest approach is to verify independently before sharing information or sending money.`,
    sections: [
      {
        heading: "How this scam or risk works",
        body: `${title} can involve impersonation, misleading claims, urgency, or requests for sensitive information. The exact method varies, so assess the actual evidence instead of relying on a single warning sign.`,
      },
      {
        heading: "Warning signs to check",
        body: [
          "Unexpected requests for money, OTPs, passwords, or personal information.",
          "Pressure to act immediately or threats of account suspension.",
          "Unfamiliar links, inconsistent sender details, or unusual payment instructions.",
          "Promises that seem unrealistic or claims that cannot be independently verified.",
        ],
      },
      {
        heading: "How to verify safely",
        body: [
          "Contact the organisation through its independently verified official website or app.",
          "Inspect the complete domain before opening a link.",
          "Verify payments in your own bank account or payment app, not from screenshots.",
          "Do not install unknown applications or grant remote-access permissions.",
          "Use PhishShield to analyse suspicious URLs or messages when appropriate.",
        ],
      },
      {
        heading: "What to do if you are affected",
        body: [
          "Stop communicating with the suspected scammer and do not send more money.",
          "Contact your bank or payment provider promptly if money or financial information is involved.",
          "Preserve relevant messages, transaction references, and other evidence securely.",
          "In India, call 1930 promptly for suspected financial cyber fraud and submit a complaint through the official National Cyber Crime Reporting Portal.",
          "Change compromised passwords and secure affected accounts.",
        ],
      },
      {
        heading: "How PhishShield can help",
        body: "PhishShield can analyse supported URLs and message text for suspicious indicators. Results are assessments, not guarantees. A low-risk result does not prove something is safe, and a high-risk result should be interpreted alongside the available evidence.",
      },
    ],
    index,
  };
}

export const BLOG_POSTS = topics.map(makePost);
