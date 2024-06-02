// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {SplitV2Lib} from "../libraries/SplitV2Lib.sol";

interface ISplitFactoryV2 {
    function createSplit(
        SplitV2Lib.Split calldata _splitParams,
        address _owner,
        address _creator
    ) external returns (address split);
}
