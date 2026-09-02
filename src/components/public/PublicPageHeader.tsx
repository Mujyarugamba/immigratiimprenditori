type PublicPageHeaderProps = {
  title: string;
  description: string;
  kicker?: string;
  motionWords?: readonly string[];
};

const defaultMotionWords = ["Dati", "Ricerca", "Storie", "Territori", "Impresa"];

export function PublicPageHeader({
  title,
  description,
  kicker = "Immigrati Imprenditori · Centro Studi",
  motionWords = defaultMotionWords,
}: PublicPageHeaderProps) {
  return (
    <div className="public-page-hero">
      <div className="public-page-motion" aria-hidden="true">
        <div className="public-page-motion-track">
          {[...motionWords, ...motionWords].map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
      </div>
      <div className="public-page-hero-copy">
        <p className="public-page-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p className="public-page-description">{description}</p>
      </div>
    </div>
  );
}
