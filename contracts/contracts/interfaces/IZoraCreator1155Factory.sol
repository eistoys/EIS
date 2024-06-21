// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICreatorRoyaltiesControl} from "./ICreatorRoyaltiesControl.sol";

interface IZoraCreator1155Factory {
    function createContract(
        string memory contractURI,
        string calldata name,
        ICreatorRoyaltiesControl.RoyaltyConfiguration
            memory defaultRoyaltyConfiguration,
        address payable defaultAdmin,
        bytes[] calldata setupActions
    ) external returns (address);
}
