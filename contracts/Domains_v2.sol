// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "./Domains_v1.sol";

contract Domains_v2 is Domains_v1{

    function price(string calldata name) public pure virtual override returns(uint) {
        uint len = StringUtils.strlen(name);
        require(len > 0);
        if (len == 3) {
            return 5 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
        } else if (len == 4) {
            return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
        } else {
            return 2 * 10**17;
        }
    }

    //simple function to print out version
    function version() pure public virtual override returns (string memory) {
        return "Domains_v2!";
    }

}

