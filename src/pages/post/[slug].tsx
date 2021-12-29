import { GetStaticPaths, GetStaticProps } from 'next';
import Image, { ImageLoaderProps } from 'next/image';
import Prismic from '@prismicio/client';

import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Head from 'next/head';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Comments from '../../components/Comments';
import PreviewButton from '../../components/PreviewButton';
import PostNavigation from '../../components/PostNavigation';

interface Navigation {
  previousPost?: {
    slug: string;
    title: string;
  };
  nextPost?: {
    slug: string;
    title: string;
  };
}

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url?: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigation: Navigation;
}

export default function Post({
  post,
  preview,
  navigation,
}: PostProps): JSX.Element {
  const router = useRouter();

  const readTime = Math.ceil(
    post.data.content.reduce((previousValue, currentPost) => {
      return (
        previousValue +
        currentPost.heading.split(' ').length +
        currentPost.body.reduce(
          (pValue, content) => pValue + content.text.split(' ').length,
          0
        )
      );
    }, 0) / 200
  );

  const myLoader = ({ src, quality }: ImageLoaderProps): string => {
    return `${src}&q=${quality || 75}`;
  };

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
        <meta name="description" content={post.data.subtitle} />
      </Head>

      <Header />
      <main>
        {post.data.banner.url && (
          <section className={styles.postImageContainer}>
            <Image
              loader={myLoader}
              src={post.data.banner.url}
              layout="fill"
              objectFit="cover"
            />
          </section>
        )}

        <article className={styles.articleContainer}>
          <header className={styles.articleHeader}>
            <h1>{post.data.title}</h1>

            <div className={styles.articleDetails}>
              <div>
                <FiCalendar />
                <span>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock />
                <span>{readTime} min</span>
              </div>
            </div>
            {post.last_publication_date && (
              <div className={styles.articleEdited}>
                {`* editado em ${format(
                  new Date(post.last_publication_date),
                  'dd MMM yyyy',
                  { locale: ptBR }
                )}, às ${format(new Date(post.last_publication_date), 'HH:mm', {
                  locale: ptBR,
                })}`}
              </div>
            )}
          </header>

          <div className={styles.articleContent}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                {RichText.render(content.body as RichTextBlock[])}
              </div>
            ))}
          </div>

          <footer className={styles.articleFooter}>
            <PostNavigation navigation={navigation} />

            <Comments />

            {preview && <PreviewButton />}
          </footer>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('', {
    fetch: ['posts.title', 'posts.subtitle', 'posts.uid', 'posts.author'],
    pageSize: 100,
  });

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const { preview = false, previewData } = context;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const previousPostResponse = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      fetch: ['posts.uid', 'posts.title'],
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    })
  ).results[0];

  const nextPostResponse = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      fetch: ['posts.uid', 'posts.title'],
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    })
  ).results[0];

  const navigation: Navigation = {
    previousPost: previousPostResponse?.data?.title
      ? {
          title: previousPostResponse.data.title,
          slug: previousPostResponse.uid,
        }
      : null,
    nextPost: nextPostResponse?.data?.title
      ? {
          title: nextPostResponse.data.title,
          slug: nextPostResponse.uid,
        }
      : null,
  };

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      author: response.data.author,
      content: response.data.content,
      banner: {
        url: response.data?.banner?.url || null,
      },
    },
  };

  return {
    props: { post, preview, navigation },
  };
};
