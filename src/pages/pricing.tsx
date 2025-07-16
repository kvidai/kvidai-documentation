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

export default function Pricing(): JSX.Element {
  return (
    <Layout
      title="Pricing"
      description="kvidAI API pricing for image and video generation">
      <main className={styles.pricingMain}>
        <div className="container">
          <div className={styles.pricingHeader}>
            <h1 className={styles.title}>Simple, Transparent Pricing</h1>
            <p className={styles.subtitle}>
              One subscription plan with 4,500 credits per month
            </p>
          </div>

          <div className={styles.subscriptionSection}>
            <div className={styles.subscriptionCard}>
              <h2 className={styles.subscriptionTitle}>Monthly Subscription</h2>
              <div className={styles.subscriptionPrice}>
                <span className={styles.priceAmount}>4,500</span>
                <span className={styles.priceUnit}>credits/month</span>
              </div>
              <p className={styles.subscriptionDesc}>
                Use your credits for any of our AI generation APIs
              </p>
              <a href="https://kvid.ai.kr" className={styles.subscribeButton}>
                Subscribe Now
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
                { label: "Per Megapixel", price: "16 credits/mpx", credit: 16 }
              ]}
            />

            <PricingCard
              title="Video Generation API"
              subtitle="Choose between v1 or v2 models"
              items={[
                { label: "v1 - 480p Resolution", price: "90 credits", credit: 90 },
                { label: "v1 - 720p Resolution", price: "160 credits", credit: 160 },
                { label: "v2 - 480p Resolution", price: "60 credits", credit: 60 },
                { label: "v2 - 720p Resolution", price: "81 credits", credit: 81 },
                { label: "v2 - 1080p Resolution", price: "134 credits", credit: 134 }
              ]}
            />
          </div>

          <div className={styles.pricingInfo}>
            <div className={styles.infoCard}>
              <h3>How It Works</h3>
              <p>
                Subscribe monthly and receive 4,500 credits. Use them across 
                all our AI APIs based on your needs.
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
                Monitor your credit usage in real-time through 
                our developer portal.
              </p>
            </div>
          </div>

          <div className={styles.ctaSection}>
            <h2>Ready to Get Started?</h2>
            <div className={styles.ctaButtons}>
              <a href="https://developers.kvid.ai" className={styles.primaryButton}>
                Get API Key
              </a>
              <a href="https://console.kvid.ai" className={styles.secondaryButton}>
                View Console
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}