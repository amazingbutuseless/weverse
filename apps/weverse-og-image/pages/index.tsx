import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';

export const getServerSideProps = ({ req }: GetServerSidePropsContext) => {
  return {
    props: {
      twitterImage: `https://${req.headers.host}${req.url}.png`,
    },
  };
};

export function Index({ twitterImage }: { twitterImage: string }) {
  return (
    <Head>
      <title></title>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={'title'} />
      <meta name="twitter:description" content={'description'} />
      <meta name="twitter:image" content={twitterImage} />
    </Head>
  );
}

export default Index;
