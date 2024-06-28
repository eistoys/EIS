import { Avatar, Badge, Name, Identity, Address } from '@coinbase/onchainkit/identity';
import { Address as AddressType } from "viem"; 

const CreatorIdentity = ({ address }: { address: string }) => {
  return (
    <Identity
      className="bg-transparent"
      address={address as AddressType}
    >
      <Avatar />
      <Name className="text-white">
        <Badge />
      </Name>
      <Address className="text-white" />
    </Identity>
  )
}

export default CreatorIdentity;