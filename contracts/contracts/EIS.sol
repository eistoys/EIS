// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "solady/src/utils/SSTORE2.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/Base64.sol";

contract EIS is ERC1155 {
    event Created(uint256 indexed tokenId, address indexed creator);
    event Forked(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 indexed referenceTokenId
    );

    mapping(uint256 => address[]) tokenIdToImageChunks;
    mapping(uint256 => address) tokenIdToCreator;
    mapping(uint256 => uint256) tokenIdToRefferenceTokenId;

    uint256 public tokenIdCounter;
    uint256 public createFee;
    uint256 public forkFee;
    uint256 public mintFee;

    constructor() ERC1155("") {}

    function create(bytes[] calldata image) public payable {
        require(msg.value >= createFee, "EIS: insufficient create fee");
        uint256 tokenId = tokenIdCounter;
        _setImage(tokenId, image);
        tokenIdToCreator[tokenId] = _msgSender();
        tokenIdCounter++;
        emit Created(tokenId, _msgSender());
    }

    function fork(
        uint256 referrenceTokenId,
        bytes[] calldata image
    ) public payable {
        require(msg.value >= forkFee, "EIS: insufficient fork fee");
        uint256 tokenId = tokenIdCounter;
        _setImage(tokenId, image);
        tokenIdToCreator[tokenId] = _msgSender();
        tokenIdToRefferenceTokenId[tokenId] = referrenceTokenId;
        tokenIdCounter++;
        emit Forked(tokenId, _msgSender(), referrenceTokenId);
    }

    function mint(uint256 tokenId, uint256 amount) public payable {
        uint256 totalMintFee = mintFee * amount;
        require(msg.value >= totalMintFee, "EIS: insufficient total mint fee");
        _mint(_msgSender(), tokenId, amount, "");
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(
            tokenIdToImageChunks[tokenId].length != 0,
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
        for (uint8 i = 0; i < tokenIdToImageChunks[tokenId].length; i++) {
            data = abi.encodePacked(
                data,
                SSTORE2.read(tokenIdToImageChunks[tokenId][i])
            );
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

    function _setImage(uint256 tokenId, bytes[] calldata image) internal {
        for (uint8 i = 0; i < image.length; i++) {
            tokenIdToImageChunks[tokenId].push(SSTORE2.write(image[i]));
        }
    }
}
