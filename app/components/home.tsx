import { Demo } from './demo';
import { Header } from './header';
import { Hero } from './hero';

export const Home = () => (
  <div className="container mx-auto py-8">
    <Header />
    <Hero
      title={
        <>
          <span className="font-semibold font-serif text-7xl italic">
            Visualize
          </span>{' '}
          your AI workflows
        </>
      }
      description="Tersa is an AI canvas for building powerful workflows. Drag, drop, connect and build your own workflows powered by various industry-leading models."
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
          title: 'Sign in',
          link: '/auth/login',
        },
      ]}
    />
    <Demo />
  </div>
);
