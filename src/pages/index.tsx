import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const router = useRouter();

  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  const handleClickNextPage = async (): Promise<void> => {
    const response = await fetch(nextPage);
    const newPosts = (await response.json()) as ApiSearchResponse;

    setPosts(oldValues => [...oldValues, ...newPosts.results]);
    setNextPage(newPosts.next_page);
  };

  if (router?.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>
      <main className={commonStyles.mainContainer}>
        <Header />
        <div className={styles.mainContainer}>
          <div className={styles.postsContainer}>
            {posts.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a className={styles.cardItem}>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.cardInfo}>
                    <span>
                      <FiCalendar />
                      <div>
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          {
                            locale: ptBR,
                          }
                        )}
                      </div>
                    </span>
                    <span>
                      <FiUser />
                      <div>{post.data.author}</div>
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
          {nextPage && (
            <button
              type="button"
              onClick={handleClickNextPage}
              className={styles.loadMoreButton}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query('', {
    fetch: ['posts.title', 'posts.subtitle', 'posts.uid', 'posts.author'],
    page: 1,
    pageSize: 2,
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return { props: { postsPagination } };
};
