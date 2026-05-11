import React from 'react';
import Layout from '@theme/Layout';
import styles from './pricing.module.css';

interface PricingCardProps {
  title: string;
  subtitle?: string;
  items: Array<{
    label: string;
    price: string;
    credit: number;
  }>;
  featured?: boolean;
}

function PricingCard({ title, subtitle, items, featured = false }: PricingCardProps) {
  return (
    <div className={`${styles.pricingCard} ${featured ? styles.featured : ''}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
      </div>
      <div className={styles.cardBody}>
        {items.map((item, index) => (
          <div key={index} className={styles.pricingItem}>
            <span className={styles.itemLabel}>{item.label}</span>
            <div className={styles.itemPrice}>
              <span className={styles.creditAmount}>{item.credit}</span>
              <span className={styles.creditLabel}>credits</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <Layout
      title="Pricing"
      description="kvidAI API pricing for image and video generation">
      <main className={styles.pricingMain}>
        <div className="container">
          <div className={styles.pricingHeader}>
            <h1 className={styles.title}>Simple, Transparent Pricing</h1>
            <p className={styles.subtitle}>
              Starter from $10 · Monthly Package $30 (best value per credit)
            </p>
          </div>

          <div className={styles.subscriptionSection}>
            <div className={styles.subscriptionCard}>
              <h2 className={styles.subscriptionTitle}>Starter</h2>
              <div className={styles.subscriptionPrice}>
                <span className={styles.priceAmount}>700</span>
                <span className={styles.priceUnit}>credits · $10</span>
              </div>
              <p className={styles.subscriptionDesc}>
                Try kvidAI with low commitment — valid for 30 days
              </p>
              <a href="https://kvid.ai/credits/purchase" className={styles.subscribeButton}>
                Buy Credits
              </a>
            </div>
            <div className={`${styles.subscriptionCard} ${styles.featured}`}>
              <h2 className={styles.subscriptionTitle}>Monthly Package ⭐</h2>
              <div className={styles.subscriptionPrice}>
                <span className={styles.priceAmount}>3,000</span>
                <span className={styles.priceUnit}>credits · $30</span>
              </div>
              <p className={styles.subscriptionDesc}>
                Best value — $10 per 1,000 credits, valid for 30 days
              </p>
              <a href="https://kvid.ai/credits/purchase" className={styles.subscribeButton}>
                Buy Credits
              </a>
            </div>
          </div>

          <div className={styles.apiCostsHeader}>
            <h2>API Credit Usage</h2>
            <p>Here's how many credits each API endpoint consumes</p>
          </div>

          <div className={styles.pricingGrid}>
            <PricingCard
              title="Image Generation API"
              items={[
                { label: "Per Megapixel", price: "7.5 credits/mpx", credit: 7.5 }
              ]}
            />

            <PricingCard
              title="Video Generation API"
              subtitle="Choose between wan or seadance models"
              items={[
                { label: "v1 - 480p Resolution", price: "60 credits", credit: 60 },
                { label: "v1 - 720p Resolution", price: "120 credits", credit: 120 },
                { label: "v2 - 480p Resolution", price: "39 credits", credit: 39 },
                { label: "v2 - 720p Resolution", price: "54 credits", credit: 54 },
                { label: "v2 - 1080p Resolution", price: "89 credits", credit: 89 }
              ]}
            />
          </div>

          <div className={styles.pricingInfo}>
            <div className={styles.infoCard}>
              <h3>How It Works</h3>
              <p>
                Pick the Starter ($10 / 700 credits) or Monthly Package
                ($30 / 3,000 credits) — both valid for 30 days — and spend
                credits across every AI API based on your needs.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>Flexible Models</h3>
              <p>
                Choose between different models and resolutions.
                v2 offers better quality at lower credit cost.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>Track Usage</h3>
              <p>
                Monitor your credit usage in real-time on
                your kvid.ai dashboard.
              </p>
            </div>
          </div>

          <div className={styles.ctaSection}>
            <h2>Ready to Get Started?</h2>
            <div className={styles.ctaButtons}>
              <a href="https://kvid.ai/settings/api-keys" className={styles.primaryButton}>
                Get API Key
              </a>
              <a href="https://kvid.ai/dashboard" className={styles.secondaryButton}>
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}