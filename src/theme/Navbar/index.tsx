import React, { useEffect } from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import { useLocation } from '@docusaurus/router';

export default function Navbar(props: any): JSX.Element {
  const location = useLocation();
  const isKoreanDoc = location.pathname.startsWith('/docs/ko');

  // Patch the "Docs" link (docSidebar item) so it points to the Korean intro
  // when the user is already inside /docs/ko/*. Docusaurus's docSidebar type
  // resolves to the sidebar's first doc, which is always the English intro in
  // this project — so without this fix the button throws users back to English.
  useEffect(() => {
    const targetHref = isKoreanDoc ? '/docs/ko/intro' : '/docs/intro';

    const patch = () => {
      const links = document.querySelectorAll<HTMLAnchorElement>(
        '.navbar__items--left a.navbar__link, .navbar__items--left a.navbar__item'
      );
      links.forEach(a => {
        const label = a.textContent?.trim();
        if (label === 'Docs' && a.getAttribute('href') !== targetHref) {
          a.setAttribute('href', targetHref);
        }
      });
    };

    patch();

    // Docusaurus may re-render navbar links; observe and re-apply.
    const observer = new MutationObserver(patch);
    const navbar = document.querySelector('.navbar');
    if (navbar) observer.observe(navbar, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isKoreanDoc]);

  return (
    <>
      <OriginalNavbar {...props} />
      <style>{`
        .navbar__items--right {
          align-items: center;
        }
        .navbar__items--right .language-switcher-wrapper {
          margin-left: 1rem;
        }
      `}</style>
    </>
  );
}
