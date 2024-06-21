// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "solady/src/auth/Ownable.sol";
import "solady/src/utils/Base64.sol";
import "solady/src/utils/LibString.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/SSTORE2.sol";

import {IZoraCreator1155} from "./interfaces/IZoraCreator1155.sol";
import {IZoraCreator1155Factory} from "./interfaces/IZoraCreator1155Factory.sol";
import {ICreatorRoyaltiesControl} from "./interfaces/ICreatorRoyaltiesControl.sol";

import {ISplitFactoryV2} from "./interfaces/ISplitFactoryV2.sol";
import {SplitV2Lib} from "./libraries/SplitV2Lib.sol";

contract EIS is Ownable {
    event Created(
        uint256 indexed tokenId,
        address indexed creator,
        Record record
    );

    enum Compression {
        None,
        ZIP
    }

    struct Record {
        address creator;
        address split;
        string name;
        string description;
        Compression imageCompression;
        string imageMimeType;
        address[] imageStorages;
        uint256[] referenceTokenIds;
        SplitV2Lib.Split splitParams;
    }

    mapping(uint256 => Record) public records;

    ISplitFactoryV2 public pullSplitFactory;
    IZoraCreator1155Factory public zoraCreatorFactory;
    IZoraCreator1155 public zoraCreator1155;

    uint256 public constant CONTRACT_BASE_ID = 0;

    address public treasuryAddress;
    uint256 public basisPointsBase;
    uint256 public protocolFeeBasisPoints;
    uint16 public distributionIncentive;

    constructor(
        IZoraCreator1155Factory zoraCreatorFactory_,
        ISplitFactoryV2 pullSplitFactory_,
        address treasuryAddress_,
        uint256 basisPointsBase_,
        uint256 protocolFeeBasisPoints_,
        uint16 distributionIncentive_,
        string memory name,
        string memory description,
        Compression imageCompression,
        string memory imageMimeType,
        bytes[] memory imageChunks
    ) {
        zoraCreatorFactory = zoraCreatorFactory_;
        pullSplitFactory = pullSplitFactory_;
        treasuryAddress = treasuryAddress_;
        basisPointsBase = basisPointsBase_;
        protocolFeeBasisPoints = protocolFeeBasisPoints_;
        distributionIncentive = distributionIncentive_;
        _createZoraCreator1155Contract({
            name: name,
            description: description,
            imageCompression: imageCompression,
            imageMimeType: imageMimeType,
            imageChunks: imageChunks
        });
    }

    function _createZoraCreator1155Contract(
        string memory name,
        string memory description,
        Compression imageCompression,
        string memory imageMimeType,
        bytes[] memory imageChunks
    ) internal {
        bytes[] memory actions = new bytes[](1);
        actions[0] = abi.encodeWithSignature(
            "setTokenMetadataRenderer(uint256,IRenderer1155)",
            CONTRACT_BASE_ID,
            address(this)
        );
        zoraCreator1155 = IZoraCreator1155(
            zoraCreatorFactory.createContract({
                contractURI: "",
                name: "EIS",
                defaultRoyaltyConfiguration: ICreatorRoyaltiesControl
                    .RoyaltyConfiguration(0, 500, treasuryAddress),
                defaultAdmin: payable(address(this)),
                setupActions: actions
            })
        );
    }

    function create(
        string memory name,
        string memory description,
        Compression imageCompression,
        string memory imageMimeType,
        bytes[] calldata imageChunks,
        uint256 maxSupply
    ) public {
        uint256 tokenId = zoraCreator1155.setupNewToken({
            newURI: "",
            maxSupply: maxSupply
        });

        // TODO: set split with treasuryAddress
        address[] memory recipients = new address[](1);
        recipients[0] = msg.sender;

        uint256[] memory allocations = new uint256[](1);
        allocations[0] = basisPointsBase;

        SplitV2Lib.Split memory splitParams = SplitV2Lib.Split({
            recipients: recipients,
            allocations: allocations,
            totalAllocation: basisPointsBase,
            distributionIncentive: distributionIncentive
        });

        records[tokenId] = Record({
            creator: msg.sender,
            split: pullSplitFactory.createSplit(
                splitParams,
                address(this),
                msg.sender
            ),
            name: name,
            description: description,
            imageCompression: imageCompression,
            imageMimeType: imageMimeType,
            imageStorages: _setImage(imageChunks),
            referenceTokenIds: new uint256[](0),
            splitParams: splitParams
        });

        emit Created(tokenId, msg.sender, records[tokenId]);
    }

    function unzip(bytes memory data) public pure returns (bytes memory) {
        return abi.encodePacked(LibZip.flzDecompress(data));
    }

    function loadRawImage(uint256 tokenId) public view returns (bytes memory) {
        bytes memory data;
        Record memory record = records[tokenId];
        address[] memory imageStorages = record.imageStorages;
        for (uint8 i = 0; i < imageStorages.length; i++) {
            data = abi.encodePacked(data, SSTORE2.read(imageStorages[i]));
        }
        if (record.imageCompression == Compression.ZIP) {
            data = unzip(data);
        }
        return data;
    }

    function loadImage(uint256 tokenId) public view returns (string memory) {
        bytes memory data = loadRawImage(tokenId);
        return
            string(
                abi.encodePacked(
                    "data:",
                    records[tokenId].imageMimeType,
                    ";base64,",
                    Base64.encode(data)
                )
            );
    }

    function uri(uint256 tokenId) public view returns (string memory) {
        Record memory record = records[tokenId];
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
                    LibString.toHexString(record.creator),
                    '", "image": "',
                    loadImage(tokenId),
                    '"}'
                )
            );
    }

    function _setImage(
        bytes[] calldata image
    ) internal returns (address[] memory) {
        address[] memory imageStorages = new address[](image.length);
        for (uint8 i = 0; i < image.length; i++) {
            imageStorages[i] = (SSTORE2.write(image[i]));
        }
        return imageStorages;
    }
}
