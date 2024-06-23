function ConceptPage() {
  return (
    <div className="flex flex-col items-center self-stretch px-16 pb-20 w-full text-lg leading-5 text-white max-md:px-5 max-md:mt-10 max-md:max-w-full break-all">
      <div className="flex flex-col mb-10 max-w-full w-[960px]">
        <div className="mt-16 text-4xl font-bold text-center max-md:mt-10 max-md:max-w-full max-md:text-4xl">
          Concept of Ethereum Image Service (EIS)
        </div>
        <div className="mt-16 text-2xl font-bold tracking-wide max-md:mt-10 max-md:max-w-full">
          What Ethereum Image Service (EIS) is
        </div>
        <div className="mt-5 tracking-wide leading-6 max-md:max-w-full">
          EIS is a canvas that lives in the sky. <br />
          Imagine that the whole world’s creations are stored in one space, and
          anyone can remix them. The more artworks are stored in EIS, the more
          remixable they become; we call this the network effect. The flywheel
          will start to jump up, then reach the astrosphere, and the public
          canvas will unlock the limit of human creativity. Additionally, EIS
          encourages artists to make public domains while they earn profit with
          EIS’s revenue streaming; that is precisely what blockchain technology
          can do.
        </div>
        <div className="mt-16 text-2xl font-bold tracking-wide max-md:mt-10 max-md:max-w-full">
          CC0 is Public Goods
        </div>
        <div className="justify-center px-3 mt-5 italic tracking-wide leading-6 border-l-2 border-white border-solid max-md:max-w-full">
          CC0 is a dedication of a work to the public domain. It is often
          mistakenly referred to as a license because it does affect the
          copyright to the work. But while a license describes what the
          rightsholder permits you to do, the CC0 dedication releases all rights
          so that no one is a rightsholder and the work belongs to the public.
          When you use CC0, you are releasing all rights under copyright and
          stating that you do not wish to have any control over the rights to
          the work—that the work is free for all uses by anyone.
        </div>
        <div className="mt-5 tracking-wide max-md:max-w-full">
          Reference:{" "}
          <a
            href="https://creativecommons.org/cc-and-nfts/"
            className="underline"
            target="_blank"
          >
            https://creativecommons.org/cc-and-nfts/
          </a>
        </div>
        <div className="justify-center px-3 mt-5 italic tracking-wide leading-6 border-l-2 border-white border-solid max-md:max-w-full">
          A public good (also referred to as a social good or collective good)is
          a good that is both non-excludable and non-rivalrous. Use by one
          person neither prevents access by other people, nor does it reduce
          availability to others. Therefore, the good can be used simultaneously
          by more than one person.
        </div>
        <div className="mt-5 tracking-wide leading-6 max-md:max-w-full">
          Reference:{" "}
          <a
            href="https://en.wikipedia.org/wiki/Public_good_(economics)"
            className="underline"
            target="_blank"
          >
            https://en.wikipedia.org/wiki/Public_good_(economics)
          </a>
          <br />
          <br />
          CC0 artworks are public goods because their copyrights are waived,
          making them non-exclusive and available for anyone to use. Blockchain
          technology can enable the monetization of public goods providers. This
          is something we have learned from blockchain itself, as well as from
          examples like Uniswap and Nouns.
        </div>
        <div className="mt-16 text-2xl font-bold tracking-wide max-md:mt-10 max-md:max-w-full">
          Infinite Remixability
        </div>
        <div className="mt-5 tracking-wide leading-6 max-md:max-w-full">
          SVGs offer infinite remixability to creators. Key advantages:
          <br />
          <br />
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              Scalability – Vector images are resolution-independent and can
              scale to any dimension without losing quality. Browsers just
              recalculate the math behind the image so there is no distortion.
              Raster images on the other hand lose their resolution when
              enlarged because their small pixels are forced to expand beyond
              their original size.
            </li>

            <li>
              Easily editable – Editing an SVG is as easy as changing the
              coordinates or a word in a text editor or coding the SVG onto your
              webpage and altering it with JavaScript or CSS. You can also use{" "}
              <a
                href="https://www.g2crowd.com/categories/vector-graphics"
                className="underline"
                target="_blank"
              >
                popular vector graphics editing software
              </a>{" "}
              such as Adobe Illustrator, Corel Draw, and Sketch.
            </li>

            <li>
              Compact file-size – Pixel-based images are saved at a large size
              from the start because you can only retain the quality when you
              make the image smaller, but not when you make it larger. This can
              impact a site’s download speed. Since SVGs are scalable, they can
              be saved at a minimal file size.
            </li>
          </ol>
          <br />
          Reference:{" "}
          <a
            href="https://explaineverything.com/blog/uncategorized/5-advantages-using-svgs/"
            className="underline"
            target="_blank"
          >
            https://explaineverything.com/blog/uncategorized/5-advantages-using-svgs/
          </a>
          <br />
          <br />
          SVGs are ideal for illustrations like logos, icons, and graphs, making
          them suitable for fully on-chain artwork and asynchronous
          collaboration among creators. EIS promotes the creation of diverse
          artworks through these advantages.
        </div>
        <div className="mt-16 text-2xl font-bold tracking-wide max-md:mt-10 max-md:max-w-full">
          Revenue Streaming
        </div>
        <div className="mt-5 tracking-wide leading-6 max-md:max-w-full">
          A crucial aspect of CC0 NFT is that more propagated artwork captures
          value. Propagation includes SNS virality and derivative creations,
          facilitated by blockchain technology. EIS supports this by enabling
          such artwork to earn revenue through revenue streaming. Creators of
          well-propagated artwork will profit from derivative NFT minting.
        </div>
        <div className="mt-16 text-2xl font-bold tracking-wide max-md:mt-10 max-md:max-w-full">
          Conclusion
        </div>
        <div className="mt-5 tracking-wide leading-6 max-md:max-w-full">
          Ethereum Image Service (EIS) represents a revolutionary platform that
          harnesses the power of blockchain technology to foster creativity and
          collaboration. By enabling artists to store and share their works as
          public goods, EIS unlocks infinite possibilities for remixing and
          revenue generation. The combination of SVG's scalability and
          editability with the principles of CC0 creates a dynamic ecosystem
          where art and innovation thrive. EIS is not just a tool for artists;
          it’s a movement towards a more open, collaborative, and creative
          future.
        </div>
      </div>
    </div>
  );
}

export default ConceptPage;
