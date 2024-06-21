// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// import "solady/src/auth/Ownable.sol";
import "solady/src/utils/Base64.sol";
import "solady/src/utils/LibString.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/SSTORE2.sol";

import {IERC165} from "./interfaces/IERC165.sol";
import {IRenderer1155} from "./interfaces/IRenderer1155.sol";
import {IZoraCreator1155} from "./interfaces/IZoraCreator1155.sol";
import {IZoraCreator1155Factory} from "./interfaces/IZoraCreator1155Factory.sol";
import {ICreatorRoyaltiesControl} from "./interfaces/ICreatorRoyaltiesControl.sol";

import {ISplitFactoryV2} from "./interfaces/ISplitFactoryV2.sol";
import {SplitV2Lib} from "./libraries/SplitV2Lib.sol";

import "hardhat/console.sol";

contract EIS is IRenderer1155 {
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
        string name;
        string description;
        Compression imageCompression;
        string imageMimeType;
        address[] imageStorages;
        uint256[] referenceTokenIds;
    }

    struct Split {
        address address_;
        SplitV2Lib.Split params;
    }

    mapping(uint256 => Record) public records;
    mapping(uint256 => Split) public splits;

    ISplitFactoryV2 public pullSplitFactory;
    IZoraCreator1155Factory public zoraCreator1155Factory;
    IZoraCreator1155 public zoraCreator1155;

    uint256 public constant CONTRACT_BASE_ID = 0;

    address public treasuryAddress;
    uint256 public basisPointsBase;
    uint256 public protocolFeeBasisPoints;
    uint16 public distributionIncentive;

    constructor(
        IZoraCreator1155Factory zoraCreator1155Factory_,
        ISplitFactoryV2 pullSplitFactory_,
        address treasuryAddress_,
        uint256 basisPointsBase_,
        uint256 protocolFeeBasisPoints_,
        uint16 distributionIncentive_
    ) {
        zoraCreator1155Factory = zoraCreator1155Factory_;
        pullSplitFactory = pullSplitFactory_;
        treasuryAddress = treasuryAddress_;
        basisPointsBase = basisPointsBase_;
        protocolFeeBasisPoints = protocolFeeBasisPoints_;
        distributionIncentive = distributionIncentive_;
    }

    function createZoraCreator1155Contract(
        string memory name,
        string memory description,
        Compression imageCompression,
        string memory imageMimeType,
        bytes[] memory imageChunks
    ) public {
        require(
            zoraCreator1155 == IZoraCreator1155(address(0x0)),
            "EIS: ZoraCreator1155 contract already created"
        );
        records[CONTRACT_BASE_ID] = Record({
            creator: address(this),
            name: name,
            description: description,
            imageCompression: imageCompression,
            imageMimeType: imageMimeType,
            imageStorages: _setImage(imageChunks),
            referenceTokenIds: new uint256[](0)
        });

        bytes[] memory setupActions = new bytes[](1);
        setupActions[0] = abi.encodeWithSelector(
            IZoraCreator1155.setTokenMetadataRenderer.selector,
            CONTRACT_BASE_ID,
            address(this)
        );

        zoraCreator1155 = IZoraCreator1155(
            zoraCreator1155Factory.createContract({
                contractURI: "",
                name: "EIS",
                defaultRoyaltyConfiguration: ICreatorRoyaltiesControl
                    .RoyaltyConfiguration(0, 500, treasuryAddress),
                defaultAdmin: payable(address(this)),
                setupActions: setupActions
            })
        );
    }

    function create(
        string memory name,
        string memory description,
        Compression imageCompression,
        string memory imageMimeType,
        bytes[] memory imageChunks,
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
            name: name,
            description: description,
            imageCompression: imageCompression,
            imageMimeType: imageMimeType,
            imageStorages: _setImage(imageChunks),
            referenceTokenIds: new uint256[](0)
        });

        splits[tokenId] = Split({
            address_: pullSplitFactory.createSplit(
                splitParams,
                address(this),
                msg.sender
            ),
            params: splitParams
        });

        emit Created(tokenId, msg.sender, records[tokenId]);
    }

    function unzip(bytes memory data) public pure returns (bytes memory) {
        return abi.encodePacked(LibZip.flzDecompress(data));
    }

    function loadRawImage(uint256 tokenId) public view returns (bytes memory) {
        bytes memory data;
        address[] memory imageStorages = records[tokenId].imageStorages;
        for (uint8 i = 0; i < imageStorages.length; i++) {
            data = abi.encodePacked(data, SSTORE2.read(imageStorages[i]));
        }
        if (records[tokenId].imageCompression == Compression.ZIP) {
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

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(
            records[tokenId].creator != address(0x0),
            "EIS: image doesn't exist"
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;utf8,{",
                    '"name": "',
                    records[tokenId].name,
                    '", "description": "',
                    records[tokenId].description,
                    '", "creator": "',
                    LibString.toHexString(records[tokenId].creator),
                    '", "image": "',
                    loadImage(tokenId),
                    '"}'
                )
            );
    }

    function contractURI() public view override returns (string memory) {
        return uri(CONTRACT_BASE_ID);
    }

    function setup(bytes memory initData) public override {
        // not implemented
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external pure override returns (bool) {
        console.log("supportsInterface called");

        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IRenderer1155).interfaceId;
    }

    function _setImage(
        bytes[] memory image
    ) internal returns (address[] memory) {
        address[] memory imageStorages = new address[](image.length);
        for (uint8 i = 0; i < image.length; i++) {
            imageStorages[i] = (SSTORE2.write(image[i]));
        }
        return imageStorages;
    }
}
