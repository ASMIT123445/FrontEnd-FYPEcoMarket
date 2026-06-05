import { useEffect } from 'react';
import { FaTimes, FaLeaf, FaShieldAlt, FaStore, FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';

/**
 * TermsModal — reusable modal for Terms & Conditions, Authenticity Policy, or Privacy Policy.
 * Props:
 *   type: 'terms' | 'authenticity' | 'privacy'
 *   onClose: () => void
 */
export default function TermsModal({ type = 'terms', onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const isTerms = type === 'terms';

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="tm-header">
          <div className="tm-header-icon">
            {type === 'privacy' ? '🔒' : isTerms ? <FaLeaf /> : <FaShieldAlt />}
          </div>
          <div>
            <h2 className="tm-title">
              {isTerms ? 'Terms of Service' : type === 'privacy' ? 'Privacy Policy' : 'Authenticity Policy'}
            </h2>
            <p className="tm-subtitle">Ecomarket · Effective June 2025</p>
          </div>
          <button className="tm-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="tm-body">
          {isTerms ? <TermsContent /> : type === 'privacy' ? <PrivacyContent /> : <AuthenticityContent />}
        </div>

        {/* Footer */}
        <div className="tm-footer">
          <button className="tm-btn" onClick={onClose}>
            I've Read This — Close
          </button>
        </div>
      </div>

      <style>{`
        .tm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .tm-modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 680px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.25);
          overflow: hidden;
        }
        .tm-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px 28px;
          background: linear-gradient(135deg, #1B5E20, #2E7D32);
          color: white;
          flex-shrink: 0;
        }
        .tm-header-icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .tm-title {
          margin: 0 0 3px;
          font-size: 1.15rem;
          font-weight: 800;
          color: white;
        }
        .tm-subtitle {
          margin: 0;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.7);
        }
        .tm-close {
          margin-left: auto;
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .tm-close:hover { background: rgba(255,255,255,0.3); }

        .tm-body {
          overflow-y: auto;
          padding: 28px;
          flex: 1;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.7;
        }
        .tm-body h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1B5E20;
          margin: 24px 0 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tm-body h3:first-child { margin-top: 0; }
        .tm-body p { margin: 0 0 10px; }
        .tm-body ul {
          margin: 6px 0 12px 18px;
          padding: 0;
        }
        .tm-body ul li { margin-bottom: 5px; }
        .tm-divider {
          height: 1px;
          background: #e8ecf0;
          margin: 20px 0;
        }
        .tm-highlight {
          background: #f0fdf4;
          border-left: 4px solid #2E7D32;
          border-radius: 0 8px 8px 0;
          padding: 12px 16px;
          margin: 12px 0;
          font-size: 0.85rem;
          color: #1B5E20;
        }
        .tm-warning {
          background: #fff8e1;
          border-left: 4px solid #f59e0b;
          border-radius: 0 8px 8px 0;
          padding: 12px 16px;
          margin: 12px 0;
          font-size: 0.85rem;
          color: #78350f;
        }

        .tm-footer {
          padding: 18px 28px;
          border-top: 1px solid #e8ecf0;
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
          background: #f9fafb;
        }
        .tm-btn {
          padding: 11px 28px;
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .tm-btn:hover { background: #1B5E20; }

        @media (max-width: 520px) {
          .tm-modal { border-radius: 16px; }
          .tm-header { padding: 18px 20px; }
          .tm-body { padding: 20px; }
          .tm-footer { padding: 14px 20px; }
        }
      `}</style>
    </div>
  );
}

// ── Terms & Conditions content ────────────────────────────────
function TermsContent() {
  return (
    <>
      <div className="tm-highlight">
        Please read these terms carefully before completing your seller registration on Ecomarket.
        By checking the box, you agree to be bound by these terms.
      </div>

      <h3><FaStore /> 1. Seller Eligibility</h3>
      <p>To sell on Ecomarket, you must:</p>
      <ul>
        <li>Be at least 18 years of age</li>
        <li>Have a valid government-issued ID</li>
        <li>Operate a legitimate business or be an individual artisan/producer</li>
        <li>Provide accurate and truthful information during onboarding</li>
      </ul>

      <div className="tm-divider" />

      <h3><FaLeaf /> 2. Eco-Friendly Product Standards</h3>
      <p>All products listed on Ecomarket must meet our sustainability standards:</p>
      <ul>
        <li>Products must be genuinely eco-friendly, organic, recycled, or sustainably produced</li>
        <li>Misleading "greenwashing" claims are strictly prohibited</li>
        <li>Ecomarket reserves the right to remove any product that does not meet these standards</li>
        <li>Sellers may be asked to provide certifications or proof of eco-credentials</li>
      </ul>

      <div className="tm-divider" />

      <h3>3. Listing & Pricing</h3>
      <ul>
        <li>All product descriptions must be accurate and not misleading</li>
        <li>Prices must be listed in Nepalese Rupees (NPR)</li>
        <li>Sellers are responsible for maintaining accurate stock levels</li>
        <li>Ecomarket does not set or control seller pricing</li>
      </ul>

      <div className="tm-divider" />

      <h3>4. Orders & Fulfillment</h3>
      <ul>
        <li>Sellers must fulfill confirmed orders within the agreed timeframe</li>
        <li>Order status must be updated promptly (processing → shipped → delivered)</li>
        <li>Sellers are responsible for proper packaging to prevent damage</li>
        <li>Failure to fulfill orders may result in account suspension</li>
      </ul>

      <div className="tm-divider" />

      <h3>5. Payments & Fees</h3>
      <ul>
        <li>Payments are processed via eSewa or Khalti</li>
        <li>Ecomarket may charge a platform commission on completed sales</li>
        <li>Payouts are processed after order delivery confirmation</li>
        <li>Sellers are responsible for their own tax obligations</li>
      </ul>

      <div className="tm-divider" />

      <h3>6. Account Verification</h3>
      <p>
        Your seller account will be reviewed by Ecomarket admin before you can list products.
        Verification typically takes 1–3 business days. You will be notified by email once approved.
      </p>

      <div className="tm-divider" />

      <h3>7. Prohibited Items</h3>
      <p>The following are strictly prohibited on Ecomarket:</p>
      <ul>
        <li>Counterfeit or replica products</li>
        <li>Hazardous or illegal materials</li>
        <li>Products making false health or environmental claims</li>
        <li>Items that violate intellectual property rights</li>
      </ul>

      <div className="tm-divider" />

      <h3>8. Account Suspension & Termination</h3>
      <p>
        Ecomarket reserves the right to suspend or terminate seller accounts for violations of these
        terms, fraudulent activity, or repeated customer complaints. Sellers will be notified and
        given an opportunity to appeal.
      </p>

      <div className="tm-divider" />

      <h3><FaEnvelope /> 9. Contact</h3>
      <p>
        For questions about these terms, contact us at{' '}
        <strong>support@ecomarket.com.np</strong> or through the Help section in your seller dashboard.
      </p>

      <div className="tm-warning">
        These terms were last updated in June 2025. Ecomarket reserves the right to update these
        terms with reasonable notice to sellers.
      </div>
    </>
  );
}

// ── Authenticity Policy content ───────────────────────────────
function AuthenticityContent() {
  return (
    <>
      <div className="tm-highlight">
        Ecomarket is committed to ensuring every product on our platform is genuine, eco-friendly,
        and honestly represented. This policy outlines your obligations as a seller.
      </div>

      <h3><FaShieldAlt /> 1. Product Authenticity</h3>
      <p>By agreeing to this policy, you confirm that:</p>
      <ul>
        <li>All products you list are genuine and as described</li>
        <li>You are the rightful owner or authorized seller of these products</li>
        <li>Product images accurately represent the actual item being sold</li>
        <li>No counterfeit, replica, or misrepresented goods will be listed</li>
      </ul>

      <div className="tm-divider" />

      <h3><FaLeaf /> 2. Eco-Credentials</h3>
      <ul>
        <li>Any eco-friendly, organic, or sustainability claims must be truthful and verifiable</li>
        <li>You must be able to provide supporting documentation if requested</li>
        <li>Vague or unsubstantiated environmental claims ("100% natural", "eco-friendly") without
            basis are not permitted</li>
        <li>Certifications (organic, fair trade, recycled content) must be current and valid</li>
      </ul>

      <div className="tm-divider" />

      <h3>3. Document Verification</h3>
      <p>
        The ID proof and business documents you upload during onboarding must be:
      </p>
      <ul>
        <li>Genuine, unaltered government or business documents</li>
        <li>Belonging to you or your registered business</li>
        <li>Current and not expired</li>
      </ul>
      <p>
        Submitting fraudulent documents is a serious violation and will result in immediate
        account termination and may be reported to relevant authorities.
      </p>

      <div className="tm-divider" />

      <h3>4. Consequences of Violation</h3>
      <p>Violations of this authenticity policy may result in:</p>
      <ul>
        <li>Immediate removal of the offending product listing</li>
        <li>Temporary suspension of your seller account</li>
        <li>Permanent account termination for serious or repeated violations</li>
        <li>Withholding of pending payouts pending investigation</li>
      </ul>

      <div className="tm-divider" />

      <h3>5. Reporting</h3>
      <p>
        Buyers and other sellers can report suspected authenticity violations. All reports are
        reviewed by the Ecomarket team within 48 hours. Sellers under investigation will be
        notified and given a chance to respond.
      </p>

      <div className="tm-warning">
        <FaExclamationTriangle style={{ marginRight: 6 }} />
        Ecomarket takes authenticity seriously. Our platform's reputation depends on every seller
        upholding these standards. Thank you for your commitment to honest, sustainable commerce.
      </div>
    </>
  );
}

// ── Privacy Policy content ────────────────────────────────────
function PrivacyContent() {
  return (
    <>
      <div className="tm-highlight">
        This Privacy Policy explains how Ecomarket collects, uses, and protects your personal
        information when you use our platform.
      </div>

      <h3>1. Information We Collect</h3>
      <p>When you use Ecomarket, we may collect:</p>
      <ul>
        <li><strong>Account information</strong> — name, username, email address, phone number</li>
        <li><strong>Shipping information</strong> — delivery address, city, postal code</li>
        <li><strong>Payment information</strong> — payment method type (we do not store card numbers; payments are processed by eSewa or Khalti)</li>
        <li><strong>Order history</strong> — products purchased, order status, transaction IDs</li>
        <li><strong>Usage data</strong> — pages visited, search queries, product views</li>
      </ul>

      <div className="tm-divider" />

      <h3>2. How We Use Your Information</h3>
      <p>We use your information to:</p>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Send order confirmations and status updates by email</li>
        <li>Manage your account and Green Points balance</li>
        <li>Improve our platform and personalize your experience</li>
        <li>Prevent fraud and ensure platform security</li>
        <li>Comply with legal obligations</li>
      </ul>

      <div className="tm-divider" />

      <h3>3. Sharing Your Information</h3>
      <p>We do <strong>not</strong> sell your personal data. We may share it with:</p>
      <ul>
        <li><strong>Sellers</strong> — your name, shipping address, and phone number are shared with the seller to fulfill your order</li>
        <li><strong>Payment processors</strong> — eSewa and Khalti receive transaction data to process payments</li>
        <li><strong>Legal authorities</strong> — if required by law or to protect our rights</li>
      </ul>

      <div className="tm-divider" />

      <h3>4. Data Security</h3>
      <p>
        We take reasonable measures to protect your data, including encrypted connections (HTTPS)
        and secure password storage. However, no system is 100% secure — please use a strong,
        unique password for your account.
      </p>

      <div className="tm-divider" />

      <h3>5. Cookies</h3>
      <p>
        Ecomarket uses browser storage (localStorage) to keep you logged in and remember your
        cart and wishlist. We do not use third-party tracking cookies.
      </p>

      <div className="tm-divider" />

      <h3>6. Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your account and associated data</li>
        <li>Opt out of non-essential communications</li>
      </ul>
      <p>To exercise these rights, contact us at <strong>support@ecomarket.com.np</strong>.</p>

      <div className="tm-divider" />

      <h3>7. Data Retention</h3>
      <p>
        We retain your account data for as long as your account is active. Order records are
        kept for up to 3 years for legal and accounting purposes. You may request deletion
        of your account at any time.
      </p>

      <div className="tm-divider" />

      <h3>8. Children's Privacy</h3>
      <p>
        Ecomarket is not intended for users under 18. We do not knowingly collect personal
        information from minors.
      </p>

      <div className="tm-warning">
        This policy may be updated periodically. Continued use of Ecomarket after changes
        constitutes acceptance of the updated policy. Last updated: June 2025.
      </div>
    </>
  );
}
