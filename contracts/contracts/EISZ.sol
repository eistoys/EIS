// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "solady/src/auth/Ownable.sol";
import "solady/src/utils/SSTORE2.sol";
import "solady/src/utils/LibZip.sol";
import "solady/src/utils/Base64.sol";

import {IZoraCreator1155} from "./interfaces/IZoraCreator1155.sol";
import {IZoraCreator1155Factory} from "./interfaces/IZoraCreator1155Factory.sol";
import {ICreatorRoyaltiesControl} from "./interfaces/ICreatorRoyaltiesControl.sol";
import {Renderer1155Impl} from "./Renderer1155Impl.sol";
import {IERC165Upgradeable} from "./interfaces/IERC165Upgradeable.sol";
import {ISplitFactoryV2} from "./interfaces/ISplitFactoryV2.sol";
import {SplitV2Lib} from "./libraries/SplitV2Lib.sol";

contract EISZ is Ownable {
    event ContractCreated(address indexed newContract, address indexed creator);
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
        string mimeType;
        address[] imageChunks;
        uint256[] referenceTokenIds;
        SplitV2Lib.Split splitParams;
    }

    mapping(uint256 => address) public createdContracts;
    mapping(uint256 => Record) public records;

    ISplitFactoryV2 public pullSplitFactory;
    IZoraCreator1155Factory public zoraCreatorFactory;
    address public treasuryAddress;
    address public defaultAdmin;

    uint256 public contractId; // should be incremented
    uint256 public tokenIdCounter;
    uint256 public fixedMintFee;
    uint256 public basisPointsBase;
    uint256 public protocolFeeBasisPoints;
    uint256 public frontendFeeBasisPoints;
    uint256 public royaltyFeeBasisPoints;
    uint16 public distributionIncentive;

    constructor(
        address zoraCreatorFactory_,
        address pullSplitFactoryAddress,
        address treasuryAddress_,
        uint256 fixedMintFee_,
        uint256 basisPointsBase_,
        uint256 protocolFeeBasisPoints_,
        uint256 frontendFeeBasisPoints_,
        uint256 royaltyFeeBasisPoints_,
        uint16 distributionIncentive_
    ) {
        zoraCreatorFactory = IZoraCreator1155Factory(zoraCreatorFactory_);
        pullSplitFactory = ISplitFactoryV2(pullSplitFactoryAddress);
        treasuryAddress = treasuryAddress_;
        fixedMintFee = fixedMintFee_;
        basisPointsBase = basisPointsBase_;
        protocolFeeBasisPoints = protocolFeeBasisPoints_;
        frontendFeeBasisPoints = frontendFeeBasisPoints_;
        royaltyFeeBasisPoints = royaltyFeeBasisPoints_;
        distributionIncentive = distributionIncentive_;
        defaultAdmin = address(this);
    }

    // will be executed soon after deployment by admin
    function contractCreation(
        string memory contractURI,
        string memory name,
        string memory mimeType,
        address payable creator,
        bytes[] calldata setupActions
    ) external onlyOwner returns (address) {
        require(contractId == 0, "Cannot make more contracts"); // as a first step. will be removed

        // ロイヤリティの設定
        ICreatorRoyaltiesControl.RoyaltyConfiguration
            memory royaltyConfig = ICreatorRoyaltiesControl
                .RoyaltyConfiguration(0, 500, treasuryAddress);

        address[] memory emptyAddressArray;
        uint256[] memory emptyUintArray;

        // Renderer1155Implのsetupの引数に対応する値を引数に渡す
        bytes memory rendererSetupData = abi.encode(
            0,
            creator,
            address(0), // Splitのアドレスを指定する
            name,
            "desctiption for the collection",
            mimeType,
            emptyAddressArray, // imageChunks を適切に指定
            emptyUintArray, // referenceTokenIds を適切に指定
            SplitV2Lib.Split({
                recipients: emptyAddressArray, // 適切に指定
                allocations: emptyUintArray, // 適切に指定
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
            payable(defaultAdmin),
            actions
        );

        createdContracts[contractId] = newContract;
        contractId++;

        emit ContractCreated(newContract, creator);
        return newContract;
    }

    function _callSetupNewToken(
        address creatorContractAddress,
        string memory newURI,
        uint256 maxSupply
    ) internal {
        IZoraCreator1155 creatorContract = IZoraCreator1155(
            creatorContractAddress
        );
        creatorContract.setupNewToken(newURI, maxSupply);

        // insert event here
    }

    function create(
        string memory name,
        string memory description,
        string memory mimeType,
        string memory newURI, // 不要なら削除
        uint256 maxSupply, // 必須
        bytes[] calldata image
    ) public {
        uint256 tokenId = tokenIdCounter++;
        address creator = msg.sender;

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

        records[tokenId] = Record({
            creator: creator,
            split: pullSplitFactory.createSplit(
                splitParams,
                address(this),
                creator
            ),
            name: name,
            description: description,
            mimeType: mimeType,
            imageChunks: _setImage(image),
            referenceTokenIds: new uint256[](0),
            splitParams: splitParams
        });

        // 発行済みコントラクト内で新規トークンを作成
        _callSetupNewToken(createdContracts[0], newURI, maxSupply);

        emit Created(tokenId, msg.sender, records[tokenId]);
    }

    // stack too deep
    function remix(
        string memory name,
        string memory description,
        // string memory mimeType, // 参照元と同一で良い
        // string memory newURI, // 不要なら削除
        // uint256 maxSupply, // 必須
        bytes[] calldata image,
        uint256[] memory referenceTokenIds,
        uint256[] memory referenceAllocations
    ) public {
        uint256 tokenId = tokenIdCounter++;
        address creator = msg.sender;

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

        records[tokenId] = Record({
            creator: creator,
            split: pullSplitFactory.createSplit(
                splitParams,
                address(this),
                creator
            ),
            name: name,
            description: description,
            mimeType: records[referenceTokenIds[0]].mimeType,
            imageChunks: _setImage(image),
            referenceTokenIds: referenceTokenIds,
            splitParams: splitParams
        });

        // 発行済みコントラクト内で新規トークンを作成
        // stack too deep への当座の対応として定数を指定
        _callSetupNewToken(createdContracts[0], "newURI", 10000);

        emit Created(tokenId, msg.sender, records[tokenId]);
    }

    // set a role restriction
    function setRecord(
        uint256 tokenId,
        address creator,
        address split,
        string memory name,
        string memory description,
        string memory mimeType,
        address[] memory imageChunks,
        uint256[] memory referenceTokenIds,
        SplitV2Lib.Split memory splitParams
    ) public {
        records[tokenId] = Record({
            creator: creator,
            split: split,
            name: name,
            description: description,
            mimeType: mimeType,
            imageChunks: imageChunks,
            referenceTokenIds: referenceTokenIds,
            splitParams: splitParams
        });
    }

    function getRecord(uint256 tokenId) public view returns (Record memory) {
        return records[tokenId];
    }

    function _callMint(
        uint256 tokenId,
        uint256 amount,
        address frontendFeeRecipient,
        address creatorContractAddress
    ) internal {
        IZoraCreator1155 creatorContract = IZoraCreator1155(
            creatorContractAddress
        );
        creatorContract.mint(tokenId, amount, frontendFeeRecipient);
    }

    function mint(
        uint256 tokenId,
        uint256 amount,
        address frontendFeeRecipient
    ) public payable {
        // check whether contract and tokens exist or not

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

        // 発行済みZoraCreater1155Implのmintを呼び出す
        _callMint(tokenId, amount, frontendFeeRecipient, createdContracts[0]);
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

    function loadImage(uint256 tokenId) public view returns (string memory) {
        bytes memory data = loadRawImage(tokenId);
        return
            string(
                abi.encodePacked(
                    "data:",
                    records[tokenId].mimeType,
                    ";base64,",
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
