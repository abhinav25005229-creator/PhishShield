"""Trains URL + message models and prints precision/recall/F1.
Real data: put data/urls.csv (columns: url,label  where 1=phishing) and it is used automatically."""
import csv, json, os, random, joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from app.features import extract, vector
from urllib.parse import urlparse
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedGroupKFold
random.seed(7)
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "models"); os.makedirs(OUT, exist_ok=True)
rnd = lambda n=6: "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=n))
BRANDS = ["sbi","hdfc","icici","paytm","amazon","flipkart","nsp","aicte","tcs","infosys","gpay","phonepe"]
KW = ["login","verify","secure","kyc","scholarship","fee","refund","claim","update","payment","internship"]
TLD = ["xyz","top","click","shop","icu","buzz","tk","site","online","live","com","in"]
LEGIT = ["google.com","wikipedia.org","github.com","amazon.in","flipkart.com","hdfcbank.com","onlinesbi.sbi","nptel.ac.in",
         "scholarships.gov.in","ugc.gov.in","iitd.ac.in","aicte-india.org","tcs.com","infosys.com","paytm.com","microsoft.com",
         "coursera.org","linkedin.com","naukri.com","youtube.com"]

def load_sms_data():
    path = os.path.join(HERE, "data", "SMSSpamCollection")

    if not os.path.isfile(path):
        raise FileNotFoundError(
            f"SMS dataset not found: {path}"
        )

    messages = []
    labels = []

    with open(path, "r", encoding="utf-8") as file:
        for line in file:
            parts = line.rstrip("\r\n").split("\t", 1)

            if len(parts) != 2:
                continue

            label, message = parts
            label = label.strip().lower()
            message = message.strip()

            if not message or label not in {"ham", "spam"}:
                continue

            messages.append(message)
            labels.append(1 if label == "spam" else 0)

    if not messages or len(set(labels)) != 2:
        raise ValueError(
            "SMS dataset must contain both ham and spam messages."
        )

    return messages, labels
def legit_url():
    p = random.choice(["", "/about", "/courses/cs101", f"/products/item-{random.randint(1,999)}", "/careers/students", "/help/contact"])
    return f"{random.choice(['https','https','https','http'])}://{random.choice(['','www.','portal.'])}{random.choice(LEGIT)}{p}"

def phish_url():
    b, k, k2, t = random.choice(BRANDS), random.choice(KW), random.choice(KW), random.choice(TLD)
    return random.choice([
        f"http://{b}-{k}.{t}/{k}/login?id={rnd(10)}",
        f"http://{random.randint(11,223)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}/{k}.php",
        f"https://{b}.{k}-{k2}.{t}/verify/{rnd(8)}",
        f"http://{b}.com@{rnd(7)}.{t}/",
        f"https://bit.ly/{rnd(7)}",
        f"https://{b}-india-{k}{random.randint(1,99)}.{t}/",
        f"https://{rnd(12)}.{t}/{k}",
        f"https://secure.{b}.{k}.{rnd(5)}-{k2}.{t}/{k}/{k2}"])

def url_data():
    path = os.path.join(HERE, "data", "urls.csv")
    if os.path.exists(path):
        rows = list(csv.DictReader(open(path, encoding="utf-8")))
        return [r["url"] for r in rows], [int(r["label"]) for r in rows], "real dataset"
    X = [legit_url() for _ in range(1500)] + [phish_url() for _ in range(1500)]
    return X, [0]*1500 + [1]*1500, "SYNTHETIC data (replace with data/urls.csv for real metrics)"

SC = ["Dear student, your scholarship of Rs {a} is approved. Pay registration fee Rs {f} at {u} to claim now",
 "URGENT: your {b} account will be blocked today. Update KYC at {u} immediately and share OTP",
 "Congratulations! You are selected for internship at {b}. Pay Rs {f} security deposit to confirm",
 "Aapka {b} KYC expire ho gaya hai. Abhi {u} par click karke update karein warna account band ho jayega",
 "Exam fee payment failed. Pay again within 24 hours at {u} or admission will be cancelled",
 "Scholarship ka Rs {a} aapke naam hai. Claim karne ke liye OTP aur UPI PIN bhejein",
 "You received refund of Rs {a}. Enter UPI PIN to receive money {u}"]
OK = ["Hi, the {s} class is rescheduled to {t} pm. Please check the college portal.",
 "Your OTP for login is {o}. Do not share it with anyone. - {b}",
 "Reminder: assignment submission deadline is Friday. Regards, placement cell",
 "Thanks, your fee of Rs {f} was received at the accounts office. Receipt attached.",
 "Kal ki class {t} baje hogi, notes group mein share kar diye hain",
 "Your order has shipped and will arrive by Friday. Track it in the official app.",
 "Meeting with the project guide at {t} pm. Bring your report draft."]

