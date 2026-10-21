export const TOOLS = [
  { k: "check", i: "link", t: "Link and message checker", d: "Paste a suspicious link or SMS/WhatsApp text. Get a risk score and the reasons behind it." },
  { k: "qr", i: "qr", t: "QR and UPI checker", d: "Decode a QR image on your device and see where it leads before you pay." },
  { k: "screenshot", i: "image", t: "Screenshot checker", d: "Upload a chat, email or payment screenshot. AI reads it and looks for scam signs." },
  { k: "photo", i: "camera", t: "Photo checker", d: "Photograph a poster, notice or ID card and have the text analysed." },
  { k: "offer", i: "doc", t: "Offer letter checker", d: "Check an internship, job or scholarship letter for fee demands and fake branding." },
  { k: "library", i: "book", t: "Scam library", d: "Learn how common Indian scams work, their red flags and what to do." },
];
export const STEPS = [
  ["Choose a tool", "Pick link, message, QR, screenshot, photo or offer letter."],
  ["Paste or upload", "No account needed. QR images are decoded in your browser."],
  ["We analyse it", "A trained model, threat lists and an AI reader look for scam signals."],
  ["Read the verdict", "You get a score, plain reasons in English or Hinglish, and next steps."],
];
export const SIGNALS = [
  ["Address features", "15 measurable traits of a link, such as length, hyphens, odd endings and random-looking names. This is how unknown links get scored."],
  ["Threat intelligence", "When configured, Google Safe Browsing can flag known dangerous URLs. Without a key, the local model still evaluates URL structure."],
  ["Message language", "A text classifier plus rules for OTP requests, urgency, upfront fees and fake prizes."],
  ["AI image reading", "A vision model reads screenshots and photos, then the extracted text goes through the same checks."],
];
export const FAQ = [
  ["Is PhishShield free?", "Yes. There is no sign-up and no payment."],
  ["Can it be wrong?", "Yes. Every result is an estimate. A low score does not prove something is safe, so verify with the official source."],
  ["Are my messages stored?", "No. Only the risk level and score are counted for statistics. A message is saved only if you press the report button."],
  ["Who sees the reports?", "Authorised college IT staff can review reported items to warn other students."],
  ["What should I do if I already paid?", "Call 1930 and report at cybercrime.gov.in as fast as you can, then contact your bank."],
];
export const LIB = [
  { id: "scholar", cat: "Students", t: "Scholarship fee scam", how: "A message says your scholarship is approved, but you must pay a registration or processing fee to release it.", flags: ["Upfront fee", "Scholarship you never applied for", "Non-official link"], act: "Check the official portal by typing its address yourself. Real scholarships do not charge to pay you." },
  { id: "job", cat: "Students", t: "Fake internship or job offer", how: "An offer arrives from a free email address and asks for a security deposit, laptop fee or training fee before joining.", flags: ["Gmail or Yahoo sender", "Money before joining", "Unrealistic pay"], act: "Look up the company's careers page and contact HR using details from the official site." },
  { id: "kyc", cat: "Banking", t: "KYC expiry message", how: "An SMS says your account will be blocked today unless you update KYC through a link.", flags: ["Threat of blocking", "Look-alike bank link", "Asks for OTP or PIN"], act: "Do not click. Open your bank's app or visit a branch." },
  { id: "upi", cat: "Payments", t: "UPI collect and QR trick", how: "A stranger says they will pay you, then sends a collect request or QR code and asks you to approve it.", flags: ["Asks for UPI PIN", "QR for receiving money", "Pressure to hurry"], act: "Receiving money never needs a PIN. Decline the request and block the sender." },
  { id: "shot", cat: "Payments", t: "Fake payment screenshot", how: "A buyer shows an edited screenshot of a successful payment and asks you to hand over the goods.", flags: ["Money not in your bank app", "Mismatched time or amount", "Buyer rushes you"], act: "Confirm the credit in your own bank or UPI app before handing anything over." },
  { id: "parcel", cat: "Delivery", t: "Parcel and customs scam", how: "A caller or message claims a parcel in your name is held and asks for a small fee or personal details.", flags: ["Parcel you did not order", "Small fee through a link", "Caller claims to be an officer"], act: "Check tracking on the courier's official app and ignore the link." },
  { id: "arrest", cat: "Calls", t: "Digital arrest call", how: "Callers pose as police or agency officers, say you are in a case, and keep you on video call while demanding money.", flags: ["Claims you are under arrest", "Orders you to stay on the call", "Asks for transfers to clear your name"], act: "No agency arrests people over video call or collects money this way. Hang up and call 1930." },
  { id: "kit", cat: "Banking", t: "Fake bill or FASTag renewal", how: "A message says your electricity, FASTag or gas connection will be cut unless you pay through a link.", flags: ["Disconnection threat", "Unfamiliar payment link", "Deadline of hours"], act: "Pay only through the provider's official app or website." },
];
