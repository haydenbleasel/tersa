import type { Metadata } from 'next';

const title = 'Terms of Service';
const description =
  'These Terms of Service govern your use of the website and any related services provided by Tersa. By accessing any of the sites mentioned above, you agree to abide by these Terms of Service and to comply with all applicable laws and regulations.';

export const metadata: Metadata = {
  title,
  description,
};

const Privacy = () => (
  <div className="relative grid w-full grid-cols-[0.2fr_3fr_0.2fr] md:grid-cols-[0.5fr_3fr_0.5fr]">
    {/* Gradient overlays */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute top-0 right-0 left-0 h-8 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
    {/* Top row */}
    <div className="border-b border-dotted" />
    <div className="border-x border-b border-dotted py-6" />
    <div className="border-b border-dotted" />
    {/* Middle row - main content */}
    <div className="border-b border-dotted" />
    <div className="relative flex items-center justify-center border-x border-b border-dotted">
      {/* Corner decorations */}
      <div className="-left-[3px] -top-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-right-[3px] -top-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-bottom-[3px] -left-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-bottom-[3px] -right-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center px-5 py-16">
        <h1 className="mb-5 text-center font-medium text-4xl tracking-[-0.12rem] md:text-6xl">
          {title}
        </h1>

        <p className="max-w-3xl text-center text-muted-foreground tracking-[-0.01rem] sm:text-lg">
          {description}
        </p>
      </div>
    </div>
    <div className="border-b border-dotted" />
    {/* Bottom row - Plans */}
    <div className="border-b border-dotted" />
    <div className="relative flex items-center justify-center border-x border-b border-dotted">
      {/* Corner decorations */}
      <div className="-bottom-[3px] -left-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-bottom-[3px] -right-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>

      <div className="prose prose-primary dark:prose-invert py-12">
        <p>
          If you do not agree with these Terms of Service, you are prohibited
          from using or accessing this website or using any other services
          provided by Tersa.
        </p>
        <p>
          We, Tersa, reserve the right to review and amend any of these Terms of
          Service at our sole discretion. Upon doing so, we will update this
          page. Any changes to these Terms of Service will take effect
          immediately from the date of publication.
        </p>
        <h2>Promotion</h2>
        <p>
          By using our services, you grant us the right to use your company logo
          and name for promotional purposes, including but not limited to our
          website, marketing materials, and social media channels. If you prefer
          not to have your logo used in this manner, please contact us to opt
          out.
        </p>
        <h2>Limitations of Use</h2>
        <p>
          By using this website, you warrant on behalf of yourself, your users,
          and other parties you represent that you will not:
        </p>
        <ol>
          <li>
            modify, copy, prepare derivative works of, decompile, or reverse
            engineer any materials and software contained on this website;
          </li>
          <li>
            remove any copyright or other proprietary notations from any
            materials and software on this website;
          </li>
          <li>
            transfer the materials to another person or “mirror” the materials
            on any other server;
          </li>
          <li>
            knowingly or negligently use this website or any of its associated
            services in a way that abuses or disrupts our networks or any other
            service Tersa provides;
          </li>
          <li>
            use this website or its associated services to transmit or publish
            any harassing, indecent, obscene, fraudulent, or unlawful material;
          </li>
          <li>
            use this website or its associated services in violation of any
            applicable laws or regulations;
          </li>
          <li>
            use this website in conjunction with sending unauthorized
            advertising or spam;
          </li>
          <li>
            harvest, collect, or gather user data without the user’s consent; or
          </li>
          <li>
            use this website or its associated services in such a way that may
            infringe the privacy, intellectual property rights, or other rights
            of third parties.
          </li>
        </ol>
        <h2>Intellectual Property</h2>
        <p>
          The intellectual property in the materials contained in this website
          are owned by or licensed to Tersa and are protected by applicable
          copyright and trademark law. We grant our users permission to download
          one copy of the materials for personal, non-commercial transitory use.
        </p>
        <p>
          This constitutes the grant of a license, not a transfer of title. This
          license shall automatically terminate if you violate any of these
          restrictions or the Terms of Service, and may be terminated by Tersa
          at any time.
        </p>
        <h2>User-Generated Content</h2>
        <p>
          You retain your intellectual property ownership rights over content
          you submit to us for publication on our website. We will never claim
          ownership of your content, but we do require a license from you in
          order to use it.
        </p>
        <p>
          When you use our website or its associated services to post, upload,
          share, or otherwise transmit content covered by intellectual property
          rights, you grant to us a non-exclusive, royalty-free, transferable,
          sub-licensable, worldwide license to use, distribute, modify, run,
          copy, publicly display, translate, or otherwise create derivative
          works of your content in a manner that is consistent with your privacy
          preferences and our Privacy Policy.
        </p>
        <p>
          The license you grant us can be terminated at any time by deleting
          your content or account. However, to the extent that we (or our
          partners) have used your content in connection with commercial or
          sponsored content, the license will continue until the relevant
          commercial or post has been discontinued by us.
        </p>
        <p>
          You give us permission to use your username and other identifying
          information associated with your account in a manner that is
          consistent with your privacy preferences, and our Privacy Policy.
        </p>
        <h2>Liability</h2>
        <p>
          Our website and the materials on our website are provided on an 'as
          is' basis. To the extent permitted by law, Tersa makes no warranties,
          expressed or implied, and hereby disclaims and negates all other
          warranties including, without limitation, implied warranties or
          conditions of merchantability, fitness for a particular purpose, or
          non-infringement of intellectual property, or other violation of
          rights.
        </p>
        <p>
          In no event shall Tersa or its suppliers be liable for any
          consequential loss suffered or incurred by you or any third party
          arising from the use or inability to use this website or the materials
          on this website, even if Tersa or an authorized representative has
          been notified, orally or in writing, of the possibility of such
          damage.
        </p>
        <p>
          In the context of this agreement, “consequential loss” includes any
          consequential loss, indirect loss, real or anticipated loss of profit,
          loss of benefit, loss of revenue, loss of business, loss of goodwill,
          loss of opportunity, loss of savings, loss of reputation, loss of use
          and/or loss or corruption of data, whether under statute, contract,
          equity, tort (including negligence), indemnity, or otherwise.
        </p>
        <p>
          Because some jurisdictions do not allow limitations on implied
          warranties, or limitations of liability for consequential or
          incidental damages, these limitations may not apply to you.
        </p>
        <h2>Accuracy of Materials</h2>
        <p>
          The materials appearing on our website are not comprehensive and are
          for general information purposes only. Tersa does not warrant or make
          any representations concerning the accuracy, likely results, or
          reliability of the use of the materials on this website, or otherwise
          relating to such materials or on any resources linked to this website.
        </p>
        <h2>Links</h2>
        <p>
          Tersa has not reviewed all of the sites linked to its website and is
          not responsible for the contents of any such linked site. The
          inclusion of any link does not imply endorsement, approval, or control
          by Tersa of the site. Use of any such linked site is at your own risk
          and we strongly advise you make your own investigations with respect
          to the suitability of those sites.
        </p>
        <h2>Pricing</h2>
        <p>
          The latest pricing can be found on our <a href="/pricing">Pricing</a>{' '}
          page. Our pricing is subject to change at any time. We reserve the
          right to modify our pricing for any reason, including but not limited
          to changes in market conditions, cost of goods or services, or changes
          in our business model. Any changes to our pricing will be communicated
          to our customers through our website or through other means, such as
          email. Customers will be responsible for any price changes, and will
          be given the opportunity to cancel their subscription before the new
          pricing takes effect.
        </p>
        <h2>Right to Terminate</h2>
        <p>
          We may suspend or terminate your right to use our website and
          terminate these Terms of Service immediately upon written notice to
          you for any breach of these Terms of Service.
        </p>
        <h2>Severance</h2>
        <p>
          Any term of these Terms of Service which is wholly or partially void
          or unenforceable is severed to the extent that it is void or
          unenforceable. The validity of the remainder of these Terms of Service
          is not affected.
        </p>
        <h2>Governing Law</h2>
        <p>
          These Terms of Service are governed by and construed in accordance
          with the laws of Australia. You irrevocably submit to the exclusive
          jurisdiction of the courts in that State or location.
        </p>
      </div>
    </div>
    <div className="border-b border-dotted" />
    <div className="h-16" />
    <div className="border-x border-dotted" />
    <div className="" />
  </div>
);

export default Privacy;
