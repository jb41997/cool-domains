// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "./Domains_v1.sol";

contract Domains_v2 is Domains_v1{

    //simple function to print out version
    function version() pure external virtual override returns (string memory) {
        return "Domains_v2!";
    }

}

