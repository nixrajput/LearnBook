import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-16 sm:px-6 md:py-24">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 19, 2026</p>

      <div className="prose prose-sm prose-neutral max-w-none space-y-8 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            By accessing or using LearnBook (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, you may not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p className="leading-relaxed text-muted-foreground">
            LearnBook is a web-based reading and learning platform that allows users to read
            structured course content, take notes, create bookmarks and highlights, and track
            reading progress. The Service is available in free and paid tiers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. User Accounts</h2>
          <p className="leading-relaxed text-muted-foreground">
            You must create an account using a supported OAuth provider (Google or GitHub) to use
            the Service. You are responsible for maintaining the security of your account and all
            activities that occur under it. You must be at least 13 years old to use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Subscription and Billing</h2>
          <p className="leading-relaxed text-muted-foreground">
            Paid plans are billed monthly or yearly through Stripe. You may cancel your subscription
            at any time. Upon cancellation, your account will be downgraded to the free tier at the
            end of the current billing period. All fees are non-refundable except as required by law
            or as stated in our 14-day money-back guarantee.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. User Content</h2>
          <p className="leading-relaxed text-muted-foreground">
            You retain ownership of all notes, bookmarks, highlights, and other content you create
            within the Service. By using the Service, you grant us a limited license to store and
            display your content solely for the purpose of providing the Service to you. We do not
            sell, share, or use your content for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Acceptable Use</h2>
          <p className="leading-relaxed text-muted-foreground">
            You agree not to misuse the Service, including but not limited to: attempting to gain
            unauthorized access to other users&apos; data, using the Service for unlawful purposes,
            uploading malicious content, or interfering with the operation of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Intellectual Property</h2>
          <p className="leading-relaxed text-muted-foreground">
            Course content available on the platform is provided by content creators and is
            protected by copyright. You may not reproduce, distribute, or create derivative works
            from course content without explicit permission from the content owner.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
          <p className="leading-relaxed text-muted-foreground">
            The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum
            extent permitted by law, LearnBook shall not be liable for any indirect, incidental,
            special, or consequential damages arising out of or in connection with your use of the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Termination</h2>
          <p className="leading-relaxed text-muted-foreground">
            We reserve the right to suspend or terminate your account if you violate these terms.
            You may delete your account at any time from the Profile page. Upon deletion, all your
            data will be permanently removed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">10. Changes to Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            We may update these terms from time to time. We will notify you of material changes via
            email or through the Service. Continued use of the Service after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">11. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            If you have questions about these Terms of Service, please contact us at
            support@learnbook.app.
          </p>
        </section>
      </div>
    </div>
  );
}
