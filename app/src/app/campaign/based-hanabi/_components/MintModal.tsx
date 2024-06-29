export const MintModal = ({
  isOpen,
  close,
}: {
  isOpen: boolean;
  close: any;
}) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-25 backdrop-blur-sm">
          <div className="relative flex flex-col py-8 px-6 w-full max-w-lg rounded-xl shadow-2xl bg-[#191D88] m-4">
            <>
              <div className="flex mb-8">
                <div className="text-white text-xl font-bold tracking-wider">
                  Mint ✨
                </div>
                <button
                  className="absolute top-6 right-4 text-4xl text-white"
                  onClick={() => close()}
                >
                  &times;
                </button>
              </div>
              <div className="relative flex items-center mb-4">
                <button
                  type="button"
                  className="absolute left-0 text-white w-12 h-12"
                >
                  -
                </button>
                <input
                  type="text"
                  className="text-xl bg-[#191D88] border border-solid border-[#888888] rounded-xl focus:border-[#22CC02] focus:outline-none p-3 text-white w-full text-center px-12"
                  required
                  disabled
                  value={6}
                />
                <button
                  type="button"
                  className="absolute right-0 text-white w-12 h-12"
                >
                  +
                </button>
              </div>
              <button className="font-bold w-full flex justify-center items-center px-4 py-3 text-white bg-blue-600 rounded-xl space-x-4 hover:opacity-75 transition-opacity duration-300 tracking-wider mb-2">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc3e19d227e2bf6ee5f8fd6813316690db486ab3861739ef2df46d9675f1df82?"
                  className="my-auto w-5 h-5"
                />
                <div className="">MINT TO VOTE</div>
              </button>
            </>
          </div>
        </div>
      )}
    </>
  );
};
