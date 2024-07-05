// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {SplitV2Lib} from "../libraries/SplitV2Lib.sol";

interface IPullSplit {
    function distribute(
        SplitV2Lib.Split calldata _split,
        address _token,
        address _distributor
    ) external;
}
