import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";
import { useMemo } from "react";

const getRandomAvatar = (seed: string) => {
  const avatar = createAvatar(identicon, {
    seed: seed,
    size: 32,
  });
  return avatar.toDataUri();
};

export const DefaultAvatar = ({
  seed,
  className,
}: {
  seed?: string;
  className: string;
}) => {
  const img = useMemo(() => {
    if (!seed) {
      return "";
    }
    return getRandomAvatar(seed.toLowerCase());
  }, [seed]);

  return (
    <div className={`rounded-full overflow-hidden ${className}`}>
      <img
        src={img}
        alt="Loading Avatar"
        className="rounded-full w-full h-full object-cover"
      />
    </div>
  );
};
