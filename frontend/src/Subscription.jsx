
// import { useState } from "react";
// import "./subscription.css";

// const API_BASE = (
//   import.meta.env.VITE_API || "http://localhost:8010"
// ).replace(/\/+$/, "");

// const plans = [
//   {
//     name: "Free",
//     description: "Build safer online habits.",
//     monthly: 0,
//     yearly: 0,
//     label: "GET STARTED",
//     features: [
//       "Basic URL scanning",
//       "Basic message analysis",
//       "Limited monthly scans",
//       "Basic risk explanations",
//     ],
//     missing: [
//       "Advanced QR / UPI analysis",
//       "Detailed reports",
//       "Higher scan limits",
//     ],
//     action: "Start for free",
//     href: "#/signup",
//   },
//   {
//     name: "Pro",
//     description: "For everyday digital protection.",
//     monthly: 199,
//     yearly: 1990,
//     label: "BEST FOR EVERYDAY USE",
//     features: [
//       "Everything in Free",
//       "QR / UPI analysis",
//       "Screenshot and image analysis",
//       "Detailed scan explanations",
//       "Extended scan history",
//       "Higher usage limits",
//     ],
//     missing: ["Priority support"],
//     action: "Choose Pro",
//     popular: true,
//   },
//   {
//     name: "Premium",
//     description: "More tools for frequent analysis.",
//     monthly: 399,
//     yearly: 3990,
//     label: "MAXIMUM ACCESS",
//     features: [
//       "Everything in Pro",
//       "Higher scan limits",
//       "Offer-letter analysis, when available",
//       "Detailed reports",
//       "Extended history",
//       "Priority support, when available",
//     ],
//     missing: [],
//     action: "Choose Premium",
//   },
// ];

// function formatPrice(price) {
//   return price.toLocaleString("en-IN");
// }

// function getPlanId(planName, yearly) {
//   const prefix = planName.toLowerCase();
//   return `${prefix}_${yearly ? "yearly" : "monthly"}`;
// }

// function loadRazorpayScript() {
//   return new Promise((resolve, reject) => {
//     if (window.Razorpay) {
//       resolve(true);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;

//     script.onload = () => resolve(true);
//     script.onerror = () =>
//       reject(new Error("Could not load Razorpay Checkout. Check your internet connection."));

//     document.body.appendChild(script);
//   });
// }

// export default function Subscription() {
//   const [yearly, setYearly] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [notice, setNotice] = useState("");
//   const [noticeType, setNoticeType] = useState("info");

//   async function handlePayment(plan) {
//     if (processing) return;

//     setProcessing(true);
//     setNotice("");
//     setNoticeType("info");

//     try {
//       // Load Razorpay's checkout library.
//       await loadRazorpayScript();

//       // Ask our backend to create the order.
//       const orderResponse = await fetch(`${API_BASE}/api/create-order`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({
//           plan: getPlanId(plan.name, yearly),
//         }),
//       });

//       const orderData = await orderResponse.json().catch(() => ({}));

//       if (!orderResponse.ok) {
//         throw new Error(
//           orderData.detail || "Could not create the payment order."
//         );
//       }

//       if (
//         !orderData.order_id ||
//         !orderData.key_id ||
//         !orderData.amount
//       ) {
//         throw new Error("The server returned incomplete order details.");
//       }

//       const options = {
//         key: orderData.key_id,
//         amount: orderData.amount,
//         currency: orderData.currency || "INR",
//         name: "PhishShield",
//         description: `${plan.name} ${yearly ? "Yearly" : "Monthly"} Plan`,
//         order_id: orderData.order_id,

//         handler: async function (paymentResponse) {
//           setNotice("Payment received. Verifying payment securely...");
//           setNoticeType("info");

//           try {
//             const verifyResponse = await fetch(
//               `${API_BASE}/api/verify-payment`,
//               {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Accept: "application/json",
//                 },
//                 body: JSON.stringify({
//                   razorpay_order_id: paymentResponse.razorpay_order_id,
//                   razorpay_payment_id: paymentResponse.razorpay_payment_id,
//                   razorpay_signature: paymentResponse.razorpay_signature,
//                 }),
//               }
//             );

//             const verification = await verifyResponse
//               .json()
//               .catch(() => ({}));

//             if (!verifyResponse.ok || verification.verified !== true) {
//               throw new Error(
//                 verification.detail || "Payment verification failed."
//               );
//             }

