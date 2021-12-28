import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a className={styles.headerLink}>
          <Image src="/logo.svg" width="239" height="27" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
