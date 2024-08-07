// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "solady/src/utils/SSTORE2.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/Base64.sol";

contract EISHanabi is ERC1155 {
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

    event Created(
        uint256 indexed tokenId,
        address indexed creator,
        Record record
    );

    event ProtocolOwnerTransferred(
        address indexed oldAddress,
        address indexed newAddress
    );

    event CollectionOwnerTransferred(
        address indexed oldAddress,
        address indexed newAddress
    );

    event Ended();

    mapping(uint256 => Record) public records;
    mapping(address => uint256) public claimableFees;
    mapping(uint256 => uint256) public totalMinted;

    bool public isEnded;

    address public protocolOwnerAddress;
    address public collectionOwnerAddress;

    uint256 public tokenIdCounter;
    uint256 public fixedMintFee;
    uint256 public basisPointsBase;
    uint256 public protocolFeeBasisPoints;
    uint256 public collectionOwnerFeeBasisPoints;
    uint256 public remixFeeBasisPoints;
    uint256 public maxSupply;

    constructor(
        address protocolOwnerAddress_,
        address collectionOwnerAddress_,
        uint256 fixedMintFee_,
        uint256 basisPointsBase_,
        uint256 protocolFeeBasisPoints_,
        uint256 collectionOwnerFeeBasisPoints_,
        uint256 remixFeeBasisPoints_,
        uint256 maxSupply_
    ) ERC1155("") {
        protocolOwnerAddress = protocolOwnerAddress_;
        collectionOwnerAddress = collectionOwnerAddress_;
        fixedMintFee = fixedMintFee_;
        basisPointsBase = basisPointsBase_;
        protocolFeeBasisPoints = protocolFeeBasisPoints_;
        collectionOwnerFeeBasisPoints = collectionOwnerFeeBasisPoints_;
        remixFeeBasisPoints = remixFeeBasisPoints_;
        maxSupply = maxSupply_;
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
        require(!isEnded, "EIS: ended");

        uint256 tokenId = tokenIdCounter++;
        address creator = _msgSender();

        // Check for valid reference token IDs and duplication
        for (uint256 i = 0; i < referenceTokenIds.length; i++) {
            uint256 refTokenId = referenceTokenIds[i];
            require(
                records[refTokenId].creator != address(0),
                "EIS: invalid reference token ID"
            );

            for (uint256 j = i + 1; j < referenceTokenIds.length; j++) {
                require(
                    referenceTokenIds[i] != referenceTokenIds[j],
                    "EIS: duplicate reference token ID"
                );
            }
        }

        address[] memory imageStorages = new address[](imageChunks.length);
        for (uint256 i = 0; i < imageChunks.length; i++) {
            imageStorages[i] = SSTORE2.write(imageChunks[i]);
        }

        records[tokenId] = Record({
            creator: creator,
            name: name,
            description: description,
            imageCompression: imageCompression,
            imageMimeType: imageMimeType,
            imageStorages: imageStorages,
            referenceTokenIds: referenceTokenIds
        });

        emit Created(tokenId, _msgSender(), records[tokenId]);

        if (isInitialMintEnabled) {
            totalMinted[tokenId] += 1;
            _mint(creator, tokenId, 1, "");
        }
    }

    function mint(
        uint256 tokenId,
        uint256 amount,
        uint256 gasLimit
    ) public payable {
        require(!isEnded, "EIS: ended");

        require(
            totalMinted[tokenId] + amount <= maxSupply,
            "EIS: max supply exceeded"
        );

        uint256 totalMintFee = fixedMintFee * amount;
        require(msg.value >= totalMintFee, "EIS: insufficient total mint fee");
        (
            uint256 protocolFee,
            uint256 collectionOwnerFee,
            uint256 creatorFee
        ) = getDividedFeesFromTotalMintFee(totalMintFee);

        (bool successProtocol, ) = protocolOwnerAddress.call{
            value: protocolFee,
            gas: gasLimit
        }("");
        require(successProtocol, "EIS:Transfer to protocol owner failed");

        (bool successCollection, ) = collectionOwnerAddress.call{
            value: collectionOwnerFee,
            gas: gasLimit
        }("");
        require(successCollection, "EIS:Transfer to collection owner failed");

        if (records[tokenId].referenceTokenIds.length > 0) {
            uint256 originalCreatorFee = (creatorFee * remixFeeBasisPoints) /
                basisPointsBase;
            uint256 dividedOriginalCreatorFee = originalCreatorFee /
                records[tokenId].referenceTokenIds.length;
            creatorFee =
                creatorFee -
                dividedOriginalCreatorFee *
                records[tokenId].referenceTokenIds.length;
            for (
                uint256 i = 0;
                i < records[tokenId].referenceTokenIds.length;
                i++
            ) {
                uint256 referenceTokenId = records[tokenId].referenceTokenIds[
                    i
                ];
                address remixCreator = records[referenceTokenId].creator;
                claimableFees[remixCreator] += dividedOriginalCreatorFee;
            }
        }

        claimableFees[records[tokenId].creator] += creatorFee;
        totalMinted[tokenId] += amount;
        _mint(_msgSender(), tokenId, amount, "");
    }

    function claimFees(uint256 gasLimit) public {
        address creator = _msgSender();
        uint256 amount = claimableFees[creator];
        require(amount > 0, "EIS: no fees to claim");
        claimableFees[creator] = 0;
        (bool success, ) = creator.call{value: amount, gas: gasLimit}("");
        require(success, "EIS:Transfer to creator failed");
    }

    function transferProtocolOwner(address newAddress) public {
        require(
            _msgSender() == protocolOwnerAddress,
            "EIS: only current protocol owner can transfer"
        );
        require(
            newAddress != address(0),
            "EIS: new address cannot be zero address"
        );
        emit ProtocolOwnerTransferred(protocolOwnerAddress, newAddress);
        protocolOwnerAddress = newAddress;
    }

    function transferCollectionOwner(address newAddress) public {
        require(
            _msgSender() == collectionOwnerAddress,
            "EIS: only current collection owner can transfer"
        );
        require(
            newAddress != address(0),
            "EIS: new address cannot be zero address"
        );
        emit CollectionOwnerTransferred(collectionOwnerAddress, newAddress);
        collectionOwnerAddress = newAddress;
    }

    function end() public {
        require(
            _msgSender() == protocolOwnerAddress,
            "EIS: only protocol owner can end the contract"
        );
        require(!isEnded, "EIS: contract already ended");
        isEnded = true;
        emit Ended();
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
        for (uint256 i = 0; i < imageStorages.length; i++) {
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
}
