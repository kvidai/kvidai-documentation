import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import LanguageSwitcher from '@site/src/components/LanguageSwitcher';

export default function Navbar(props: any): JSX.Element {
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