def msgs():
    fill = lambda s: s.format(a=random.randint(5,50)*1000, f=random.randint(2,30)*500, u=phish_url(),
                              b=random.choice(BRANDS), s=random.choice(["DBMS","OS","AI","Maths"]),
                              t=random.randint(1,6), o=random.randint(100000,999999))
    X = [fill(random.choice(SC)) for _ in range(400)] + [fill(random.choice(OK)) for _ in range(400)]
    return X, [1]*400 + [0]*400

def report(name, y, pred):
    p, r, f, _ = precision_recall_fscore_support(y, pred, average="binary")
    cm = confusion_matrix(y, pred)
    print(f"\n== {name} ==\n{classification_report(y, pred, digits=3)}\nConfusion matrix [[TN FP],[FN TP]]:\n{cm}")
    return {"precision": round(float(p),3), "recall": round(float(r),3), "f1": round(float(f),3), "false_positives": int(cm[0][1])}

def hostname_group(url):
    """Group URLs by hostname to reduce train/test leakage."""
    try:
        value = str(url).strip()
        if "://" not in value:
            value = "https://" + value

        host = urlparse(value).hostname
        if host:
            return host.lower().rstrip(".")

    except ValueError:
        pass

    return "invalid:" + str(url).strip()

def main():
    urls, y, src = url_data()
    print("URL training source:", src)

    if not urls or len(urls) != len(y):
        raise ValueError("Dataset is empty or URL/label counts differ.")

    if set(y) != {0, 1}:
        raise ValueError(f"Expected labels 0 and 1, found {set(y)}")

    print(f"Total URLs: {len(urls):,}")
    print(f"Legitimate: {y.count(0):,}")
    print(f"Phishing:   {y.count(1):,}")

    # Extract features from URLs.
    X = [vector(extract(u)) for u in urls]
    groups = [hostname_group(u) for u in urls]

    # Keep each hostname in either train or test, never both.
    splitter = StratifiedGroupKFold(
        n_splits=5,
        shuffle=True,
        random_state=1
    )

    train_idx, test_idx = next(
        splitter.split(X, y, groups=groups)
    )

    Xtr = [X[i] for i in train_idx]
    Xte = [X[i] for i in test_idx]
    ytr = [y[i] for i in train_idx]
    yte = [y[i] for i in test_idx]

    train_hosts = {groups[i] for i in train_idx}
    test_hosts = {groups[i] for i in test_idx}
    overlap = train_hosts & test_hosts

    if overlap:
        raise RuntimeError("Hostname leakage detected.")

    if len(set(ytr)) < 2 or len(set(yte)) < 2:
        raise ValueError("Train/test split is missing a class.")

    print(f"Training rows: {len(train_idx):,}")
    print(f"Testing rows:  {len(test_idx):,}")
    print(f"Train/test hostname overlap: {len(overlap)}")

    
    um = make_pipeline(
        StandardScaler(),
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=7
        )
    )

    um.fit(Xtr, ytr)

    m1 = report(
        "URL model (hostname-grouped test)",
        yte,
        um.predict(Xte)
    )

    
    # Train message model on real SMS spam data.
    mt, my = load_sms_data()

    print(f"\nTotal SMS messages: {len(mt):,}")
    print(f"Spam messages: {sum(my):,}")
    print(f"Normal messages: {len(my) - sum(my):,}")

    Mtr, Mte, mytr, myte = train_test_split(
        mt,
        my,
        test_size=0.25,
        random_state=7,
        stratify=my
    )

    mm = make_pipeline(
        TfidfVectorizer(
            ngram_range=(1, 2),
            lowercase=True,
            sublinear_tf=True
        ),
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=7
        )
    )

    mm.fit(Mtr, mytr)

    m2 = report(
        "SMS model (real SMS dataset)",
        myte,
        mm.predict(Mte)
    )


    joblib.dump(um, f"{OUT}/url.joblib")
    joblib.dump(mm, f"{OUT}/msg.joblib")

    metrics = {
        "data": src,
        "evaluation": "stratified hostname-grouped holdout",
        "train_rows": len(train_idx),
        "test_rows": len(test_idx),
        "train_test_hostname_overlap": len(overlap),
        "url": m1,
        "message": m2,
        "message_data": "synthetic"
    }

    with open(f"{OUT}/metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nModels saved to: {OUT}")
    print("Metrics saved to: models/metrics.json")


if __name__ == "__main__":
    main()
