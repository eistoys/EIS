import {
  Created as CreatedEvent,
  EISHanabi as ESIHanabiContract,
} from "../generated/EISHanabi/EISHanabi";
import { HanabiRecord } from "../generated/schema";

export function handleCreated(event: CreatedEvent): void {
  let entity = new HanabiRecord(event.params.tokenId.toString());

  let contract = ESIHanabiContract.bind(event.address);
  entity.tokenId = event.params.tokenId;
  entity.creator = event.params.creator;
  entity.split = event.params.split.address_;
  entity.uri = contract.uri(event.params.tokenId);
  entity.referTo = event.params.record.referenceTokenIds.map<string>((value) =>
    value.toString()
  );
  entity.referedFrom = [];

  let referenceTokenIds = event.params.record.referenceTokenIds;
  for (let i = 0; i < referenceTokenIds.length; i++) {
    let referencedEntity = HanabiRecord.load(referenceTokenIds[i].toString());
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
