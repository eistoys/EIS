// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IZoraCreatorFixedPriceSaleStrategy {
    struct SalesConfig {
        uint64 saleStart;
        uint64 saleEnd;
        uint64 maxTokensPerAddress;
        uint96 pricePerToken;
        address fundsRecipient;
    }

    function setSale(uint256 tokenId, SalesConfig memory salesConfig) external;
}