//             setNotice(
//               "Payment signature verified successfully. Pro/Premium access is not activated yet; subscription activation and database storage still need to be implemented."
//             );
//             setNoticeType("success");
//           } catch (error) {
//             setNotice(
//               error.message ||
//                 "Payment was received, but verification could not be completed. Please contact support before trying to pay again."
//             );
//             setNoticeType("error");
//           } finally {
//             setProcessing(false);
//           }
//         },

//         modal: {
//           ondismiss: function () {
//             setProcessing(false);
//             setNotice("Checkout closed. No subscription activation was performed.");
//             setNoticeType("info");
//           },
//         },

//         theme: {
//           color: "#16a085",
//         },
//       };

//       const checkout = new window.Razorpay(options);

//       checkout.on("payment.failed", function (response) {
//         setProcessing(false);
//         setNotice(
//           response.error?.description ||
//             "Payment failed. Please check the payment details and try again."
//         );
//         setNoticeType("error");
//       });

//       checkout.open();
//     } catch (error) {
//       setNotice(error.message || "Unable to start checkout.");
//       setNoticeType("error");
//       setProcessing(false);
//     }
//   }

//   return (
//     <main className="subscription-page">
//       <section className="subscription-hero">
//         <span className="subscription-eyebrow">
//           PHISHSHIELD / MEMBERSHIP
//         </span>

//         <h1>
//           Protection that fits <span>your needs.</span>
//         </h1>

//         <p>
//           Start free. Upgrade when you need more tools, deeper analysis,
//           and higher usage limits.
//         </p>

//         <div className="billing-toggle" aria-label="Billing frequency">
//           <button
//             type="button"
//             className={!yearly ? "active" : ""}
//             aria-pressed={!yearly}
//             onClick={() => setYearly(false)}
//             disabled={processing}
//           >
//             Monthly
//           </button>

//           <button
//             type="button"
//             className={yearly ? "active" : ""}
//             aria-pressed={yearly}
//             onClick={() => setYearly(true)}
//             disabled={processing}
//           >
//             Yearly <span>Save ~17%</span>
//           </button>
//         </div>

//         <p className="subscription-billing-caption">
//           {yearly
//             ? "Annual billing selected · Pay once per year"
//             : "Monthly billing selected · Flexible monthly pricing"}
//         </p>
//       </section>

//       {notice && (
//         <div
//           className={`subscription-payment-notice ${noticeType}`}
//           role="status"
//           aria-live="polite"
//         >
//           {notice}
//         </div>
//       )}

//       <section
//         className="subscription-plans"
//         aria-label="Available subscription plans"
//       >
//         {plans.map((plan) => {
//           const price = yearly ? plan.yearly : plan.monthly;
//           const monthlyEquivalent =
//             yearly && price > 0 ? Math.round(price / 12) : null;

//           return (
//             <article
//               className={`subscription-card ${
//                 plan.popular ? "popular" : ""
//               }`}
//               key={plan.name}
//             >
//               {plan.popular && (
//                 <span className="plan-popular-badge">
//                   MOST POPULAR
//                 </span>
//               )}

//               <p className="plan-label">{plan.label}</p>
//               <h2>{plan.name}</h2>
//               <p className="plan-description">{plan.description}</p>

//               <div className="plan-price">
//                 <strong>₹{formatPrice(price)}</strong>
//                 <span>
//                   {price === 0
//                     ? "/ forever"
//                     : yearly
//                       ? "/ year"
//                       : "/ month"}
//                 </span>
//               </div>

//               {monthlyEquivalent !== null && (
//                 <p className="plan-billing-note">
//                   About ₹{formatPrice(monthlyEquivalent)}/month, billed yearly
//                 </p>
//               )}

//               {!yearly && price > 0 && (
//                 <p className="plan-billing-note">
//                   Billed monthly · Cancel according to plan terms
//                 </p>
//               )}

//               {price === 0 && (
//                 <p className="plan-billing-note">
//                   No subscription payment
//                 </p>
//               )}

//               {plan.name === "Free" ? (
//                 <a className="plan-action" href="#/signup">
//                   {plan.action}
//                   <span aria-hidden="true"> ↗</span>
//                 </a>
//               ) : (
//                 <button
//                   className="plan-action"
//                   type="button"
//                   onClick={() => handlePayment(plan)}
//                   disabled={processing}
//                 >
//                   {processing ? "Processing..." : plan.action}
//                   {!processing && (
//                     <span aria-hidden="true"> ↗</span>
//                   )}
//                 </button>
//               )}

