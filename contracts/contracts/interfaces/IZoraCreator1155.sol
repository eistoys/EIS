// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IZoraCreator1155 {
    function mint(
        uint256 tokenId,
        uint256 amount,
        address frontendFeeRecipient
    ) external payable;

    function setupNewToken(
        string calldata newURI,
        uint256 maxSupply
    ) external returns (uint256);
}
