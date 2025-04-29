import { Demo } from './demo';
import { Features } from './features';
import { Header } from './header';
import { Hero } from './hero';

export const Home = () => (
  <div className="container mx-auto py-8">
    <Header />
    <Hero
      announcement={{
        title: 'Tersa is now open source!',
        link: 'https://x.com/haydenbleasel/status/1916267182541181133',
      }}
      buttons={[
        {
          title: 'Get started for free',
          link: '/auth/sign-up',
        },
        {
          title: 'Login',
          link: '/auth/login',
        },
      ]}
    />
    <Demo />
    <Features />
  </div>
);
