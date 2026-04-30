import React from 'react';
import Logo from '@theme/Logo';
import { useLocation } from '@docusaurus/router';

/**
 * Navbar Logo — routes to the right home based on the current URL.
 *
 * Because this project stores Korean docs as a subtree under /docs/ko/
 * (instead of the standard Docusaurus i18n structure i18n/ko/...), the
 * default Logo href ("/") always points to the English home. This wrapper
 * detects when the user is inside /docs/ko/* and sends them to the Korean
 * landing page instead.
 */
export default function NavbarLogo(): JSX.Element {
  const location = useLocation();
  const isKoreanDoc = location.pathname.startsWith('/docs/ko');

  return (
    <Logo
      className="navbar__brand"
      imageClassName="navbar__logo"
      titleClassName="navbar__title text--truncate"
      to={isKoreanDoc ? '/docs/ko/intro' : '/'}
    />
  );
}
