import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  video?: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Native Multi-Shot Storytelling",
    video: "/img/dog_and_man_cheese_16-9.mp4",
    description: (
      <>
        Natively supports the generation of narrative videos with multiple cohesive shots. 
        It maintains consistency in the main subject, visual style, and atmosphere across 
        shot transitions and temporal-spatial shifts.
      </>
    ),
  },
  {
    title: "Diverse Stylistic Expression",
    video: "/img/baby_fox_seed_16-9.mp4",
    description: (
      <>
        From photorealism and cyberpunk to illustration and felt texture, our AI can 
        accurately interpret diverse stylistic prompts to support a wide range of creative needs.
      </>
    ),
  },
  {
    title: "Creativity Unleashed, Explore the Possibilities",
    video: "/img/squid_game_season_3_U.S._Edition_Insights_TikTok_9-16.mp4",
    description: (
      <>
        From surreal fantasy and daily life documentaries to professional-grade commercial shorts, 
        kvidAI empowers creators and developers worldwide. Browse our curated showcase to spark 
        your next great idea.
      </>
    ),
  },
];

function Feature({ title, video, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        {video && (
          <video 
            className={styles.featureVideo} 
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function AdditionalShowcase(): JSX.Element {
  return (
    <section className={styles.showcase}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <div className="text--center">
              <video 
                className={styles.showcaseVideo} 
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src="/img/말자말자의_댄스_퍼포먼스_TikTok_9-16.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className="col col--6">
            <div className="padding-horiz--md">
              <Heading as="h2">K-pop & K-beauty Specialized AI</Heading>
              <p>
                Experience cutting-edge AI technology optimized for Korean culture and aesthetics. 
                Our platform delivers exceptional results for K-pop content creation, K-beauty 
                campaigns, and Korean cultural content that resonates with global audiences.
              </p>
              <div className={styles.showcaseButtons}>
                <a 
                  className="button button--primary button--lg" 
                  href="https://app.kvid.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Try kvidAI Now
                </a>
                <a 
                  className="button button--secondary button--lg" 
                  href="/docs/api-services/overview"
                >
                  View API Docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <>
      <section className={styles.features}>
        <div className="container">
          <div className="row">
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
      <AdditionalShowcase />
    </>
  );
}