//               <div className="plan-divider" />

//               <p className="plan-includes">WHAT'S INCLUDED</p>

//               <ul className="plan-features">
//                 {plan.features.map((feature) => (
//                   <li key={feature}>
//                     <span className="feature-check" aria-hidden="true">
//                       ✓
//                     </span>
//                     <span>{feature}</span>
//                   </li>
//                 ))}

//                 {plan.missing.map((feature) => (
//                   <li className="feature-unavailable" key={feature}>
//                     <span aria-hidden="true">—</span>
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </article>
//           );
//         })}
//       </section>

//       <section className="subscription-note">
//         <span aria-hidden="true">ⓘ</span>
//         <p>
//           <strong>Payment security.</strong> Payments are processed using
//           Razorpay Checkout. A verified payment does not activate paid
//           features until subscription records, access controls, and
//           subscription management are implemented. Scan results are
//           estimates, not guarantees of safety.
//         </p>
//       </section>

//       <p className="subscription-back">
//         <a href="#/">← Back to PhishShield</a>
//       </p>
//     </main>
//   );
// }


import { useState } from "react";
import "./subscription.css";

const API_BASE = (import.meta.env.VITE_API || "http://localhost:8010").replace(/\/+$/, "");

const plans = [
  {
    name: "Free", description: "Build safer online habits.", monthly: 0, yearly: 0,
    label: "GET STARTED",
    features: ["Basic URL scanning", "Basic message analysis", "Limited monthly scans", "Basic risk explanations"],
    missing: ["Advanced QR / UPI analysis", "Detailed reports", "Higher scan limits"],
    action: "Start for free", href: "#/signup",
  },
  {
    name: "Pro", description: "For everyday digital protection.", monthly: 199, yearly: 1990,
    label: "BEST FOR EVERYDAY USE",
    features: ["Everything in Free", "QR / UPI analysis", "Screenshot and image analysis", "Detailed scan explanations", "Extended scan history", "Higher usage limits"],
    missing: ["Priority support"], action: "Choose Pro", popular: true,
  },
  {
    name: "Premium", description: "More tools for frequent analysis.", monthly: 399, yearly: 3990,
    label: "MAXIMUM ACCESS",
    features: ["Everything in Pro", "Higher scan limits", "Offer-letter analysis, when available", "Detailed reports", "Extended history", "Priority support, when available"],
    missing: [], action: "Choose Premium",
  },
];

function formatPrice(price) {
  return price.toLocaleString("en-IN");
}

function getPlanId(planName, yearly) {
  return `${planName.toLowerCase()}_${yearly ? "yearly" : "monthly"}`;
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay Checkout.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout. Check your internet connection."));
    document.body.appendChild(script);
  });
}

// Make sure this key matches the key used by your login code.
function getAuthToken() {
  for (const key of ["access_token", "token", "phishshield_token", "authToken"]) {
    const value = localStorage.getItem(key);
    if (value && value.trim()) return value.trim().replace(/^Bearer\s+/i, "");
  }
  return null;
}

async function readResponse(response) {
  return response.json().catch(() => ({}));
}

