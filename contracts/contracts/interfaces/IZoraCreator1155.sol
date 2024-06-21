// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IRenderer1155} from "./IRenderer1155.sol";
import {IMinter1155} from "./IMinter1155.sol";

interface IZoraCreator1155 {
    function setTokenMetadataRenderer(
        uint256 tokenId,
        IRenderer1155 renderer
    ) external;

    function setupNewToken(
        string calldata newURI,
        uint256 maxSupply
    ) external returns (uint256);

    function callSale(
        uint256 tokenId,
        IMinter1155 salesConfig,
        bytes memory data
    ) external;
}
