export const metadata = {
  title: "Privacy Policy | CuradorOS",
};

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        background: "#07070f",
        color: "#ede8df",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        padding: "60px 24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "#8a87a8",
            marginBottom: 8,
          }}
        >
          C&Uacute;RADOR Brands
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#ede8df",
            marginBottom: 8,
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "#8a87a8", marginBottom: 40 }}>
          Effective Date: April 15, 2026
        </p>

        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#c4c0b8" }}>
          <Section title="1. Introduction">
            C&Uacute;RADOR Brands, LLC (&quot;C&Uacute;RADOR,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the
            CuradorOS platform, including MarketingOS and related tools
            (collectively, the &quot;Platform&quot;). This Privacy Policy
            describes how we collect, use, and protect information when you
            access or use the Platform.
          </Section>

          <Section title="2. Information We Collect">
            <strong>Account Information:</strong> When you sign in using Google
            OAuth, we receive your name, email address, and Google profile
            identifier. We do not receive or store your Google password.
            <br />
            <br />
            <strong>Usage Data:</strong> We collect information about how you
            interact with the Platform, including pages visited, features used,
            and actions taken within the application.
            <br />
            <br />
            <strong>Content You Provide:</strong> Any content you create, upload,
            or share through the Platform &mdash; including marketing materials,
            notes, campaign data, and digital assets &mdash; is stored to provide
            the services you request.
          </Section>

          <Section title="3. How We Use Your Information">
            We use the information we collect to:
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Authenticate your identity and manage access</li>
              <li>Provide, maintain, and improve the Platform</li>
              <li>Enable collaboration among authorized team members</li>
              <li>Communicate with you about the Platform</li>
              <li>Ensure security and prevent unauthorized access</li>
            </ul>
          </Section>

          <Section title="4. Information Sharing">
            We do not sell, rent, or trade your personal information. We may
            share information only in the following circumstances:
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                <strong>Within your organization:</strong> Content and activity
                may be visible to other authorized users within your team.
              </li>
              <li>
                <strong>Service providers:</strong> We use third-party services
                (including cloud hosting, authentication, and AI providers) that
                process data on our behalf under contractual obligations to
                protect your information.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information
                if required by law, regulation, or legal process.
              </li>
            </ul>
          </Section>

          <Section title="5. Data Storage and Security">
            Your data is stored on secure, encrypted cloud infrastructure. We
            implement industry-standard security measures including encrypted
            connections (TLS), access controls, and regular security reviews. No
            system is 100% secure, and we cannot guarantee absolute security.
          </Section>

          <Section title="6. Data Retention">
            We retain your information for as long as your account is active or
            as needed to provide the Platform services. You may request deletion
            of your account and associated data by contacting us.
          </Section>

          <Section title="7. Third-Party Services">
            The Platform integrates with third-party services including Google
            (authentication), Anthropic (AI features), and cloud infrastructure
            providers. These services have their own privacy policies, and we
            encourage you to review them.
          </Section>

          <Section title="8. Your Rights">
            You may request access to, correction of, or deletion of your
            personal information by contacting us at the address below. We will
            respond to requests within 30 days.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify
            users of material changes through the Platform or by email.
          </Section>

          <Section title="10. Contact Us">
            If you have questions about this Privacy Policy, contact us at:
            <br />
            <br />
            C&Uacute;RADOR Brands, LLC
            <br />
            Email: privacy@curadorbrands.com
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#ede8df",
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
