import { useEffect } from 'react';

import styles from './styles.module.scss';

export default function Comments(): JSX.Element {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('comments-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', '');
    script.setAttribute('repo', 'GuilhermeFT/blog-with-prismic-features');
    script.setAttribute('issue-term', 'title');
    script.setAttribute('theme', 'dark-blue');
    anchor.appendChild(script);
  }, []);

  return <div id="comments-uterances" className={styles.commentsContainer} />;
}
