import { COINBASE_VERIFIED_ACCOUNT_SCHEMA_ID } from "@/config/const";
import { Avatar, Badge, Name, Identity, Address } from '@coinbase/onchainkit/identity';


const CreatorIdentity = ({ address }: { address: string }) => {
  return (
    <Identity
      className="bg-transparent"
      schemaId={COINBASE_VERIFIED_ACCOUNT_SCHEMA_ID}
      address={address as `0x${string}`}
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