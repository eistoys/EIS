// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {EISZ} from "./EISZ.sol";
import {IRenderer1155} from "./interfaces/IRenderer1155.sol";
import {IERC165Upgradeable} from "./interfaces/IERC165Upgradeable.sol";
import {SplitV2Lib} from "./libraries/SplitV2Lib.sol";

import "solady/src/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Renderer1155Impl is IRenderer1155 {
    EISZ public eisz;

    constructor(EISZ _eisz) {
        eisz = EISZ(_eisz);
    }

    // 権限設定を追加
    function setEISZAddress(address _eisz) external view {
        eisz = EISZ(_eisz);
    }

    function uri(uint256 tokenId) external view returns (string memory) {
        EISZ.Record memory record = eisz.getRecord(tokenId);
        require(record.creator != address(0x0), "EIS: image doesn't exist");
        return
            string(
                abi.encodePacked(
                    "data:application/json;utf8,{",
                    '"name": "',
                    record.name,
                    '", "description": "',
                    record.description,
                    '", "creator": "',
                    Strings.toHexString(record.creator),
                    '", "image": "',
                    loadImage(tokenId),
                    '"}'
                )
            );
    }

    function contractURI() external view returns (string memory) {
        EISZ.Record memory record = eisz.getRecord(0);
        require(record.creator != address(0x0), "EIS: image doesn't exist");
        return
            string(
                abi.encodePacked(
                    "data:application/json;utf8,{",
                    '"name": "',
                    record.name,
                    '", "description": "',
                    record.description,
                    '", "creator": "',
                    Strings.toHexString(record.creator),
                    '", "image": "',
                    loadImage(0),
                    '"}'
                )
            );
    }

    function setup(bytes memory initData) external {
        (
            uint256 tokenId,
            address creator,
            address split,
            string memory name,
            string memory description,
            address[] memory imageChunks,
            uint256[] memory referenceTokenIds,
            SplitV2Lib.Split memory splitParams
        ) = abi.decode(
                initData,
                (
                    uint256,
                    address,
                    address,
                    string,
                    string,
                    address[],
                    uint256[],
                    SplitV2Lib.Split
                )
            );
        eisz.setRecord(
            tokenId,
            creator,
            split,
            name,
            description,
            imageChunks,
            referenceTokenIds,
            splitParams
        );
    }

    function loadImage(uint256 tokenId) public view returns (string memory) {
        bytes memory data = eisz.loadRawImage(tokenId);
        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(data)
                )
            );
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external view override returns (bool) {
        return
            interfaceId == type(IRenderer1155).interfaceId ||
            interfaceId == type(IERC165Upgradeable).interfaceId;
    }
}
