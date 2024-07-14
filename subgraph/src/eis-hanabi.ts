import { BigInt, Address } from "@graphprotocol/graph-ts";
import { constants } from "@amxx/graphprotocol-utils";

import {
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent,
  Created as CreatedEvent,
  EISHanabi as ESIHanabiContract,
} from "../generated/EISHanabi/EISHanabi";
import { HanabiRecord } from "../generated/schema";

export function handleCreated(event: CreatedEvent): void {
  let entity = new HanabiRecord(event.params.tokenId.toString());

  let contract = ESIHanabiContract.bind(event.address);
  entity.tokenId = event.params.tokenId;
  entity.creator = event.params.creator;
  entity.uri = contract.uri(event.params.tokenId);
  entity.referTo = event.params.record.referenceTokenIds.map<string>((value) =>
    value.toString()
  );
  entity.referedFrom = [];
  entity.minted = 0;
  entity.name = event.params.record.name;
  entity.description = event.params.record.description;

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

function registerTransfer(
  from: Address,
  to: Address,
  tokenId: BigInt,
  value: i32
): void {
  let entity = HanabiRecord.load(tokenId.toString());
  if (entity == null) {
    // Initialize a new entity if it does not exist
    entity = new HanabiRecord(tokenId.toString());
    entity.tokenId = tokenId;
    entity.creator = Address.zero(); // Assuming a default value
    entity.uri = "";
    entity.referTo = [];
    entity.referedFrom = [];
    entity.minted = 0;
    entity.name = "";
    entity.description = "";
  }
  if (from == constants.ADDRESS_ZERO) {
    entity.minted = entity.minted + value;
  }
  if (to == constants.ADDRESS_ZERO) {
    entity.minted = entity.minted + value;
  }
  entity.save();
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  registerTransfer(
    event.params.from,
    event.params.to,
    event.params.id,
    event.params.value.toI32()
  );
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let ids = event.params.ids;
  let values = event.params.values;
  for (let i = 0; i < ids.length; ++i) {
    registerTransfer(
      event.params.from,
      event.params.to,
      ids[i],
      values[i].toI32()
    );
  }
}
