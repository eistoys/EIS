export const ArtworkListItem = () => {
  return (
    <div>
      <div className="bg-white rounded-3xl aspect-square mb-4" />
      <div className="flex space-x-3 font-semibold text-white items-center mb-4">
        <div className="rounded-full bg-zinc-500 h-[30px] w-[30px]" />
        <div className="">consome.eth</div>
      </div>
      <div className="flex space-x-2 font-bold">
        <button className="w-full flex justify-center items-center px-4 py-2 text-white bg-blue-600 rounded-xl space-x-3 hover:opacity-75">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc3e19d227e2bf6ee5f8fd6813316690db486ab3861739ef2df46d9675f1df82?"
            className="my-auto w-4 h-4"
          />
          <div>MINT</div>
        </button>
        <button className="w-full flex justify-center items-center px-4 py-2 text-blue-[#191D88] bg-[#FFD582] rounded-xl space-x-3 hover:opacity-75">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/74adfd0e2048e52c1ba6d8c41acbd81f99084a137f2e45e27bf071dbf79264c1?"
            className="my-auto w-4 h-4"
          />
          <div>REMIX</div>
        </button>
      </div>
    </div>
  );
};
