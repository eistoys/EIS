// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "solady/src/utils/SSTORE2.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/Base64.sol";

import {ISplitFactoryV2} from "./interfaces/ISplitFactoryV2.sol";
import {IPullSplit} from "./interfaces/IPullSplit.sol";
import {SplitV2Lib} from "./libraries/SplitV2Lib.sol";

contract EISHanabi is ERC1155 {
    enum Compression {
        None,
        ZIP
    }

    event Created(
        uint256 indexed tokenId,
        address indexed creator,
        Record record
    );

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
    address public splitNativeToken;
    address public protocolTreasuryAddress;
    address public collectionOwnerTreasuryAddress;

    uint256 public tokenIdCounter;
    uint256 public fixedMintFee;
    uint256 public basisPointsBase;
    uint256 public protocolFeeBasisPoints;
    uint256 public collectionOwnerFeeBasisPoints;
    uint256 public remixFeeBasisPoints;

    constructor(
        address pullSplitFactoryAddress,
        address splitNativeToken_,
        address protocolTreasuryAddress_,
        address collectionOwnerTreasuryAddress_,
        uint256 fixedMintFee_,
        uint256 basisPointsBase_,
        uint256 protocolFeeBasisPoints_,
        uint256 collectionOwnerFeeBasisPoints_,
        uint256 remixFeeBasisPoints_
    ) ERC1155("") {
        pullSplitFactory = ISplitFactoryV2(pullSplitFactoryAddress);
        splitNativeToken = splitNativeToken_;
        protocolTreasuryAddress = protocolTreasuryAddress_;
        collectionOwnerTreasuryAddress = collectionOwnerTreasuryAddress_;
        fixedMintFee = fixedMintFee_;
        basisPointsBase = basisPointsBase_;
        protocolFeeBasisPoints = protocolFeeBasisPoints_;
        collectionOwnerFeeBasisPoints = collectionOwnerFeeBasisPoints_;
        remixFeeBasisPoints = remixFeeBasisPoints_;
    }

    function create(
        string memory name,
        string memory description,
        Compression imageCompression,
        string memory imageMimeType,
        bytes[] memory imageChunks,
        uint256[] memory referenceTokenIds,
        bool isInitialMintEnabled
    ) public {
        uint256 tokenId = tokenIdCounter++;
        address creator = _msgSender();
        uint256 totalAllocation = basisPointsBase;

        address[] memory recipients;
        uint256[] memory allocations;

        if (referenceTokenIds.length == 0) {
            recipients = new address[](1);
            allocations = new uint256[](1);
            recipients[0] = creator;
            allocations[0] = totalAllocation;
        } else {
            recipients = new address[](1 + referenceTokenIds.length);
            allocations = new uint256[](1 + referenceTokenIds.length);

            uint256 referencedTokensAllocation = (totalAllocation *
                remixFeeBasisPoints) / basisPointsBase;
            uint256 allocationPerReference = referencedTokensAllocation /
                referenceTokenIds.length;
            uint256 allocationTotal = allocationPerReference *
                referenceTokenIds.length;

            recipients[0] = creator;
            allocations[0] = totalAllocation - allocationTotal;

            for (uint256 i = 0; i < referenceTokenIds.length; i++) {
                // TODO: check if referenceTokenIds[i] exists
                recipients[i + 1] = records[referenceTokenIds[i]].creator;
                allocations[i + 1] = allocationPerReference;
            }
        }

        SplitV2Lib.Split memory splitParams = SplitV2Lib.Split({
            recipients: recipients,
            allocations: allocations,
            totalAllocation: totalAllocation,
            distributionIncentive: 0
        });

        records[tokenId] = Record({
            creator: creator,
            name: name,
            description: description,
            imageCompression: imageCompression,
            imageMimeType: imageMimeType,
            imageStorages: _setImage(imageChunks),
            referenceTokenIds: referenceTokenIds
        });

        address splitAddress = pullSplitFactory.createSplit(
            splitParams,
            address(this),
            creator
        );

        splits[tokenId] = Split({address_: splitAddress, params: splitParams});

        emit Created(tokenId, _msgSender(), records[tokenId]);

        if (isInitialMintEnabled) {
            _mint(creator, tokenId, 1, "");
        }
    }

    function mint(uint256 tokenId, uint256 amount) public payable {
        uint256 totalMintFee = fixedMintFee * amount;
        require(msg.value >= totalMintFee, "EIS: insufficient total mint fee");
        (
            uint256 protocolFee,
            uint256 collectionOwnerFee,
            uint256 creatorFee
        ) = getDividedFeesFromTotalMintFee(totalMintFee);

        payable(protocolTreasuryAddress).transfer(protocolFee);
        payable(collectionOwnerTreasuryAddress).transfer(collectionOwnerFee);
        payable(splits[tokenId].address_).transfer(creatorFee);
        IPullSplit(splits[tokenId].address_).distribute(
            splits[tokenId].params,
            splitNativeToken,
            address(this)
        );
        _mint(_msgSender(), tokenId, amount, "");
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
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
                    '", "image": "',
                    loadImageDataUrl(tokenId),
                    '"}'
                )
            );
    }

    function unzip(bytes memory data) public pure returns (bytes memory) {
        return abi.encodePacked(LibZip.flzDecompress(data));
    }

    function getDividedFeesFromTotalMintFee(
        uint256 totalMintFee
    ) public view returns (uint256, uint256, uint256) {
        uint256 protocolFee = (totalMintFee * protocolFeeBasisPoints) /
            basisPointsBase;
        uint256 collectionOwnerFee = (totalMintFee *
            collectionOwnerFeeBasisPoints) / basisPointsBase;
        uint256 creatorFee = totalMintFee - protocolFee - collectionOwnerFee;
        return (protocolFee, collectionOwnerFee, creatorFee);
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

    function loadImageDataUrl(
        uint256 tokenId
    ) public view returns (string memory) {
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

    function _setImage(
        bytes[] memory imageChunks
    ) internal returns (address[] memory) {
        address[] memory imageStorages = new address[](imageChunks.length);
        for (uint8 i = 0; i < imageChunks.length; i++) {
            imageStorages[i] = (SSTORE2.write(imageChunks[i]));
        }
        return imageStorages;
    }
}
