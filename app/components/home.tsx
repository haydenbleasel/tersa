import { Demo } from './demo';
import { Features } from './features';
import { Footer } from './footer';
import { Header } from './header';
import { Hero } from './hero';
import { Providers } from './providers';
import { SubFooter } from './sub-footer';
import { Tweets } from './tweets';

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

export const Home = () => (
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
