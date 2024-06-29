export default function CampaignBasedHanabiPage() {
  return (
    <div>
      <div className="relative py-8">
        <img
          src="/assets/campaign/based-hanabi/hero-background.svg"
          className="absolute w-full object-cover h-80 md:h-[500px] opacity-20"
        />
        <div className="relative h-80 md:h-[500px] flex flex-col justify-center">
          <img
            src="/assets/campaign/based-hanabi/hero-text.svg"
            className="w-full max-w-4xl mx-auto"
          />
          <div className="text-white text-4xl md:text-6xl font-bold text-center tracking-wider">
            Remix Contest
          </div>
        </div>
      </div>
    </div>
  );
}
