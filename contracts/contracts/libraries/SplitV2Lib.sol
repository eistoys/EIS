// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library SplitV2Lib {
    struct Split {
        address[] recipients;
        uint256[] allocations;
        uint256 totalAllocation;
        uint16 distributionIncentive;
    }
}
