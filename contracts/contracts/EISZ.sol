// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IZoraCreator1155Factory} from "./interfaces/IZoraCreator1155Factory.sol";
import {ICreatorRoyaltiesControl, RoyaltyConfiguration} from "./interfaces/ICreatorRoyaltiesControl.sol";
import {Renderer1155Impl} from "./Renderer1155Impl.sol";
import {SplitV2Lib} from "./libraries/SplitV2Lib.sol";

import "solady/src/utils/SSTORE2.sol";
import "solady/src/utils/Base64.sol";

contract EISZ {
    // Record の構造体をどこで定義するべきか検討
    event Created(
        address indexed newContract,
        address indexed creator,
        Record record
    );

    struct Record {
        address creator;
        address split;
        string name;
        string description;
        address[] imageChunks;
        uint256[] referenceTokenIds;
        SplitV2Lib.Split splitParams;
    }

    IZoraCreator1155Factory public zoraCreatorFactory;
    address public treasuryAddress;
    address public defaultAdmin;
    mapping(uint256 => Record) public records;

    constructor(address zoraCreatorFactory_, address treasuryAddress_) {
        zoraCreatorFactory = IZoraCreator1155Factory(zoraCreatorFactory_);
        treasuryAddress = treasuryAddress_;
        defaultAdmin = address(this);
    }

    function create(
        string memory contractURI,
        string memory name,
        address payable creator,
        bytes[] calldata setupActions
    ) external returns (address) {
        // ロイヤリティの設定
        RoyaltyConfiguration memory royaltyConfig = RoyaltyConfiguration({
            receiver: treasuryAddress,
            percentage: 500 // 仮で5%を設定
        });

        Renderer1155Impl renderer = new Renderer1155Impl();

        // Renderer1155Implのsetupの引数に対応する値を引数に渡す
        bytes memory rendererSetupData = abi.encode(
            0,
            creator,
            address(0), // Splitのアドレスを指定する
            name,
            "desctiption for the collection",
            new address, // imageChunks を適切に指定
            new uint256, // referenceTokenIds を適切に指定
            SplitV2Lib.Split({
                recipients: new address, // 適切に指定
                allocations: new uint256, // 適切に指定
                totalAllocation: 10000, // 100% (basis points)
                distributionIncentive: 0 // 適切に指定
            })
        );

        bytes memory setRendererAction = abi.encodeWithSignature(
            "setTokenMetadataRenderer(uint256,IRenderer1155)",
            0, // tokenId 渡すデータを検討。
            rendererSetupData
        );

        bytes[] memory actions = new bytes[](setupActions.length + 1);
        for (uint i = 0; i < setupActions.length; i++) {
            actions[i] = setupActions[i];
        }
        actions[setupActions.length] = setRendererAction;

        address newContract = zoraCreatorFactory.createContract(
            contractURI,
            name,
            royaltyConfig,
            defaultAdmin,
            actions
        );

        emit ContractCreated(newContract, creator);
        return newContract;
    }

    function loadRawImage(uint256 tokenId) public view returns (bytes memory) {
        bytes memory data;
        address[] memory imageChunks = records[tokenId].imageChunks;
        for (uint8 i = 0; i < imageChunks.length; i++) {
            data = abi.encodePacked(data, SSTORE2.read(imageChunks[i]));
        }
        return LibZip.flzDecompress(data);
    }
}
