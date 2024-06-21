// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ICreatorRoyaltiesControl {
    struct RoyaltyConfiguration {
        uint32 royaltyMintSchedule;
        uint32 royaltyBPS;
        address royaltyRecipient;
    }
}
