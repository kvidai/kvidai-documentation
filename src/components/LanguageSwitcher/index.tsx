import React from 'react';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface LanguageSwitcherProps {
  className?: string;
}

// 한국어 번역이 있는 페이지 매핑
const KOREAN_PAGE_MAPPING: Record<string, string> = {
  '/': '/ko/',
  '/docs/intro': '/ko/',
  '/docs/api-services/overview': '/ko/docs/api-services',
  '/docs/getting-started': '/ko/docs/getting-started',
  // 필요에 따라 추가
};

// 영어 페이지 매핑 (한국어 → 영어)
const ENGLISH_PAGE_MAPPING: Record<string, string> = {
  '/ko/': '/',
  '/ko/docs/api-services': '/docs/api-services/overview',
  '/ko/docs/getting-started': '/docs/intro',
  // 필요에 따라 추가
};

function LanguageSwitcher({ className }: LanguageSwitcherProps): JSX.Element {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isKoreanPage = currentPath.startsWith('/ko/');
  const currentLang = isKoreanPage ? 'ko' : 'en';
  
  // 다른 언어 페이지 URL 찾기
  const getAlternateUrl = (targetLang: 'en' | 'ko'): string => {
    if (targetLang === 'ko') {
      // 영어 → 한국어
      return KOREAN_PAGE_MAPPING[currentPath] || '/ko/';
    } else {
      // 한국어 → 영어  
      return ENGLISH_PAGE_MAPPING[currentPath] || '/';
    }
  };
  
  const alternateUrl = getAlternateUrl(currentLang === 'en' ? 'ko' : 'en');
  const alternateLang = currentLang === 'en' ? 'ko' : 'en';
  const alternateLangDisplay = currentLang === 'en' ? '한국어' : 'English';
  
  // 번역 페이지 존재 여부 확인
  const hasTranslation = currentLang === 'en' 
    ? Object.keys(KOREAN_PAGE_MAPPING).includes(currentPath)
    : Object.keys(ENGLISH_PAGE_MAPPING).includes(currentPath);

  return (
    <div className={`${styles.languageSwitcher} ${className || ''}`}>
      <div className={styles.currentLang}>
        {currentLang === 'en' ? 'English' : '한국어'}
      </div>
      <div className={styles.separator}>|</div>
      {hasTranslation ? (
        <Link to={alternateUrl} className={styles.alternateLang}>
          {alternateLangDisplay}
        </Link>
      ) : (
        <span className={styles.alternateLangDisabled} title="번역 준비 중">
          {alternateLangDisplay}
        </span>
      )}
    </div>
  );
}

export default LanguageSwitcher;