export const metadata = {
  title: "Terms of Service | CuradorOS",
};

export default function TermsOfService() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: "#8a87a8", marginBottom: 40 }}>
          Effective Date: April 15, 2026
        </p>

        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#c4c0b8" }}>
          <Section title="1. Acceptance of Terms">
            By accessing or using the CuradorOS platform, including MarketingOS
            and related tools (the &quot;Platform&quot;), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the
            Platform.
          </Section>

          <Section title="2. Access and Authorization">
            The Platform is provided by C&Uacute;RADOR Brands, LLC for use by
            authorized personnel and approved collaborators only. Access is
            granted at our discretion and may be revoked at any time. You are
            responsible for maintaining the security of your account credentials.
          </Section>

          <Section title="3. Acceptable Use">
            You agree to use the Platform only for its intended business
            purposes. You may not:
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                Share access credentials or allow unauthorized users to access
                the Platform
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Platform
              </li>
              <li>
                Use the Platform for any unlawful purpose or in violation of any
                applicable laws or regulations
              </li>
              <li>
                Interfere with or disrupt the Platform or its infrastructure
              </li>
              <li>
                Reverse-engineer, decompile, or attempt to extract the source
                code of the Platform
              </li>
            </ul>
          </Section>

          <Section title="4. Intellectual Property">
            All content, features, and functionality of the Platform are owned by
            C&Uacute;RADOR Brands, LLC and are protected by intellectual
            property laws. Content you create through the Platform remains your
            property, but you grant us a license to host, store, and display it
            as necessary to provide the Platform services.
          </Section>

          <Section title="5. Content and Data">
            You are responsible for the content you create, upload, and share
            through the Platform. We do not claim ownership of your content but
            require certain rights to operate the Platform. Content may be
            visible to other authorized users within your organization.
          </Section>

          <Section title="6. AI-Powered Features">
            The Platform includes AI-assisted features powered by third-party
            providers. AI-generated content is provided as a starting point and
            should be reviewed before use. We do not guarantee the accuracy,
            completeness, or suitability of AI-generated outputs.
          </Section>

          <Section title="7. Availability and Modifications">
            We strive to keep the Platform available but do not guarantee
            uninterrupted access. We reserve the right to modify, suspend, or
            discontinue any part of the Platform at any time with reasonable
            notice when possible.
          </Section>

          <Section title="8. Limitation of Liability">
            The Platform is provided &quot;as is&quot; without warranties of any
            kind. To the fullest extent permitted by law, C&Uacute;RADOR Brands,
            LLC shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the Platform.
          </Section>

          <Section title="9. Termination">
            We may terminate or suspend your access at any time for any reason,
            including violation of these Terms. Upon termination, your right to
            use the Platform ceases immediately.
          </Section>

          <Section title="10. Governing Law">
            These Terms are governed by the laws of the State of Missouri,
            without regard to conflict of law principles.
          </Section>

          <Section title="11. Changes to Terms">
            We may update these Terms from time to time. Continued use of the
            Platform after changes constitutes acceptance of the updated Terms.
          </Section>

          <Section title="12. Contact">
            Questions about these Terms may be directed to:
            <br />
            <br />
            C&Uacute;RADOR Brands, LLC
            <br />
            Email: legal@curadorbrands.com
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
