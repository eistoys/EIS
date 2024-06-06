export const Header = () => {
  return (
    <div className="flex gap-5 justify-between self-stretch px-20 py-3.5 w-full text-lg tracking-wide whitespace-nowrap border-b border-solid border-zinc-600 max-md:flex-wrap max-md:px-5 max-md:max-w-full">
      <div className="flex gap-5 justify-between self-start font-bold text-white leading-[133%]">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/25e3342850ce21052676a01dedb5f645fecf9250a5954566eb594ca37e98c618?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
          className="shrink-0 max-w-full aspect-[2.94] w-[118px]"
        />
        <div className="my-auto ml-12 hidden md:block">CONCEPT</div>
      </div>
      <div className="flex gap-8 justify-between font-bold leading-[89%] text-zinc-500 hidden md:flex">
        <div className="flex flex-col justify-center py-3 px-4 bg-[#335228] border-2 border-solid border-zinc-500 rounded-[100px]">
          <div className="flex gap-2.5 justify-center px-2.5">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4bd193df71773fb15d9e5e5c72a7601e042b0312257dc1566a35328af6dd9544?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
              className="shrink-0 aspect-square border-zinc-500 stroke-[2px] stroke-zinc-500 w-[18px]"
            />
            <div>CREATE</div>
          </div>
        </div>
        <div className="justify-center self-start py-3 px-4 border-2 border-solid border-zinc-500 rounded-[100px] max-md:px-5">
          CONNECT
        </div>
      </div>
    </div>
  );
};
