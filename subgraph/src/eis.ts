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
  entity.referTo = event.params.record.referenceTokenIds.map<string>((value) =>
    value.toString()
  );
  entity.referedFrom = [];

  let referenceTokenIds = event.params.record.referenceTokenIds;
  for (let i = 0; i < referenceTokenIds.length; i++) {
    let referencedEntity = Record.load(referenceTokenIds[i].toString());
    if (referencedEntity) {
      let referedFrom = referencedEntity.referedFrom || [];
      referedFrom.push(event.params.tokenId.toString());
      referedFrom.sort();
      referencedEntity.referedFrom = referedFrom;
      referencedEntity.save();
    }
  }

  entity.save();
}
