// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "solady/src/utils/SSTORE2.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/Base64.sol";

struct Split {
    address[] recipients;
    uint256[] allocations;
    uint256 totalAllocation;
    uint16 distributionIncentive;
}

interface ISplitFactoryV2 {
    function createSplit(
        Split calldata _splitParams,
        address _owner,
        address _creator
    ) external returns (address split);
}

contract EIS is ERC1155 {
    event Created(uint256 indexed tokenId, address indexed creator);
    event Remixed(
        uint256 indexed tokenId,
        address indexed creator,
        uint256[] indexed referenceTokenIds
    );

    struct Record {
        address creator;
        address split;
        address[] imageChunks;
        uint256[] referenceTokenIds;
    }

    mapping(uint256 => Record) records;

    ISplitFactoryV2 public pullSplitFactory;

    uint256 public tokenIdCounter;
    uint256 public fixedMintFee;
    uint256 public basisPointsBase;
    uint256 public protocolFeeBasisPoints;
    uint256 public frontendFeeBasisPoints;
    uint256 public royaltyFeeBasisPoints;

    constructor(
        address tresuryAddress,
        address pullSplitFactoryAddress,
        uint256 fixedMintFee_,
        uint256 basisPointsBase_,
        uint256 protocolFeeBasisPoints_,
        uint256 frontendFeeBasisPoints_,
        uint256 royaltyFeeBasisPoints_
    ) ERC1155("") {
        pullSplitFactory = ISplitFactoryV2(pullSplitFactoryAddress);
        fixedMintFee = fixedMintFee_;
        basisPointsBase = basisPointsBase_;
        protocolFeeBasisPoints = protocolFeeBasisPoints_;
        frontendFeeBasisPoints = frontendFeeBasisPoints_;
        royaltyFeeBasisPoints = royaltyFeeBasisPoints_;
    }

    function create(bytes[] calldata image) public {
        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;
        address[] memory imageChunks = _setImage(image);
        records[tokenId] = Record({
            creator: _msgSender(),
            split: address(0),
            imageChunks: imageChunks,
            referenceTokenIds: new uint256[](0)
        });
        emit Created(tokenId, _msgSender());
    }

    function remix(
        bytes[] calldata image,
        uint256[] memory referrenceTokenIds
    ) public payable {
        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;
        address[] memory imageChunks = _setImage(image);
        records[tokenId] = Record({
            creator: _msgSender(),
            split: address(0),
            imageChunks: imageChunks,
            referenceTokenIds: referrenceTokenIds
        });
        emit Remixed(tokenId, _msgSender(), referrenceTokenIds);
    }

    function mint(
        uint256 tokenId,
        uint256 amount,
        address frontendFeeRecipient
    ) public payable {
        uint256 totalMintFee = fixedMintFee * amount;
        require(msg.value >= totalMintFee, "EIS: insufficient total mint fee");
        _mint(_msgSender(), tokenId, amount, "");
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
                    '"name": "Test SVG NFT"',
                    ', "description": "This is test SVG NFT"',
                    ', "image": "',
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
