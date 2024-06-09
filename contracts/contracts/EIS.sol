// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "solady/src/utils/SSTORE2.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/Base64.sol";

import {ISplitFactoryV2} from "./interfaces/ISplitFactoryV2.sol";
import {SplitV2Lib} from "./libraries/SplitV2Lib.sol";

contract EIS is ERC1155 {
    event Created(
        uint256 indexed tokenId,
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

    mapping(uint256 => Record) public records;

    ISplitFactoryV2 public pullSplitFactory;
    address public treasuryAddress;

    uint256 public tokenIdCounter;
    uint256 public fixedMintFee;
    uint256 public basisPointsBase;
    uint256 public protocolFeeBasisPoints;
    uint256 public frontendFeeBasisPoints;
    uint256 public royaltyFeeBasisPoints;
    uint16 public distributionIncentive;

    constructor(
        address pullSplitFactoryAddress,
        address treasuryAddress_,
        uint256 fixedMintFee_,
        uint256 basisPointsBase_,
        uint256 protocolFeeBasisPoints_,
        uint256 frontendFeeBasisPoints_,
        uint256 royaltyFeeBasisPoints_,
        uint16 distributionIncentive_
    ) ERC1155("") {
        pullSplitFactory = ISplitFactoryV2(pullSplitFactoryAddress);
        treasuryAddress = treasuryAddress_;
        fixedMintFee = fixedMintFee_;
        basisPointsBase = basisPointsBase_;
        protocolFeeBasisPoints = protocolFeeBasisPoints_;
        frontendFeeBasisPoints = frontendFeeBasisPoints_;
        royaltyFeeBasisPoints = royaltyFeeBasisPoints_;
        distributionIncentive = distributionIncentive_;
    }

    function create(
        string memory name,
        string memory description,
        bytes[] calldata image
    ) public {
        uint256 tokenId = tokenIdCounter++;
        address creator = _msgSender();

        address[] memory recipients = new address[](1);
        recipients[0] = creator;

        uint256 totalAllocation = basisPointsBase;

        uint256[] memory allocations = new uint256[](1);
        allocations[0] = basisPointsBase;

        SplitV2Lib.Split memory splitParams = SplitV2Lib.Split({
            recipients: recipients,
            allocations: allocations,
            totalAllocation: totalAllocation,
            distributionIncentive: distributionIncentive
        });

        address split = pullSplitFactory.createSplit(
            splitParams,
            address(this),
            creator
        );

        records[tokenId] = Record({
            creator: creator,
            split: split,
            name: name,
            description: description,
            imageChunks: _setImage(image),
            referenceTokenIds: new uint256[](0),
            splitParams: splitParams
        });

        emit Created(tokenId, _msgSender(), records[tokenId]);
    }

    function remix(
        string memory name,
        string memory description,
        bytes[] calldata image,
        uint256[] memory referenceTokenIds,
        uint256[] memory referenceAllocations
    ) public {
        uint256 tokenId = tokenIdCounter++;
        address creator = _msgSender();

        address[] memory recipients = new address[](
            1 + referenceTokenIds.length
        );
        recipients[0] = creator;
        for (uint8 i = 0; i < referenceTokenIds.length; i++) {
            recipients[i + 1] = records[referenceTokenIds[i]].split;
        }

        (
            uint256 totalAllocation,
            uint256 creatorAllocation
        ) = getTotalAllocationAndCreatorAllocation(referenceAllocations);

        uint256[] memory allocations = new uint256[](
            1 + referenceAllocations.length
        );

        allocations[0] = creatorAllocation;
        for (uint8 i = 0; i < referenceAllocations.length; i++) {
            allocations[i + 1] = referenceAllocations[i];
        }

        SplitV2Lib.Split memory splitParams = SplitV2Lib.Split({
            recipients: recipients,
            allocations: allocations,
            totalAllocation: totalAllocation,
            distributionIncentive: distributionIncentive
        });

        address split = pullSplitFactory.createSplit(
            splitParams,
            address(this),
            creator
        );

        records[tokenId] = Record({
            creator: creator,
            split: split,
            name: name,
            description: description,
            imageChunks: _setImage(image),
            referenceTokenIds: referenceTokenIds,
            splitParams: splitParams
        });

        emit Created(tokenId, _msgSender(), records[tokenId]);
    }

    function mint(
        uint256 tokenId,
        uint256 amount,
        address frontendFeeRecipient
    ) public payable {
        uint256 totalMintFee = fixedMintFee * amount;
        require(msg.value >= totalMintFee, "EIS: insufficient total mint fee");
        (
            uint256 protocolFee,
            uint256 frontendFee,
            uint256 remainingFeeAfterFrontendFee
        ) = getDividedFeeFromTotalMintFee(totalMintFee);

        if (frontendFeeRecipient == address(0x0)) {
            payable(treasuryAddress).transfer(protocolFee + frontendFee);
        } else {
            payable(treasuryAddress).transfer(protocolFee);
            payable(frontendFeeRecipient).transfer(frontendFee);
        }
        payable(records[tokenId].split).transfer(remainingFeeAfterFrontendFee);

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
                    '", "creator": "',
                    Strings.toHexString(record.creator),
                    '", "image": "',
                    loadImage(tokenId),
                    '"}'
                )
            );
    }

    function unzip(bytes memory data) public pure returns (bytes memory) {
        return abi.encodePacked(LibZip.flzDecompress(data));
    }

    function zip(bytes memory data) public pure returns (bytes memory) {
        return abi.encodePacked(LibZip.flzCompress(data));
    }

    function getDividedFeeFromTotalMintFee(
        uint256 totalMintFee
    ) public view returns (uint256, uint256, uint256) {
        uint256 protocolFee = (totalMintFee * protocolFeeBasisPoints) /
            basisPointsBase;
        uint256 remainingFeeAfterProtocolFee = totalMintFee - protocolFee;

        uint256 frontendFee = (remainingFeeAfterProtocolFee *
            frontendFeeBasisPoints) / basisPointsBase;
        uint256 remainingFeeAfterFrontendFee = remainingFeeAfterProtocolFee -
            frontendFee;
        return (protocolFee, frontendFee, remainingFeeAfterFrontendFee);
    }

    function getTotalAllocationAndCreatorAllocation(
        uint256[] memory referenceAllocations
    ) public view returns (uint256, uint256) {
        uint256 inputTotalAllocation;
        for (uint8 i = 0; i < referenceAllocations.length; i++) {
            inputTotalAllocation += referenceAllocations[i];
        }

        uint256 totalAllocation = (inputTotalAllocation * basisPointsBase) /
            royaltyFeeBasisPoints;

        uint256 creatorAllocation = totalAllocation - inputTotalAllocation;
        return (totalAllocation, creatorAllocation);
    }

    function loadRawImage(uint256 tokenId) public view returns (bytes memory) {
        bytes memory data;
        address[] memory imageChunks = records[tokenId].imageChunks;
        for (uint8 i = 0; i < imageChunks.length; i++) {
            data = abi.encodePacked(data, SSTORE2.read(imageChunks[i]));
        }
        return LibZip.flzDecompress(data);
    }

    // ERC-4883: Composable SVG NFT
    function renderTokenById(
        uint256 tokenId
    ) public view returns (string memory) {
        bytes memory data = loadRawImage(tokenId);
        return string(data);
    }

    function loadImage(uint256 tokenId) public view returns (string memory) {
        bytes memory data = loadRawImage(tokenId);
        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(data)
                )
            );
    }

    function _setImage(
        bytes[] calldata image
    ) internal returns (address[] memory) {
        address[] memory imageChunks = new address[](image.length);
        for (uint8 i = 0; i < image.length; i++) {
            imageChunks[i] = (SSTORE2.write(image[i]));
        }
        return imageChunks;
    }
}
