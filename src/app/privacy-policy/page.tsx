export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            PRIVACY POLICY
          </h1>
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 rounded-xl p-8 md:p-12 text-gray-300 font-rajdhani leading-relaxed">
          <p className="mb-6">
            We respect your privacy and are committed to protecting it through our compliance with this privacy policy (&ldquo;Policy&rdquo;). This Policy describes the types of information we may collect from you or that you may provide (&ldquo;Personal Information&rdquo;) on the{" "}
            <a href="https://evalgaming.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              evalgaming.com
            </a>{" "}
            website (&ldquo;Website&rdquo; or &ldquo;Service&rdquo;) and any of its related products and services (collectively, &ldquo;Services&rdquo;), and our practices for collecting, using, maintaining, protecting, and disclosing that Personal Information. It also describes the choices available to you regarding our use of your Personal Information and how you can access and update it.
          </p>
          
          <p className="mb-8">
            This Policy is a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo;) and EVAL Gaming Inc. (&ldquo;EVAL Gaming Inc.&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;). If you are entering into this Policy on behalf of a business or other legal entity, you represent that you have the authority to bind such entity to this Policy, in which case the terms &ldquo;User&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo; shall refer to such entity. If you do not have such authority, or if you do not agree with the terms of this Policy, you must not accept this Policy and may not access and use the Website and Services. By accessing and using the Website and Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Policy. This Policy does not apply to the practices of companies that we do not own or control, or to individuals that we do not employ or manage.
          </p>

          {/* Table of Contents */}
          <div className="bg-gray-700/50 rounded-lg p-6 mb-8">
            <h3 className="font-orbitron text-xl text-white mb-4">Table of contents</h3>
            <ol className="space-y-2 text-sm">
              <li><a href="#automatic-collection-of-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">1. Automatic collection of information</a></li>
              <li><a href="#collection-of-personal-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">2. Collection of personal information</a></li>
              <li><a href="#use-and-processing-of-collected-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">3. Use and processing of collected information</a></li>
              <li><a href="#payment-processing" className="text-cyan-400 hover:text-cyan-300 transition-colors">4. Payment processing</a></li>
              <li><a href="#managing-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">5. Managing information</a></li>
              <li><a href="#disclosure-of-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">6. Disclosure of information</a></li>
              <li><a href="#retention-of-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">7. Retention of information</a></li>
              <li><a href="#transfer-of-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">8. Transfer of information</a></li>
              <li><a href="#region-specific-notices" className="text-cyan-400 hover:text-cyan-300 transition-colors">9. Region specific notices</a></li>
              <li><a href="#how-to-exercise-your-rights" className="text-cyan-400 hover:text-cyan-300 transition-colors">10. How to exercise your rights</a></li>
              <li><a href="#cookies" className="text-cyan-400 hover:text-cyan-300 transition-colors">11. Cookies</a></li>
              <li><a href="#data-analytics" className="text-cyan-400 hover:text-cyan-300 transition-colors">12. Data analytics</a></li>
              <li><a href="#privacy-of-children" className="text-cyan-400 hover:text-cyan-300 transition-colors">13. Privacy of children</a></li>
              <li><a href="#do-not-sell-my-personal-information" className="text-cyan-400 hover:text-cyan-300 transition-colors">14. Do not sell my personal information</a></li>
              <li><a href="#do-not-track-signals" className="text-cyan-400 hover:text-cyan-300 transition-colors">15. Do Not Track signals</a></li>
              <li><a href="#social-media-features" className="text-cyan-400 hover:text-cyan-300 transition-colors">16. Social media features</a></li>
              <li><a href="#email-marketing" className="text-cyan-400 hover:text-cyan-300 transition-colors">17. Email marketing</a></li>
              <li><a href="#push-notifications" className="text-cyan-400 hover:text-cyan-300 transition-colors">18. Push notifications</a></li>
              <li><a href="#links-to-other-resources" className="text-cyan-400 hover:text-cyan-300 transition-colors">19. Links to other resources</a></li>
              <li><a href="#information-security" className="text-cyan-400 hover:text-cyan-300 transition-colors">20. Information security</a></li>
              <li><a href="#data-breach" className="text-cyan-400 hover:text-cyan-300 transition-colors">21. Data breach</a></li>
              <li><a href="#changes-and-amendments" className="text-cyan-400 hover:text-cyan-300 transition-colors">22. Changes and amendments</a></li>
              <li><a href="#acceptance-of-this-policy" className="text-cyan-400 hover:text-cyan-300 transition-colors">23. Acceptance of this policy</a></li>
              <li><a href="#contacting-us" className="text-cyan-400 hover:text-cyan-300 transition-colors">24. Contacting us</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <section id="automatic-collection-of-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Automatic collection of information</h2>
            <p className="mb-4">
              When you open the Website, our servers automatically record information that your browser sends. This data may include information such as your device&apos;s IP address, browser type, and version, operating system type and version, language preferences or the webpage you were visiting before you came to the Website and Services, pages of the Website and Services that you visit, the time spent on those pages, information you search for on the Website, access times and dates, and other statistics.
            </p>
            <p className="mb-4">
              Information collected automatically is used only to identify potential cases of abuse and establish statistical information regarding the usage and traffic of the Website and Services. This statistical information is not otherwise aggregated in such a way that would identify any particular User of the system.
            </p>
          </section>

          {/* Section 2 */}
          <section id="collection-of-personal-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Collection of personal information</h2>
            <p className="mb-4">
              You can access and use the Website and Services without telling us who you are or revealing any information by which someone could identify you as a specific, identifiable individual. If, however, you wish to use some of the features offered on the Website, you may be asked to provide certain Personal Information (for example, your name and email address).
            </p>
            <p className="mb-4">
              We receive and store any information you knowingly provide to us when you create an account, publish content, make a purchase, or fill any forms on the Website. When required, this information may include the following:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Account details (such as user name, unique user ID, password, etc)</li>
              <li>Contact information (such as email address, phone number, etc)</li>
              <li>Basic personal information (such as name, country of residence, etc)</li>
              <li>Sensitive personal information (such as ethnicity, religious beliefs, mental health, etc)</li>
              <li>Geolocation data of your device (such as latitude and longitude)</li>
              <li>Information about other individuals (such as your family members, friends, etc)</li>
              <li>Any other materials you willingly submit to us (such as articles, images, feedback, etc)</li>
            </ul>
            <p className="mb-4">
              Some of the information we collect is directly from you via the Website and Services. However, we may also collect Personal Information about you from other sources such as social media platforms, public databases, third-party data providers, and our joint partners. Personal Information we collect from other sources may include demographic information, such as age and gender, device information, such as IP addresses, location, such as city and state, and online behavioral data, such as information about your use of social media websites, page view information and search results and links.
            </p>
            <p className="mb-4">
              You can choose not to provide us with your Personal Information, but then you may not be able to take advantage of some of the features on the Website. Users who are uncertain about what information is mandatory are welcome to contact us.
            </p>
          </section>

          {/* Section 3 */}
          <section id="use-and-processing-of-collected-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Use and processing of collected information</h2>
            <p className="mb-4">
              We act as a data controller and a data processor when handling Personal Information, unless we have entered into a data processing agreement with you in which case you would be the data controller and we would be the data processor.
            </p>
            <p className="mb-4">
              Our role may also differ depending on the specific situation involving Personal Information. We act in the capacity of a data controller when we ask you to submit your Personal Information that is necessary to ensure your access and use of the Website and Services. In such instances, we are a data controller because we determine the purposes and means of the processing of Personal Information.
            </p>
            <p className="mb-4">
              We act in the capacity of a data processor in situations when you submit Personal Information through the Website and Services. We do not own, control, or make decisions about the submitted Personal Information, and such Personal Information is processed only in accordance with your instructions. In such instances, the User providing Personal Information acts as a data controller.
            </p>
            <p className="mb-4">
              In order to make the Website and Services available to you, or to meet a legal obligation, we may need to collect and use certain Personal Information. If you do not provide the information that we request, we may not be able to provide you with the requested products or services. Any of the information we collect from you may be used for the following purposes:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Create and manage user accounts</li>
              <li>Deliver products or services</li>
              <li>Improve products and services</li>
              <li>Send administrative information</li>
              <li>Send marketing and promotional communications</li>
              <li>Send product and service updates</li>
              <li>Respond to inquiries and offer support</li>
              <li>Request user feedback</li>
              <li>Improve user experience</li>
              <li>Post customer testimonials</li>
              <li>Administer prize draws and competitions</li>
              <li>Enforce terms and conditions and policies</li>
              <li>Protect from abuse and malicious users</li>
              <li>Respond to legal requests and prevent harm</li>
              <li>Run and operate the Website and Services</li>
            </ul>
            <p className="mb-4">
              Processing your Personal Information depends on how you interact with the Website and Services, where you are located in the world and if one of the following applies: (a) you have given your consent for one or more specific purposes; (b) provision of information is necessary for the performance of this Policy with you and/or for any pre-contractual obligations thereof; (c) processing is necessary for compliance with a legal obligation to which you are subject; (d) processing is related to a task that is carried out in the public interest or in the exercise of official authority vested in us; (e) processing is necessary for the purposes of the legitimate interests pursued by us or by a third party. We may also combine or aggregate some of your Personal Information in order to better serve you and to improve and update our Website and Services.
            </p>
            <p className="mb-4">
              By providing your phone number, you consent to receive SMS messages from us related to your use of the Website and Services. We only send SMS messages to users who have voluntarily provided their phone number and have consented to such communications. Message frequency may vary depending on your activity and interactions with us. Standard message and data rates may apply based on your mobile carrier and service plan. We are not responsible for any charges billed to you by your mobile carrier. You can opt out of receiving SMS messages at any time by following the instructions provided in the message (e.g., replying &quot;STOP&quot;) or by contacting us directly.
            </p>
            <p className="mb-4">
              Note that under some legislations we may be allowed to process information until you object to such processing by opting out, without having to rely on consent or any other of the legal bases. In any case, we will be happy to clarify the specific legal basis that applies to the processing, and in particular whether the provision of Personal Information is a statutory or contractual requirement, or a requirement necessary to enter into a contract.
            </p>
          </section>

          {/* Section 4 */}
          <section id="payment-processing" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Payment processing</h2>
            <p className="mb-4">
              In case of Services requiring payment, you may need to provide your credit card details or other payment account information, which will be used solely for processing payments. We use third-party payment processors (&quot;Payment Processors&quot;) to assist us in processing your payment information securely.
            </p>
            <p className="mb-4">
              Payment Processors adhere to the latest security standards as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover. Sensitive and private data exchange happens over a SSL secured communication channel and is encrypted and protected with digital signatures, and the Website and Services are also in compliance with strict vulnerability standards in order to create as secure of an environment as possible for Users. We will share payment data with the Payment Processors only to the extent necessary for the purposes of processing your payments, refunding such payments, and dealing with complaints and queries related to such payments and refunds.
            </p>
            <p className="mb-4">
              Please note that the Payment Processors may collect some Personal Information from you, which allows them to process your payments (e.g., your email address, address, credit card details, and bank account number) and handle all the steps in the payment process through their systems, including data collection and data processing. The Payment Processors&apos; use of your Personal Information is governed by their respective privacy policies which may or may not contain privacy protections as protective as this Policy. We suggest that you review their respective privacy policies.
            </p>
          </section>

          {/* Section 5 */}
          <section id="managing-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Managing information</h2>
            <p className="mb-4">
              You are able to delete certain Personal Information we have about you. The Personal Information you can delete may change as the Website and Services change. When you delete Personal Information, however, we may maintain a copy of the unrevised Personal Information in our records for the duration necessary to comply with our obligations to our affiliates and partners, and for the purposes described below. If you would like to delete your Personal Information or permanently delete your account, you can do so on the settings page of your account on the Website or simply by contacting us.
            </p>
          </section>

          {/* Section 6 */}
          <section id="disclosure-of-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Disclosure of information</h2>
            <p className="mb-4">
              Depending on the requested Services or as necessary to complete any transaction or provide any Service you have requested, we may share your non-personally identifiable information with our trusted subsidiaries and joint venture partners, contracted companies, and service providers (collectively, &quot;Service Providers&quot;) we rely upon to assist in the operation of the Website and Services available to you and whose privacy policies are consistent with ours or who agree to abide by our policies with respect to your information. We will not share any information with unaffiliated third parties.
            </p>
            <p className="mb-4">
              Service Providers are not authorized to use or disclose your information except as necessary to perform services on our behalf or comply with legal requirements. Service Providers are given the information they need only in order to perform their designated functions, and we do not authorize them to use or disclose any of the provided information for their own marketing or other purposes.
            </p>
            <p className="mb-4">
              We may also disclose any Personal Information we collect, use or receive if required or permitted by law, such as to comply with a subpoena or similar legal process, and when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.
            </p>
            <p className="mb-4">
              In the event we go through a business transition, such as a merger or acquisition by another company, or sale of all or a portion of its assets, your user account, and your Personal Information will likely be among the assets transferred.
            </p>
          </section>

          {/* Section 7 */}
          <section id="retention-of-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Retention of information</h2>
            <p className="mb-4">
              We will retain and use your Personal Information for the period necessary to comply with our legal obligations, to enforce our Policy, resolve disputes, and unless a longer retention period is required or permitted by law.
            </p>
            <p className="mb-4">
              We may use any aggregated data derived from or incorporating your Personal Information after you update or delete it, but not in a manner that would identify you personally. Once the retention period expires, Personal Information shall be deleted. Therefore, the right to access, the right to erasure, the right to rectification, and the right to data portability cannot be enforced after the expiration of the retention period.
            </p>
          </section>

          {/* Section 8 */}
          <section id="transfer-of-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Transfer of information</h2>
            <p className="mb-4">
              We do not transfer or store your Personal Information outside your country of residence. All Personal Information collected is processed and maintained within your jurisdiction, in compliance with applicable data protection laws. In cases where local regulations require specific security measures for data storage and processing, we ensure full compliance by implementing appropriate technical and organizational safeguards.
            </p>
            <p className="mb-4">
              If any changes to our data storage practices occur, we will update this policy accordingly and notify you as required by law. Note that we are dedicated to ensuring the security of your personal data, adhering strictly to the guidelines outlined in our privacy notice and conforming to the applicable legal requirements.
            </p>
          </section>

          {/* Section 9 */}
          <section id="region-specific-notices" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Region specific notices</h2>
            <p className="mb-4">
              Out of respect for your privacy, we have implemented additional measures to comply with the obligations and rights associated with the collection of Personal Information as dictated by the laws governing the regions of our users.
            </p>
            
            <h3 className="font-orbitron text-xl text-white mb-3">Disclosures for residents of the USA</h3>
            <p className="mb-4">
                If you are a resident of California, Colorado, Connecticut, Delaware, Iowa, Maryland, Utah, or Virginia, you have certain rights and we aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Information. This supplemental section, together with other relevant sections of the Policy, provides information about your rights and how to exercise them under the California Consumer Privacy Act and the California Privacy Rights Act (collectively, &
            </p>
            <p className="mb-4">
              As described in this Policy in the information collection section above, we have collected the categories of Personal Information listed below in the past twelve (12) months:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Personal identifiers (such as email address, phone number, etc)</li>
              <li>Person&apos;s characteristics (such as age, gender, etc)</li>
              <li>Audio, visual, electronic, or other types of recordings</li>
              <li>Professional or employment information</li>
              <li>Purchase history</li>
              <li>Geolocation data</li>
              <li>Education records</li>
            </ul>
            <p className="mb-4">
              As described in this Policy in the disclosure section above, we have disclosed the categories of Personal Information listed below in the past twelve (12) months:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Personal identifiers (such as email address, phone number, etc)</li>
              <li>Person&apos;s characteristics (such as age, gender, etc)</li>
              <li>Audio, visual, electronic, or other types of recordings</li>
              <li>Professional or employment information</li>
              <li>Education records</li>
            </ul>
            <p className="mb-4">
              In addition to the rights as explained in this Policy, if you provide Personal Information as defined in the statute to obtain Services for personal, family, or household use, you have the right to submit requests related to your Personal Information once a calendar year. Note that there are circumstances when we may not be able to comply with your request such as when we are not able to verify your request or find that providing a full response conflicts with other legal obligations or regulatory requirements. You will be notified if it&apos;s the case.
            </p>
            <p className="mb-4">
              (a) Right to know and right to access: You have the right to request certain information we have collected about you. Once we receive and confirm a verifiable request from you, we will disclose to you, to the extent permitted by law:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>The categories of Personal Information we collected about you.</li>
              <li>The purposes the categories of Personal Information are collected or used for.</li>
              <li>The specific pieces of Personal Information we hold about you.</li>
              <li>The categories of sources from which Information about you is collected.</li>
              <li>The purposes for collecting, selling, or sharing your Personal Information.</li>
              <li>Whether or not your Personal Information is sold or shared with third parties.</li>
            </ul>
            <p className="mb-4">
              You have the right to request that the Personal Information is delivered in a format that is both portable and easily usable, as long as it is technically possible to do so.
            </p>
            <p className="mb-4">
              (b) Right to correct: You have the right to request that we correct your inaccurate Personal Information taking into account the nature of the Personal Information and the purposes of the processing of the Personal Information.
            </p>
            <p className="mb-4">
              (c) Right to delete: You have the right to request deletion of your Personal Information.
            </p>
            <p className="mb-4">
              (d) Right to opt-out of the sale and sharing: You have the right to opt-out of the sale of your Personal Information which may include selling, disclosing, or transferring Personal Information to another business or a third party for monetary or other valuable consideration.
            </p>
            <p className="mb-4">
              (e) Right to consent to or limit the use of your sensitive personal information: You have the right to consent to the use of your Sensitive Personal information and to direct us to restrict its use and disclosure solely to what is essential for carrying out or delivering the Services in a manner reasonably anticipated by an average user, or for certain business objectives as specified by law. However, we do not use Sensitive Personal Information for any purposes other than those legally permitted or beyond the scope of your consent.
            </p>
            <p className="mb-4">
              (f) Right to non-discrimination: You have the right to not be discriminated against in the Services or quality of Services you receive from us for exercising your rights. We may not, and will not, treat you differently because of your data subject request activity, and we may not and will not deny goods or Services to you, charge different rates for goods or Services, provide a different level quality of goods or Services, or suggest that we would treat you differently because of your data subject request activity.
            </p>
            <p className="mb-4">
              (g) Shine the Light: California residents that have an established business relationship with us have the right to know how their personal information is disclosed to third parties for their direct marketing purposes under California&apos;s &quot;Shine the Light&quot; law, or the right to opt out of such practices.
            </p>
            <p className="mb-4">
              To exercise any of your rights, simply contact us using the details below. After we receive and verify your request, we will process it to the extent possible within our capabilities.
            </p>

            <h3 className="font-orbitron text-xl text-white mb-3">Other countries and general privacy rights</h3>
            <p className="mb-4">
              If you reside in a country not specifically mentioned in this policy, we are committed to protecting your personal data in accordance with internationally recognized privacy principles. Users from these regions may have rights similar to those outlined above and other data protection laws. These rights include:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>The right to access, correct, or delete your personal data.</li>
              <li>The right to restrict or object to certain types of processing.</li>
              <li>The right to withdraw consent for data processing.</li>
              <li>The right to data portability, where applicable.</li>
              <li>The right to opt out of targeted advertising and data sales, where required by law.</li>
              <li>The right to file a grievance with a relevant data protection authority.</li>
              <li>The right to nominate a representative to exercise your privacy rights on your behalf, if permitted by applicable regulations.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="how-to-exercise-your-rights" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">How to exercise your rights</h2>
            <p className="mb-4">
              Any requests to exercise your rights can be directed to us through the contact details provided in this document. Please note that we may ask you to verify your identity before responding to such requests. Your request must provide sufficient information that allows us to verify that you are the person you are claiming to be or that you are the authorized representative of such person. If we receive your request from an authorized representative, we may request evidence that you have provided such an authorized representative with power of attorney or that the authorized representative otherwise has valid written authority to submit requests on your behalf.
            </p>
            <p className="mb-4">
              You must include sufficient details to allow us to properly understand the request and respond to it. We cannot respond to your request or provide you with Personal Information unless we first verify your identity or authority to make such a request and confirm that the Personal Information relates to you.
            </p>
          </section>

          {/* Section 11 */}
          <section id="cookies" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Cookies</h2>
            <p className="mb-4">
              Our Website and Services use &quot;cookies&quot; to help personalize your online experience. A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web server in the domain that issued the cookie to you. If you choose to decline cookies, you may not be able to fully experience the features of the Website and Services.
            </p>
            <p className="mb-4">
              We may use cookies to collect, store, and track information for security and personalization, to operate the Website and Services, and for statistical purposes. Please note that you have the ability to accept or decline cookies. Most web browsers automatically accept cookies by default, but you can modify your browser settings to decline cookies if you prefer.
            </p>
          </section>

          {/* Section 12 */}
          <section id="data-analytics" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Data analytics</h2>
            <p className="mb-4">
              Our Website and Services may use third-party analytics tools that use cookies, web beacons, or other similar information-gathering technologies to collect standard internet activity and usage information. The information gathered is used to compile statistical reports on User activity such as how often Users visit our Website and Services, what pages they visit and for how long, etc. We use the information obtained from these analytics tools to monitor the performance and improve our Website and Services.
            </p>
          </section>

          {/* Section 13 */}
          <section id="privacy-of-children" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Privacy of children</h2>
            <p className="mb-4">
              We do not knowingly collect any Personal Information from children under the age of 13. If you are under the age of 13, please do not submit any Personal Information through the Website and Services. If you have reason to believe that a child under the age of 13 has provided Personal Information to us through the Website and Services, please contact us to request that we delete that child&apos;s Personal Information from our Services.
            </p>
            <p className="mb-4">
              We encourage parents and legal guardians to monitor their children&apos;s Internet usage and to help enforce this Policy by instructing their children never to provide Personal Information through the Website and Services without their permission. We also ask that all parents and legal guardians overseeing the care of children take the necessary precautions to ensure that their children are instructed to never give out Personal Information when online without their permission.
            </p>
          </section>

          {/* Section 14 */}
          <section id="do-not-sell-my-personal-information" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Do not sell my personal information</h2>
            <p className="mb-4">
              You have the right to choose not to have your Personal Information sold or disclosed by contacting us. Upon receiving and verifying your request, we will cease the sale and disclosure of your Personal Information. Be aware, however, that opting out of data transfers to our third parties might affect our ability to provide certain Services you have signed up for. We reserve the right to reject opt-out requests in certain situations as permitted by the CCPA, such as when the sale of Personal Information is required for us to fulfill legal or contractual duties.
            </p>
          </section>

          {/* Section 15 */}
          <section id="do-not-track-signals" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Do Not Track signals</h2>
            <p className="mb-4">
              Some browsers incorporate a Do Not Track feature that signals to websites you visit that you do not want to have your online activity tracked. Tracking is not the same as using or collecting information in connection with a website. For these purposes, tracking refers to collecting personally identifiable information from users who use or visit a website or online service as they move across different websites over time. How browsers communicate the Do Not Track signal is not yet uniform. As a result, the Website and Services are not yet set up to interpret or respond to Do Not Track signals communicated by your browser. Even so, as described in more detail throughout this Policy, we limit our use and collection of your Personal Information. For a description of Do Not Track protocols for browsers and mobile devices or to learn more about the choices available to you, visit{" "}
              <a href="https://www.internetcookies.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                internetcookies.com
              </a>
            </p>
          </section>

          {/* Section 16 */}
          <section id="social-media-features" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Social media features</h2>
            <p className="mb-4">
              Our Website and Services may include social media features, such as the Facebook and Twitter buttons, Share This buttons, etc (collectively, &quot;Social Media Features&quot;). These Social Media Features may collect your IP address, what page you are visiting on our Website and Services, and may set a cookie to enable Social Media Features to function properly. Social Media Features are hosted either by their respective providers or directly on our Website and Services. Your interactions with these Social Media Features are governed by the privacy policy of their respective providers.
            </p>
          </section>

          {/* Section 17 */}
          <section id="email-marketing" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Email marketing</h2>
            <p className="mb-4">
              We offer electronic newsletters to which you may voluntarily subscribe at any time. We are committed to keeping your email address confidential and will not disclose your email address to any third parties except as allowed in the information use and processing section or for the purposes of utilizing a third-party provider to send such emails. We will maintain the information sent via email in accordance with applicable laws and regulations.
            </p>
            <p className="mb-4">
              In compliance with the CAN-SPAM Act, all emails sent from us will clearly state who the email is from and provide clear information on how to contact the sender. You may choose to stop receiving our newsletter or marketing emails by following the unsubscribe instructions included in these emails or by contacting us. However, you will continue to receive essential transactional emails.
            </p>
          </section>

          {/* Section 18 */}
          <section id="push-notifications" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Push notifications</h2>
            <p className="mb-4">
              We offer push notifications to which you may also voluntarily subscribe at any time. To make sure push notifications reach the correct devices, we use a third-party push notifications provider who relies on a device token unique to your device which is issued by the operating system of your device. While it is possible to access a list of device tokens, they will not reveal your identity, your unique device ID, or your contact information to us or our third-party push notifications provider. We will maintain the information sent via email in accordance with applicable laws and regulations. If, at any time, you wish to stop receiving push notifications, simply adjust your device settings accordingly.
            </p>
          </section>

          {/* Section 19 */}
          <section id="links-to-other-resources" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Links to other resources</h2>
            <p className="mb-4">
              The Website and Services contain links to other resources that are not owned or controlled by us. Please be aware that we are not responsible for the privacy practices of such other resources or third parties. We encourage you to be aware when you leave the Website and Services and to read the privacy statements of each and every resource that may collect Personal Information.
            </p>
          </section>

          {/* Section 20 */}
          <section id="information-security" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Information security</h2>
            <p className="mb-4">
              We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. We maintain reasonable administrative, technical, and physical safeguards in an effort to protect against unauthorized access, use, modification, and disclosure of Personal Information in our control and custody. However, no data transmission over the Internet or wireless network can be guaranteed.
            </p>
            <p className="mb-4">
              Therefore, while we strive to protect your Personal Information, you acknowledge that (a) there are security and privacy limitations of the Internet which are beyond our control; (b) the security, integrity, and privacy of any and all information and data exchanged between you and the Website and Services cannot be guaranteed; and (c) any such information and data may be viewed or tampered with in transit by a third party, despite best efforts.
            </p>
            <p className="mb-4">
              As the security of Personal Information depends in part on the security of the device you use to communicate with us and the security you use to protect your credentials, please take appropriate measures to protect this information.
            </p>
          </section>

          {/* Section 21 */}
          <section id="data-breach" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Data breach</h2>
            <p className="mb-4">
              In the event we become aware that the security of the Website and Services has been compromised or Users&apos; Personal Information has been disclosed to unrelated third parties as a result of external activity, including, but not limited to, security attacks or fraud, we reserve the right to take reasonably appropriate measures, including, but not limited to, investigation and reporting, as well as notification to and cooperation with law enforcement authorities.
            </p>
            <p className="mb-4">
              In the event of a data breach, we will make reasonable efforts to notify affected individuals if we believe that there is a reasonable risk of harm to the User as a result of the breach or if notice is otherwise required by law. When we do, we will send you an email. In jurisdictions where required, we may also report the breach to relevant authorities in accordance with applicable data protection regulations.
            </p>
          </section>

          {/* Section 22 */}
          <section id="changes-and-amendments" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Changes and amendments</h2>
            <p className="mb-4">
              We reserve the right to modify this Policy or its terms related to the Website and Services at any time at our discretion. When we do, we will revise the updated date at the bottom of this page. We may also provide notice to you in other ways at our discretion, such as through the contact information you have provided.
            </p>
            <p className="mb-4">
              An updated version of this Policy will be effective immediately upon the posting of the revised Policy unless otherwise specified. Your continued use of the Website and Services after the effective date of the revised Policy (or such other act specified at that time) will constitute your consent to those changes. However, we will not, without your consent, use your Personal Information in a manner materially different than what was stated at the time your Personal Information was collected.
            </p>
          </section>

          {/* Section 23 */}
          <section id="acceptance-of-this-policy" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Acceptance of this policy</h2>
            <p className="mb-4">
              You acknowledge that you have read this Policy and agree to all its terms and conditions. By accessing and using the Website and Services and submitting your information you agree to be bound by this Policy. If you do not agree to abide by the terms of this Policy, you are not authorized to access or use the Website and Services.
            </p>
          </section>

          {/* Section 24 */}
          <section id="contacting-us" className="mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Contacting us</h2>
            <p className="mb-4">
              If you have any questions regarding the information we may hold about you or if you wish to exercise your rights, you may use the following data subject request form to submit your request:
            </p>
            <p className="mb-4">
              <a href="https://app.websitepolicies.com/dsar/view/tdnd5urj" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Submit a data access request
              </a>
            </p>
            <p className="mb-4">
              If you have any other questions, concerns, or complaints regarding this Policy, we encourage you to contact us using the details below:
            </p>
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <p className="text-white font-semibold">EVAL Gaming Inc.</p>
              <p>34 Chambers Street, Princeton, NJ, 08542 USA</p>
            </div>
            <p className="mb-4">
              We will attempt to resolve complaints and disputes and make every reasonable effort to honor your wish to exercise your rights as quickly as possible and in any event, within the timescales provided by applicable data protection laws.
            </p>
            <p className="mb-4">
              If you believe your concerns have not been adequately addressed, you may escalate the matter to the appropriate data protection authority in your region, in accordance with applicable privacy laws.
            </p>
            <p className="text-sm text-gray-400 mt-8 text-center">
              This document was last updated on June 11, 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
