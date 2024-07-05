export interface ArtworkListItemRankingHeaderProps {
  ranking: number;
  title: string;
  minted: number;
}

export const ArtworkListItemRankingHeader: React.FC<
  ArtworkListItemRankingHeaderProps
> = ({ ranking, title, minted }) => {
  return (
    <div>
      <div className="text-2xl font-bold text-white mb-2">
        {ranking}# {title}
      </div>
      <div className="flex justify-end items-center space-x-2 mb-2">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc3e19d227e2bf6ee5f8fd6813316690db486ab3861739ef2df46d9675f1df82?"
          className="w-4 h-4"
        />
        <div className="text-white font-bold">
          <span className="mr-2">{minted}</span>Minted
        </div>
      </div>
    </div>
  );
};
