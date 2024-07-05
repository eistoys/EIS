export interface Record {
  tokenId: string;
  creator: string;
  split: string;
  image: string;
  referTo: string[];
  referedFrom: string[];
  minted: number;
  name: string;
  description: string;
}
