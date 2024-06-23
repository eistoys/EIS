import {
  Created as CreatedEvent,
  EIS as ESIContract,
} from "../generated/EIS/EIS";
import { Record } from "../generated/schema";

export function handleCreated(event: CreatedEvent): void {
  let entity = new Record(event.params.tokenId.toString());
  let contract = ESIContract.bind(event.address);
  entity.creator = event.params.creator;
  entity.uri = contract.uri(event.params.tokenId);
  entity.save();
}
