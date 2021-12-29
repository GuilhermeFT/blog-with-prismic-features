import Link from 'next/link';
import styles from './styles.module.scss';

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

interface PostNavigationProps {
  navigation: Navigation;
}
export default function PostNavigation({
  navigation,
}: PostNavigationProps): JSX.Element {
  return (
    <div className={styles.navigationContainer}>
      {navigation.previousPost && (
        <Link href={`/post/${navigation.previousPost.slug}`}>
          <a className={styles.previousPost}>
            <div>{navigation.previousPost.title}</div>
            <span>Post anterior</span>
          </a>
        </Link>
      )}
      {navigation.nextPost && (
        <Link href={`/post/${navigation.nextPost.slug}`}>
          <a className={styles.nextPost}>
            <div>{navigation.nextPost.title}</div>
            <span>Próximo post</span>
          </a>
        </Link>
      )}
    </div>
  );
}
