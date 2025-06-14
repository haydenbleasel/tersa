import type { Metadata } from 'next';
import { Demo } from './components/demo';
import { Features } from './components/features';
import { Hero } from './components/hero';
import { Providers } from './components/providers';
import { Tweets } from './components/tweets';

export const metadata: Metadata = {
  title: 'A visual AI playground | Tersa',
  description:
    'Tersa is an open source canvas for building AI workflows. Drag, drop connect and run nodes to build your own workflows powered by various industry-leading AI models.',
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
  <>
    <Hero
      announcement={{
        title: 'Tersa is now open source!',
        link: 'https://x.com/haydenbleasel/status/1923061663437291832',
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
  </>
);

export default Home;
