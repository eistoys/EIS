// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICreatorCommands} from "./ICreatorCommands.sol";

interface IMinter1155 {
    function requestMint(
        address sender,
        uint256 tokenId,
        uint256 quantity,
        uint256 ethValueSent,
        bytes calldata minterArguments
    ) external returns (ICreatorCommands.CommandSet memory commands);
}
