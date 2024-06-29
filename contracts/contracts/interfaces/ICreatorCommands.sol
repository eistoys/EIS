// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ICreatorCommands {
    enum CreatorActions {
        NO_OP,
        SEND_ETH,
        MINT
    }

    struct Command {
        CreatorActions method;
        bytes args;
    }

    struct CommandSet {
        Command[] commands;
        uint256 at;
    }
}