export default function Subscription() {
  const [yearly, setYearly] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");

  async function handlePayment(plan) {
    if (processing) return;

    const token = getAuthToken();
    if (!token) {
      setNotice("Please log in first, then return to Subscription and choose your plan.");
      setNoticeType("error");
      return;
    }

    setProcessing(true);
    setNotice("");
    setNoticeType("info");

    try {
      await loadRazorpayScript();

      const orderResponse = await fetch(`${API_BASE}/api/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: getPlanId(plan.name, yearly) }),
      });

      const orderData = await readResponse(orderResponse);
      if (!orderResponse.ok) {
        if (orderResponse.status === 401) {
          throw new Error("Your login session is missing or expired. Please log in again.");
        }
        throw new Error(orderData.detail || "Could not create the payment order.");
      }

      if (!orderData.order_id || !orderData.key_id || !orderData.amount) {
        throw new Error("The server returned incomplete order details.");
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "PhishShield",
        description: `${plan.name} ${yearly ? "Yearly" : "Monthly"} Plan`,
        order_id: orderData.order_id,

        handler: async function (paymentResponse) {
          setNotice("Payment received. Verifying payment securely...");
          setNoticeType("info");

          try {
            const verifyResponse = await fetch(`${API_BASE}/api/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verification = await readResponse(verifyResponse);
            if (!verifyResponse.ok || verification.verified !== true) {
              throw new Error(verification.detail || verification.message || "Payment verification failed.");
            }

            const expiryText = verification.expires_at
              ? new Date(verification.expires_at).toLocaleDateString()
              : null;

            setNotice(
              verification.message ||
                `Payment verified and ${verification.plan || plan.name} subscription activated${expiryText ? ` until ${expiryText}` : ""}.`
            );
            setNoticeType("success");
          } catch (error) {
            setNotice(error.message || "Payment was received, but verification could not be completed. Please contact support before trying to pay again.");
            setNoticeType("error");
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            setProcessing(false);
            setNotice("Checkout closed. If you completed a payment, check your account before trying again.");
            setNoticeType("info");
          },
        },
        theme: { color: "#16a085" },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", function (response) {
        setProcessing(false);
        setNotice(response.error?.description || "Payment failed. Please check the payment details and try again.");
        setNoticeType("error");
      });
      checkout.open();
    } catch (error) {
      setNotice(error.message || "Unable to start checkout.");
      setNoticeType("error");
      setProcessing(false);
    }
  }

  return (
    <main className="subscription-page">
      <section className="subscription-hero">
        <span className="subscription-eyebrow">PHISHSHIELD / MEMBERSHIP</span>
        <h1>Protection that fits <span>your needs.</span></h1>
        <p>Start free. Upgrade when you need more tools, deeper analysis, and higher usage limits.</p>

        <div className="billing-toggle" aria-label="Billing frequency">
          <button type="button" className={!yearly ? "active" : ""} aria-pressed={!yearly} onClick={() => setYearly(false)} disabled={processing}>Monthly</button>
          <button type="button" className={yearly ? "active" : ""} aria-pressed={yearly} onClick={() => setYearly(true)} disabled={processing}>Yearly <span>Save ~17%</span></button>
        </div>
        <p className="subscription-billing-caption">
          {yearly ? "Annual billing selected · Pay once per year" : "Monthly billing selected · Flexible monthly pricing"}
        </p>
      </section>

      {notice && (
        <div className={`subscription-payment-notice ${noticeType}`} role="status" aria-live="polite">
          {notice}
        </div>
      )}

      <section className="subscription-plans" aria-label="Available subscription plans">
        {plans.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          const monthlyEquivalent = yearly && price > 0 ? Math.round(price / 12) : null;

          return (
            <article className={`subscription-card ${plan.popular ? "popular" : ""}`} key={plan.name}>
              {plan.popular && <span className="plan-popular-badge">MOST POPULAR</span>}
              <p className="plan-label">{plan.label}</p>
              <h2>{plan.name}</h2>
              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <strong>₹{formatPrice(price)}</strong>
                <span>{price === 0 ? "/ forever" : yearly ? "/ year" : "/ month"}</span>
              </div>

              {monthlyEquivalent !== null && <p className="plan-billing-note">About ₹{formatPrice(monthlyEquivalent)}/month, billed yearly</p>}
              {!yearly && price > 0 && <p className="plan-billing-note">Billed monthly · Cancel according to plan terms</p>}
              {price === 0 && <p className="plan-billing-note">No subscription payment</p>}

              {plan.name === "Free" ? (
                <a className="plan-action" href="#/signup">{plan.action}<span aria-hidden="true"> ↗</span></a>
              ) : (
                <button className="plan-action" type="button" onClick={() => handlePayment(plan)} disabled={processing}>
                  {processing ? "Processing..." : plan.action}
                  {!processing && <span aria-hidden="true"> ↗</span>}
                </button>
              )}

              <div className="plan-divider" />
              <p className="plan-includes">WHAT'S INCLUDED</p>
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}><span className="feature-check" aria-hidden="true">✓</span><span>{feature}</span></li>
                ))}
                {plan.missing.map((feature) => (
                  <li className="feature-unavailable" key={feature}><span aria-hidden="true">—</span><span>{feature}</span></li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="subscription-note">
        <span aria-hidden="true">ⓘ</span>
        <p>
          <strong>Payment security.</strong> Payments are processed using Razorpay Checkout. A verified payment activates a subscription record on the server. Paid feature restrictions and subscription management must also be enforced by the backend. Scan results are estimates, not guarantees of safety.
        </p>
      </section>

      <p className="subscription-back"><a href="#/">← Back to PhishShield</a></p>
    </main>
  );
}
