// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import {Base64} from "./Base64.sol";

library GenSVG {

    function genSVG(string memory name, string memory tld, string memory strLen) external pure returns (string memory svg){

        return string( abi.encodePacked("data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            string(
                                abi.encodePacked(
                                    '{"name": "',
                                    string(abi.encodePacked(name, ".", tld)),
                                    '", "description": "A domain on the Pibble Name Service", "image": "data:image/svg+xml;base64,',
                                    Base64.encode(bytes(string(abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" fill="none" viewBox="0 0 250 250"><path fill="url(#a)" d="M0 0h250v250H0z"/><path fill="#fff" d="M129 83v1Zm106-34v11a27 27 0 0 1-27 27h-13v15l-55-19V20c0-6 7-9 11-4l11 11h23c4 0 10 3 12 7l3 6h27a6 6 0 0 1 6 6Zm-48 0a6 6 0 1 0-6 6"/><defs><linearGradient id="a" x1="0" y1="0" x2="250" y2="250" gradientUnits="userSpaceOnUse"><stop stop-color="#55f002"/><stop offset=".8" stop-color="#020500" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" font-family="Plus Jakarta Sans" font-weight="bold">',string(abi.encodePacked(name, ".", tld)),'</text></svg>')))),
                                    '","length":"',
                                    strLen,
                                    '"}'
                                )
                            )
                        )
                    )
        )
        );
    }
}