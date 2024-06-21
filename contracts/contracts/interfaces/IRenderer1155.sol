// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC165} from "./IERC165.sol";

interface IRenderer1155 is IERC165 {
    function uri(uint256 tokenId) external view returns (string memory);

    function contractURI() external view returns (string memory);

    function setup(bytes memory initData) external;
}
