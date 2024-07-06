export interface Record {
  tokenId: string;
  creator: string;
  image: string;
  name: string;
  description: string;
  referTo: string[];
  referedFrom: string[];
  minted: number;
}
