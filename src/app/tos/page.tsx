import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.termsOfService;

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-orbitron cyber-text glow-text mb-4 text-4xl font-black text-white md:text-6xl">
            TERMS AND CONDITIONS
          </h1>
        </div>

        {/* Content */}
        <div className="font-rajdhani rounded-xl bg-gray-800/50 p-8 leading-relaxed text-gray-300 md:p-12">
          <p className="mb-8">
            These terms and conditions (&ldquo;Agreement&rdquo;) set forth the
            general terms and conditions of your use of the{" "}
            <a
              href="https://evalgaming.com"
              className="text-cyan-400 transition-colors hover:text-cyan-300"
            >
              evalgaming.com
            </a>{" "}
            website (&ldquo;Website&rdquo; or &ldquo;Service&rdquo;) and any of
            its related products and services (collectively,
            &ldquo;Services&rdquo;). This Agreement is legally binding between
            you (&ldquo;User&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo;)
            and EVAL Gaming Inc. (&ldquo;EVAL Gaming Inc.&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;). If you are
            entering into this Agreement on behalf of a business or other legal
            entity, you represent that you have the authority to bind such
            entity to this Agreement, in which case the terms
            &ldquo;User&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo; shall
            refer to such entity. If you do not have such authority, or if you
            do not agree with the terms of this Agreement, you must not accept
            this Agreement and may not access and use the Website and Services.
            By accessing and using the Website and Services, you acknowledge
            that you have read, understood, and agree to be bound by the terms
            of this Agreement. You acknowledge that this Agreement is a contract
            between you and EVAL Gaming Inc., even though it is electronic and
            is not physically signed by you, and it governs your use of the
            Website and Services.
          </p>

          {/* Table of Contents */}
          <div className="mb-8 rounded-lg bg-gray-700/50 p-6">
            <h3 className="font-orbitron mb-4 text-xl text-white">
              Table of contents
            </h3>
            <ol className="space-y-2 text-sm">
              <li>
                <a
                  href="#accounts-and-membership"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  1. Accounts and membership
                </a>
              </li>
              <li>
                <a
                  href="#user-content"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  2. User content
                </a>
              </li>
              <li>
                <a
                  href="#billing-and-payments"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  3. Billing and payments
                </a>
              </li>
              <li>
                <a
                  href="#accuracy-of-information"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  4. Accuracy of information
                </a>
              </li>
              <li>
                <a
                  href="#backups"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  5. Backups
                </a>
              </li>
              <li>
                <a
                  href="#links-to-other-resources"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  6. Links to other resources
                </a>
              </li>
              <li>
                <a
                  href="#prohibited-uses"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  7. Prohibited uses
                </a>
              </li>
              <li>
                <a
                  href="#disclaimer-of-warranty"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  8. Disclaimer of warranty
                </a>
              </li>
              <li>
                <a
                  href="#limitation-of-liability"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  9. Limitation of liability
                </a>
              </li>
              <li>
                <a
                  href="#indemnification"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  10. Indemnification
                </a>
              </li>
              <li>
                <a
                  href="#severability"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  11. Severability
                </a>
              </li>
              <li>
                <a
                  href="#dispute-resolution"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  12. Dispute resolution
                </a>
              </li>
              <li>
                <a
                  href="#changes-and-amendments"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  13. Changes and amendments
                </a>
              </li>
              <li>
                <a
                  href="#acceptance-of-these-terms"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  14. Acceptance of these terms
                </a>
              </li>
              <li>
                <a
                  href="#contacting-us"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  15. Contacting us
                </a>
              </li>
            </ol>
          </div>

          {/* Section 1 */}
          <section id="accounts-and-membership" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Accounts and membership
            </h2>
            <p className="mb-4">
              You must be at least 13 years of age to use the Website and
              Services. By using the Website and Services and by agreeing to
              this Agreement you warrant and represent that you are at least 13
              years of age. If you create an account on the Website, you are
              responsible for maintaining the security of your account and you
              are fully responsible for all activities that occur under the
              account and any other actions taken in connection with it. We may
              monitor and review new accounts before you may sign in and start
              using the Services. Providing false contact information of any
              kind may result in the termination of your account. You must
              immediately notify us of any unauthorized uses of your account or
              any other breaches of security. We will not be liable for any acts
              or omissions by you, including any damages of any kind incurred as
              a result of such acts or omissions. We may suspend, disable, or
              delete your account (or any part thereof) if we determine that you
              have violated any provision of this Agreement or that your conduct
              or content would tend to damage our reputation and goodwill. If we
              delete your account for the foregoing reasons, you may not
              re-register for our Services. We may block your email address and
              Internet protocol address to prevent further registration.
            </p>
          </section>

          {/* Section 2 */}
          <section id="user-content" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              User content
            </h2>
            <p className="mb-4">
              We do not own any data, information or material (collectively,
              &ldquo;Content&rdquo;) that you submit on the Website in the
              course of using the Service. You shall have sole responsibility
              for the accuracy, quality, integrity, legality, reliability,
              appropriateness, and intellectual property ownership or right to
              use of all submitted Content. We may monitor and review the
              Content on the Website submitted or created using our Services by
              you. You grant us permission to access, copy, distribute, store,
              transmit, reformat, display and perform the Content of your user
              account solely as required for the purpose of providing the
              Services to you. Without limiting any of those representations or
              warranties, we have the right, though not the obligation, to, in
              our own sole discretion, refuse or remove any Content that, in our
              reasonable opinion, violates any of our policies or is in any way
              harmful or objectionable. You also grant us the license to use,
              reproduce, adapt, modify, publish or distribute the Content
              created by you or stored in your user account for commercial,
              marketing or any similar purpose.
            </p>
          </section>

          {/* Section 3 */}
          <section id="billing-and-payments" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Billing and payments
            </h2>
            <p className="mb-4">
              You shall pay all fees or charges to your account in accordance
              with the fees, charges, and billing terms in effect at the time a
              fee or charge is due and payable. Where Services are offered on a
              free trial basis, payment may be required after the free trial
              period ends, and not when you enter your billing details (which
              may be required prior to the commencement of the free trial
              period). If auto-renewal is enabled for the Services you have
              subscribed for, your payment information will be securely saved
              and you will be charged automatically in accordance with the term
              you selected. Sensitive and private data exchange happens over a
              SSL secured communication channel and is encrypted and protected
              with digital signatures, and the Website and Services are also in
              compliance with PCI vulnerability standards in order to create as
              secure of an environment as possible for Users. Scans for malware
              are performed on a regular basis for additional security and
              protection. If, in our judgment, your purchase constitutes a
              high-risk transaction, we will require you to provide us with a
              copy of your valid government-issued photo identification, and
              possibly a copy of a recent bank statement for the credit or debit
              card used for the purchase. We reserve the right to change
              products and product pricing at any time. We also reserve the
              right to refuse any order you place with us. We may, in our sole
              discretion, limit or cancel quantities purchased per person, per
              household or per order. These restrictions may include orders
              placed by or under the same customer account, the same credit
              card, and/or orders that use the same billing and/or shipping
              address. In the event that we make a change to or cancel an order,
              we may attempt to notify you by contacting the email and/or
              billing address/phone number provided at the time the order was
              made.
            </p>
          </section>

          {/* Section 4 */}
          <section id="accuracy-of-information" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Accuracy of information
            </h2>
            <p className="mb-4">
              Occasionally there may be information on the Website that contains
              typographical errors, inaccuracies or omissions that may relate to
              promotions and offers. We reserve the right to correct any errors,
              inaccuracies or omissions, and to change or update information or
              cancel orders if any information on the Website or Services is
              inaccurate at any time without prior notice (including after you
              have submitted your order). We undertake no obligation to update,
              amend or clarify information on the Website including, without
              limitation, pricing information, except as required by law. No
              specified update or refresh date applied on the Website should be
              taken to indicate that all information on the Website or Services
              has been modified or updated.
            </p>
          </section>

          {/* Section 5 */}
          <section id="backups" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">Backups</h2>
            <p className="mb-4">
              We perform regular backups of the Website and its Content and will
              do our best to ensure completeness and accuracy of these backups.
              In the event of the hardware failure or data loss we will restore
              backups automatically to minimize the impact and downtime.
            </p>
          </section>

          {/* Section 6 */}
          <section id="links-to-other-resources" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Links to other resources
            </h2>
            <p className="mb-4">
              Although the Website and Services may link to other resources
              (such as websites, mobile applications, etc.), we are not,
              directly or indirectly, implying any approval, association,
              sponsorship, endorsement, or affiliation with any linked resource,
              unless specifically stated herein. We are not responsible for
              examining or evaluating, and we do not warrant the offerings of,
              any businesses or individuals or the content of their resources.
              We do not assume any responsibility or liability for the actions,
              products, services, and content of any other third parties. You
              should carefully review the legal statements and other conditions
              of use of any resource which you access through a link on the
              Website. Your linking to any other off-site resources is at your
              own risk.
            </p>
          </section>

          {/* Section 7 */}
          <section id="prohibited-uses" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Prohibited uses
            </h2>
            <p className="mb-4">
              In addition to other terms as set forth in the Agreement, you are
              prohibited from using the Website and Services or Content: (a) for
              any unlawful purpose; (b) to solicit others to perform or
              participate in any unlawful acts; (c) to violate any
              international, federal, provincial or state regulations, rules,
              laws, or local ordinances; (d) to infringe upon or violate our
              intellectual property rights or the intellectual property rights
              of others; (e) to harass, abuse, insult, harm, defame, slander,
              disparage, intimidate, or discriminate based on gender, sexual
              orientation, religion, ethnicity, race, age, national origin, or
              disability; (f) to submit false or misleading information; (g) to
              upload or transmit viruses or any other type of malicious code
              that will or may be used in any way that will affect the
              functionality or operation of the Website and Services, third
              party products and services, or the Internet; (h) to spam, phish,
              pharm, pretext, spider, crawl, or scrape; (i) for any obscene or
              immoral purpose; or (j) to interfere with or circumvent the
              security features of the Website and Services, third party
              products and services, or the Internet. We reserve the right to
              terminate your use of the Website and Services for violating any
              of the prohibited uses.
            </p>
          </section>

          {/* Section 8 */}
          <section id="disclaimer-of-warranty" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Disclaimer of warranty
            </h2>
            <p className="mb-4">
              You agree that such Service is provided on an &ldquo;as is&rdquo;
              and &ldquo;as available&rdquo; basis and that your use of the
              Website and Services is solely at your own risk. We expressly
              disclaim all warranties of any kind, whether express or implied,
              including but not limited to the implied warranties of
              merchantability, fitness for a particular purpose and
              non-infringement. We make no warranty that the Services will meet
              your requirements, or that the Service will be uninterrupted,
              timely, secure, or error-free; nor do we make any warranty as to
              the results that may be obtained from the use of the Service or as
              to the accuracy or reliability of any information obtained through
              the Service or that defects in the Service will be corrected. You
              understand and agree that any material and/or data downloaded or
              otherwise obtained through the use of Service is done at your own
              discretion and risk and that you will be solely responsible for
              any damage or loss of data that results from the download of such
              material and/or data. We make no warranty regarding any goods or
              services purchased or obtained through the Service or any
              transactions entered into through the Service unless stated
              otherwise. No advice or information, whether oral or written,
              obtained by you from us or through the Service shall create any
              warranty not expressly made herein.
            </p>
          </section>

          {/* Section 9 */}
          <section id="limitation-of-liability" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Limitation of liability
            </h2>
            <p className="mb-4">
              To the fullest extent permitted by applicable law, in no event
              will EVAL Gaming Inc., its affiliates, directors, officers,
              employees, agents, suppliers or licensors be liable to any person
              for any indirect, incidental, special, punitive, cover or
              consequential damages (including, without limitation, damages for
              lost profits, revenue, sales, goodwill, use of content, impact on
              business, business interruption, loss of anticipated savings, loss
              of business opportunity) however caused, under any theory of
              liability, including, without limitation, contract, tort,
              warranty, breach of statutory duty, negligence or otherwise, even
              if the liable party has been advised as to the possibility of such
              damages or could have foreseen such damages. To the maximum extent
              permitted by applicable law, the aggregate liability of EVAL
              Gaming Inc. and its affiliates, officers, employees, agents,
              suppliers and licensors relating to the services will be limited
              to an amount no greater than one dollar or any amounts actually
              paid in cash by you to EVAL Gaming Inc. for the prior one month
              period prior to the first event or occurrence giving rise to such
              liability. The limitations and exclusions also apply if this
              remedy does not fully compensate you for any losses or fails of
              its essential purpose.
            </p>
          </section>

          {/* Section 10 */}
          <section id="indemnification" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Indemnification
            </h2>
            <p className="mb-4">
              You agree to indemnify and hold EVAL Gaming Inc. and its
              affiliates, directors, officers, employees, agents, suppliers and
              licensors harmless from and against any liabilities, losses,
              damages or costs, including reasonable attorneys&apos; fees,
              incurred in connection with or arising from any third party
              allegations, claims, actions, disputes, or demands asserted
              against any of them as a result of or relating to your Content,
              your use of the Website and Services or any willful misconduct on
              your part.
            </p>
          </section>

          {/* Section 11 */}
          <section id="severability" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Severability
            </h2>
            <p className="mb-4">
              All rights and restrictions contained in this Agreement may be
              exercised and shall be applicable and binding only to the extent
              that they do not violate any applicable laws and are intended to
              be limited to the extent necessary so that they will not render
              this Agreement illegal, invalid or unenforceable. If any provision
              or portion of any provision of this Agreement shall be held to be
              illegal, invalid or unenforceable by a court of competent
              jurisdiction, it is the intention of the parties that the
              remaining provisions or portions thereof shall constitute their
              agreement with respect to the subject matter hereof, and all such
              remaining provisions or portions thereof shall remain in full
              force and effect.
            </p>
          </section>

          {/* Section 12 */}
          <section id="dispute-resolution" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Dispute resolution
            </h2>
            <p className="mb-4">
              The formation, interpretation, and performance of this Agreement
              and any disputes arising out of it shall be governed by the
              substantive and procedural laws of New Jersey, United States
              without regard to its rules on conflicts or choice of law and, to
              the extent applicable, the laws of United States. The exclusive
              jurisdiction and venue for actions related to the subject matter
              hereof shall be the courts located in New Jersey, United States,
              and you hereby submit to the personal jurisdiction of such courts.
              You hereby waive any right to a jury trial in any proceeding
              arising out of or related to this Agreement. The United Nations
              Convention on Contracts for the International Sale of Goods does
              not apply to this Agreement.
            </p>
          </section>

          {/* Section 13 */}
          <section id="changes-and-amendments" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Changes and amendments
            </h2>
            <p className="mb-4">
              We reserve the right to modify this Agreement or its terms related
              to the Website and Services at any time at our discretion. When we
              do, we will revise the updated date at the bottom of this page. We
              may also provide notice to you in other ways at our discretion,
              such as through the contact information you have provided.
            </p>
            <p className="mb-4">
              An updated version of this Agreement will be effective immediately
              upon the posting of the revised Agreement unless otherwise
              specified. Your continued use of the Website and Services after
              the effective date of the revised Agreement (or such other act
              specified at that time) will constitute your consent to those
              changes.
            </p>
          </section>

          {/* Section 14 */}
          <section id="acceptance-of-these-terms" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Acceptance of these terms
            </h2>
            <p className="mb-4">
              You acknowledge that you have read this Agreement and agree to all
              its terms and conditions. By accessing and using the Website and
              Services you agree to be bound by this Agreement. If you do not
              agree to abide by the terms of this Agreement, you are not
              authorized to access or use the Website and Services.
            </p>
          </section>

          {/* Section 15 */}
          <section id="contacting-us" className="mb-8">
            <h2 className="font-orbitron mb-4 text-2xl text-white">
              Contacting us
            </h2>
            <p className="mb-4">
              If you have any questions, concerns, or complaints regarding this
              Agreement, we encourage you to contact us using the details below:
            </p>
            <div className="mb-4 rounded-lg bg-gray-700/50 p-4">
              <p className="font-semibold text-white">EVAL Gaming Inc.</p>
              <p>34 Chambers Street, Princeton, NJ, 08542 USA</p>
            </div>
            <p className="mt-8 text-center text-sm text-gray-400">
              This document was last updated on June 11, 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
