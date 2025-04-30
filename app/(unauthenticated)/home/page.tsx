import type { Metadata } from 'next';
import { Demo } from './components/demo';
import { Features } from './components/features';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Hero } from './components/hero';
import { Providers } from './components/providers';
import { SubFooter } from './components/sub-footer';
import { Tweets } from './components/tweets';

export const metadata: Metadata = {
  title: 'Tersa',
  description: 'Join the waitlist to get early access to Tersa.',
};

const buttons = [
  {
    title: 'Get started for free',
    link: '/auth/sign-up',
  },
  {
    title: 'Login',
    link: '/auth/login',
  },
];

const Home = () => (
  <div className="container mx-auto py-8">
    <Header />
    <Hero
      announcement={{
        title: 'Tersa is now open source!',
        link: 'https://x.com/haydenbleasel/status/1916267182541181133',
      }}
      buttons={buttons}
    />
    <Demo />
    <Providers />
    <Tweets
      ids={[
        '1916536490831626365',
        '1916533812223189208',
        '1916404495740813630',
      ]}
    />
    <Features />
    <Tweets
      ids={[
        '1916381488494612687',
        '1916282633362805132',
        '1916494270262813000',
      ]}
    />
    <Footer buttons={buttons} />
    <SubFooter />
  </div>
);

export default Home;
