import type { Metadata } from 'next';

const title = 'Acceptable Use Policy';
const description =
  'This acceptable use policy covers the products, services, and technologies (collectively referred to as the “Products”) provided by Tersa under any ongoing agreement.';

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
          It’s designed to protect us, our customers, and the general Internet
          community from unethical, irresponsible, and illegal activity.
        </p>
        <p>
          Tersa customers found engaging in activities prohibited by this
          acceptable use policy can be liable for service suspension and account
          termination. In extreme cases, we may be legally obliged to report
          such customers to the relevant authorities.
        </p>
        <h2>Fair use</h2>
        <p>
          We provide our facilities with the assumption your use will be
          “business as usual”, as per our offer schedule. If your use is
          considered to be excessive, then additional fees may be charged, or
          capacity may be restricted.
        </p>
        <p>
          We are opposed to all forms of abuse, discrimination, rights
          infringement, and/or any action that harms or disadvantages any group,
          individual, or resource. We expect our customers and, where
          applicable, their users (“end-users”) to likewise engage our Products
          with similar intent.
        </p>
        <h2>Customer accountability</h2>
        <p>
          We regard our customers as being responsible for their own actions as
          well as for the actions of anyone using our Products with the
          customer’s permission. This responsibility also applies to anyone
          using our Products on an unauthorized basis as a result of the
          customer’s failure to put in place reasonable security measures.
        </p>
        <p>
          By accepting Products from us, our customers agree to ensure adherence
          to this policy on behalf of anyone using the Products as their end
          users. Complaints regarding the actions of customers or their
          end-users will be forwarded to the nominated contact for the account
          in question.
        </p>
        <p>
          If a customer — or their end-user or anyone using our Products as a
          result of the customer — violates our acceptable use policy, we
          reserve the right to terminate any Products associated with the
          offending account or the account itself or take any remedial or
          preventative action we deem appropriate, without notice. To the extent
          permitted by law, no credit will be available for interruptions of
          service resulting from any violation of our acceptable use policy.
        </p>
        <h2>Prohibited activity</h2>
        <h3>Copyright infringement and access to unauthorized material</h3>
        <p>
          Our Products must not be used to transmit, distribute or store any
          material in violation of any applicable law. This includes but isn’t
          limited to:
        </p>
        <ol>
          <li>
            any material protected by copyright, trademark, trade secret, or
            other intellectual property right used without proper authorization,
            and
          </li>
          <li>
            any material that is obscene, defamatory, constitutes an illegal
            threat or violates export control laws.
          </li>
        </ol>
        <p>
          The customer is solely responsible for all material they input,
          upload, disseminate, transmit, create or publish through or on our
          Products, and for obtaining legal permission to use any works included
          in such material.
        </p>
        <h3>SPAM and unauthorized message activity</h3>
        <p>
          Our Products must not be used for the purpose of sending unsolicited
          bulk or commercial messages in violation of the laws and regulations
          applicable to your jurisdiction (“spam”). This includes but isn’t
          limited to sending spam, soliciting customers from spam sent from
          other service providers, and collecting replies to spam sent from
          other service providers.
        </p>
        <p>
          Our Products must not be used for the purpose of running unconfirmed
          mailing lists or telephone number lists (“messaging lists”). This
          includes but isn’t limited to subscribing email addresses or telephone
          numbers to any messaging list without the permission of the email
          address or telephone number owner, and storing any email addresses or
          telephone numbers subscribed in this way. All messaging lists run on
          or hosted by our Products must be “confirmed opt-in”. Verification of
          the address or telephone number owner’s express permission must be
          available for the lifespan of the messaging list.
        </p>
        <p>
          We prohibit the use of email lists, telephone number lists or
          databases purchased from third parties intended for spam or
          unconfirmed messaging list purposes on our Products.
        </p>
        <p>
          This spam and unauthorized message activity policy applies to messages
          sent using our Products, or to messages sent from any network by the
          customer or any person on the customer’s behalf, that directly or
          indirectly refer the recipient to a site hosted via our Products.
        </p>
        <h3>Unethical, exploitative, and malicious activity</h3>
        <p>
          Our Products must not be used for the purpose of advertising,
          transmitting, or otherwise making available any software, program,
          product, or service designed to violate this acceptable use policy, or
          the acceptable use policy of other service providers. This includes
          but isn’t limited to facilitating the means to send spam and the
          initiation of network sniffing, pinging, packet spoofing, flooding,
          mail-bombing, and denial-of-service attacks.
        </p>
        <p>
          Our Products must not be used to access any account or electronic
          resource where the group or individual attempting to gain access does
          not own or is not authorized to access the resource (e.g. “hacking”,
          “cracking”, “phreaking”, etc.).
        </p>
        <p>
          Our Products must not be used for the purpose of intentionally or
          recklessly introducing viruses or malicious code into our Products and
          systems.
        </p>
        <p>
          Our Products must not be used for purposely engaging in activities
          designed to harass another group or individual. Our definition of
          harassment includes but is not limited to denial-of-service attacks,
          hate-speech, advocacy of racial or ethnic intolerance, and any
          activity intended to threaten, abuse, infringe upon the rights of, or
          discriminate against any group or individual.
        </p>
        <p>
          Other activities considered unethical, exploitative, and malicious
          include:
        </p>
        <ol>
          <li>
            Obtaining (or attempting to obtain) services from us with the intent
            to avoid payment;
          </li>
          <li>
            Using our facilities to obtain (or attempt to obtain) services from
            another provider with the intent to avoid payment;
          </li>
          <li>
            The unauthorized access, alteration, or destruction (or any attempt
            thereof) of any information about our customers or end-users, by any
            means or device;
          </li>
          <li>
            Using our facilities to interfere with the use of our facilities and
            network by other customers or authorized individuals;
          </li>
          <li>
            Publishing or transmitting any content of links that incite
            violence, depict a violent act, depict child pornography, or
            threaten anyone’s health and safety;
          </li>
          <li>
            Any act or omission in violation of consumer protection laws and
            regulations;
          </li>
          <li>Any violation of a person’s privacy.</li>
        </ol>
        <p>
          Our Products may not be used by any person or entity, which is
          involved with or suspected of involvement in activities or causes
          relating to illegal gambling; terrorism; narcotics trafficking; arms
          trafficking or the proliferation, development, design, manufacture,
          production, stockpiling, or use of nuclear, chemical or biological
          weapons, weapons of mass destruction, or missiles; in each case
          including any affiliation with others whatsoever who support the above
          such activities or causes.
        </p>
        <h3>Unauthorized use of Tersa property</h3>
        <p>
          We prohibit the impersonation of Tersa, the representation of a
          significant business relationship with Tersa, or ownership of any
          Tersa property (including our Products and brand) for the purpose of
          fraudulently gaining service, custom, patronage, or user trust.
        </p>
        <h2>About this policy</h2>
        <p>
          This policy outlines a non-exclusive list of activities and intent we
          deem unacceptable and incompatible with our brand.
        </p>
        <p>
          We reserve the right to modify this policy at any time by publishing
          the revised version on our website. The revised version will be
          effective from the earlier of:
        </p>
        <ul>
          <li>
            the date the customer uses our Products after we publish the revised
            version on our website; or
          </li>
          <li>30 days after we publish the revised version on our website.</li>
        </ul>
      </div>
    </div>
    <div className="border-b border-dotted" />
    <div className="h-16" />
    <div className="border-x border-dotted" />
    <div className="" />
  </div>
);

export default Privacy;
