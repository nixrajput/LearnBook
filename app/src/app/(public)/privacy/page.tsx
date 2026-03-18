import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-16 sm:px-6 md:py-24">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 19, 2026</p>

      <div className="prose prose-sm prose-neutral max-w-none space-y-8 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="leading-relaxed text-muted-foreground">
            When you sign in with Google or GitHub, we receive your name, email address, and profile
            picture from your OAuth provider. We also collect data you create within the Service,
            including notes, bookmarks, highlights, reading progress, and preferences.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <p className="leading-relaxed text-muted-foreground">
            We use your information to provide and improve the Service, including: authenticating
            your identity, displaying your profile, syncing your reading data across devices,
            generating reading analytics, and communicating service updates. We do not sell your
            personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Data Storage and Security</h2>
          <p className="leading-relaxed text-muted-foreground">
            Your data is stored in secure databases with encryption at rest. We use
            industry-standard security practices including HTTPS, secure session management, and
            access controls. Payment information is processed by Stripe and is never stored on our
            servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Cookies and Local Storage</h2>
          <p className="leading-relaxed text-muted-foreground">
            We use essential cookies for authentication (session tokens) and local storage for theme
            preferences. We do not use tracking cookies or third-party analytics that identify
            individual users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Third-Party Services</h2>
          <p className="leading-relaxed text-muted-foreground">
            We integrate with the following third-party services: Google and GitHub
            (authentication), Stripe (payment processing). Each service has its own privacy policy.
            We only share the minimum information necessary for each service to function.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Data Retention</h2>
          <p className="leading-relaxed text-muted-foreground">
            We retain your data for as long as your account is active. When you delete your account,
            all associated data (notes, bookmarks, progress, preferences) is permanently deleted
            within 30 days. Backups containing your data are purged on a rolling 90-day schedule.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Your Rights</h2>
          <p className="leading-relaxed text-muted-foreground">
            You have the right to: access your data (via the Export feature), correct your profile
            information, delete your account and all associated data, and withdraw consent for data
            processing by deleting your account. If you are in the EU/EEA, you may also exercise
            rights under GDPR including data portability and the right to lodge a complaint with a
            supervisory authority.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Children&apos;s Privacy</h2>
          <p className="leading-relaxed text-muted-foreground">
            The Service is not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If we become aware that a child under 13 has
            provided us with personal information, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Changes to This Policy</h2>
          <p className="leading-relaxed text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify you of material
            changes via email or through the Service. Continued use of the Service after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">10. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            If you have questions about this Privacy Policy or your data, please contact us at
            privacy@learnbook.app.
          </p>
        </section>
      </div>
    </div>
  );
}
