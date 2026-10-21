"""URL feature extraction + message rules + bilingual (English/Hinglish) reasons."""
import math, re, ipaddress
from urllib.parse import urlparse

SUS_TLDS = {"xyz","top","click","shop","icu","buzz","tk","ml","ga","cf","gq","site","online","live","rest","cfd"}
KEYWORDS = ["login","verify","secure","account","update","kyc","scholarship","internship","fee","payment",
            "bank","upi","refund","claim","reward","free","wallet","otp","portal","admission"]
SHORTENERS = {"bit.ly","tinyurl.com","t.co","cutt.ly","goo.gl","rb.gy","is.gd"}
FEATURES = ["url_length","host_length","dots","hyphens","digits","has_at","is_ip","subdomains",
            "sus_tld","keyword_hits","entropy","no_https","shortener","punycode","path_depth"]

REASONS = {
 "url_length": ("The URL is unusually long, which is often used to hide the real destination.",
                "URL bahut lamba hai; scammers asli destination chhupane ke liye aisa karte hain."),
 "host_length": ("The domain name is unusually long.", "Domain naam zarurat se zyada lamba hai."),
 "dots": ("The address has many dots/subdomains, a common spoofing trick.", "Address mein bahut saare dots/subdomains hain, jo spoofing ki common trick hai."),
 "hyphens": ("The domain contains hyphens, typical of look-alike sites (e.g. brand-login-secure).", "Domain mein hyphens hain, jo nakli look-alike sites mein aam hai."),
 "digits": ("The domain contains many digits, unusual for genuine organisations.", "Domain mein bahut digits hain, jo asli sansthaon mein kam hote hain."),
 "has_at": ("The URL contains '@', which can disguise the real host.", "URL mein '@' hai, jo asli host chhupa sakta hai."),
 "is_ip": ("It uses a raw IP address instead of a proper domain name.", "Ismein domain ki jagah seedha IP address hai."),
 "subdomains": ("It stacks several subdomains, imitating a trusted brand.", "Kai subdomains hain jo kisi bharose-mand brand ki nakal karte hain."),
 "sus_tld": ("It uses a domain ending (TLD) that is frequently abused for scams.", "Domain ka ending (TLD) scams mein aksar use hota hai."),
 "keyword_hits": ("It contains words like login, verify, KYC, fee or scholarship, often used as bait.", "Isme login, verify, KYC, fee ya scholarship jaise shabd hain jo aksar laalach ke liye use hote hain."),
 "entropy": ("The domain looks randomly generated.", "Domain random generate kiya hua lagta hai."),
 "no_https": ("The connection is not HTTPS, so data you enter is not protected.", "Connection HTTPS nahi hai, isliye aapka data surakshit nahi hai."),
 "shortener": ("It is a shortened link, so the real destination is hidden.", "Ye shortened link hai, asli destination chhupa hua hai."),
 "punycode": ("The domain uses look-alike (punycode) characters.", "Domain mein look-alike (punycode) characters hain."),
 "path_depth": ("The link has a deeply nested path, common in phishing kits.", "Link ka path bahut gehra hai, jo phishing kits mein aam hai."),
}


def normalize(url: str) -> str:
    url = url.strip()

    if not url:
        return url

    # Preserve URLs that already specify HTTP or HTTPS.
    if re.match(r"^https?://", url, re.IGNORECASE):
        return url

    # Add a scheme only when the user supplied a bare domain.
    return "https://" + url


def entropy(s: str) -> float:
    if not s: return 0.0
    return -sum((s.count(c)/len(s))*math.log2(s.count(c)/len(s)) for c in set(s))

def extract(url: str) -> dict:
    u = normalize(url)

    try:
        p = urlparse(u)
        host = (p.hostname or "").lower()
    except ValueError:
        p = urlparse("")
        host = ""
    try: ipaddress.ip_address(host); is_ip = 1
    except ValueError: is_ip = 0
    parts = host.split("."); low = u.lower()
    return {"url_length": len(u), "host_length": len(host), "dots": host.count("."),
            "hyphens": host.count("-"), "digits": sum(c.isdigit() for c in host),
            "has_at": int("@" in u), "is_ip": is_ip, "subdomains": max(len(parts)-2, 0),
            "sus_tld": int(parts[-1] in SUS_TLDS), "keyword_hits": sum(k in low for k in KEYWORDS),
            "entropy": round(entropy(host), 3), "no_https": int(p.scheme != "https"),
            "shortener": int(host in SHORTENERS), "punycode": int("xn--" in host),
            "path_depth": p.path.count("/")}

def vector(d: dict): return [d[f] for f in FEATURES]

URL_RE = re.compile(r"(https?://[^\s]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:/[^\s]*)?)", re.I)
def find_urls(text: str): return [u.rstrip(".,)") for u in URL_RE.findall(text)][:3]

MSG_RULES = [
 (r"\b(otp|upi pin|pin|cvv|password)\b.*\b(share|send|bhej|batao|enter)|\b(share|send|bhej)\w*.*\b(otp|upi pin|cvv)",
  "Asks for your OTP, PIN or password, which genuine organisations never do.", "OTP, PIN ya password maanga ja raha hai, asli sansthayein kabhi nahi maangti."),
 (r"urgent|immediately|within \d+ ?(hours|hrs)|today only|turant|abhi|warna|expire|blocked|band ho",
  "Uses urgency or threats to rush you.", "Jaldi karwane ke liye urgency ya dhamki ka use hua hai."),
 (r"(registration|processing|security|joining|exam)? ?(fee|deposit)|pay rs|pay \u20b9|paise bhej",
  "Demands an upfront fee or deposit.", "Pehle se fee ya deposit maanga ja raha hai."),
 (r"kyc|account (will be )?(blocked|suspended)|verify your account",
  "Claims your account/KYC needs urgent action.", "Dawa hai ki aapka account/KYC turant update karna hai."),
 (r"congratulations|you (have )?won|lottery|reward|prize|scholarship.*(approved|claim)|selected for",
  "Promises a prize, scholarship or job you never applied for.", "Aisa inaam, scholarship ya job ka vaada jiske liye aapne apply nahi kiya."),
]

ADVICE = {
 "low": {"en": ["No strong scam signals found, but stay careful.", "Open sites by typing the official address yourself."],
         "hi": ["Koi strong scam signal nahi mila, phir bhi savdhan rahein.", "Official address khud type karke site kholein."]},
 "medium": {"en": ["Do not enter passwords, OTPs or payment details.", "Verify through the official website or college office."],
            "hi": ["Password, OTP ya payment details na daalein.", "Official website ya college office se verify karein."]},
 "high": {"en": ["Do not click, reply or pay.", "Never share OTP/PIN. Report to your college IT cell and cybercrime.gov.in (helpline 1930)."],
          "hi": ["Click, reply ya payment na karein.", "OTP/PIN kisi ko na dein. College IT cell aur cybercrime.gov.in (1930) par report karein."]},
}
NOTE = {"en": "This is an automated risk estimate, not a guarantee. It cannot detect every threat; verify with official sources.",
        "hi": "Ye ek automatic risk anuman hai, guarantee nahi. Har khatra pakadna sambhav nahi; official source se verify karein."}
