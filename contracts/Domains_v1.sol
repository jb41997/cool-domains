// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { StringUtils } from "./libraries/StringUtils.sol";
import {GenSVG} from "./libraries/GenSVG.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract Domains_v1 is Initializable, OwnableUpgradeable, UUPSUpgradeable, ERC721URIStorageUpgradeable {
    mapping(string => address) public domains;
    mapping(string => string) public records;
    mapping (uint => string) public names;
    string public tld;    
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter internal _tokenIds;

    error Unauthorized();
    error AlreadyRegistered();
    error InvalidName(string name);

    // initializer replaces "constructor()" 
    function initialize(string memory _tld) public initializer payable {
        __Ownable_init();
        __ERC721_init("Pibble Name Service", "PNS");
        tld = _tld;
        //console.log("%s name service deployed", _tld);
        // console.log("I am also an UPGRADEABLE contract!");
    }

    // authorizes upgrades NEVER LEAVE THIS FUNCTION OUT OR YOU LOSE UPGRADABILITY!
    function _authorizeUpgrade(address newImplementation) internal
        override
        onlyOwner{}

    // Add this anywhere in your contract body
    function getAllNames() public view returns (string[] memory) {
        //console.log("Getting all names from contract");
        string[] memory allNames = new string[](_tokenIds.current());
        for (uint i = 0; i < _tokenIds.current(); i++) {
            allNames[i] = names[i];
            //console.log("Name for token %d is %s", i, allNames[i]);
        }

        return allNames;
    }

    function valid(string calldata name) public pure returns(bool) {
        return StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 10;
    }

    function withdraw() public virtual onlyOwner {
        uint amount = address(this).balance;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw Fail");
    } 

    // This function will give us the price of a domain based on length
    function price(string calldata name) public pure virtual returns(uint) {
        uint len = StringUtils.strlen(name);
        require(len > 0);
        if (len == 3) {
            return 3 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
        } else if (len == 4) {
            return 2 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
        } else {
            return 1 * 10**17;
        }
    }

    function register(string calldata name) public virtual payable {
        require(domains[name] == address(0));

        uint256 _price = price(name);
        require(msg.value >= _price, "Not enough Matic");
            
        uint256 newRecordId = _tokenIds.current();
        uint256 length = StringUtils.strlen(name);
        string memory strLen = Strings.toString(length);

        string memory finalTokenUri = GenSVG.genSVG(name,tld,strLen);
        //console.log("Final tokenURI", finalTokenUri);

        _safeMint(msg.sender, newRecordId);
        _setTokenURI(newRecordId, finalTokenUri);
        domains[name] = msg.sender;

        names[newRecordId] = name;
        _tokenIds.increment();
    } 

    // function register(string calldata name) public virtual payable {
    //     require(domains[name] == address(0));

    //     string memory svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" fill="none" viewBox="0 0 250 250"><path fill="url(#a)" d="M0 0h250v250H0z"/><path fill="#fff" d="M129 83v1Zm106-34v11a27 27 0 0 1-27 27h-13v15l-55-19V20c0-6 7-9 11-4l11 11h23c4 0 10 3 12 7l3 6h27a6 6 0 0 1 6 6Zm-48 0a6 6 0 1 0-6 6"/><defs><linearGradient id="a" x1="0" y1="0" x2="250" y2="250" gradientUnits="userSpaceOnUse"><stop stop-color="#55f002"/><stop offset=".8" stop-color="#020500" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" font-family="Plus Jakarta Sans" font-weight="bold">';
    //     string memory svgPartTwo = '</text></svg>';

    //     uint256 _price = price(name);
    //     require(msg.value >= _price, "Not enough Matic");
            
    //         // Combine the name passed into the function  with the TLD
    //     string memory _name = string(abi.encodePacked(name, ".", tld));
    //         // Create the SVG (image) for the NFT with the name
    //     string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));
    //     uint256 newRecordId = _tokenIds.current();
    //     uint256 length = StringUtils.strlen(name);
    //     string memory strLen = Strings.toString(length);

    //     //console.log("Registering %s.%s on the contract with tokenID %d", name, tld, newRecordId);

    //     // Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
    //     string memory json = Base64.encode(
    //         bytes(
    //             string(
    //             abi.encodePacked(
    //                 '{"name": "',
    //                 _name,
    //                 '", "description": "A domain on the Pibble Name Service", "image": "data:image/svg+xml;base64,',
    //                 Base64.encode(bytes(finalSvg)),
    //                 '","length":"',
    //                 strLen,
    //                 '"}'
    //             )
    //             )
    //         )
    //     );

    //     string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json));
    //     //console.log("Final tokenURI", finalTokenUri);

    //     _safeMint(msg.sender, newRecordId);
    //     _setTokenURI(newRecordId, finalTokenUri);
    //     domains[name] = msg.sender;

    //     names[newRecordId] = name;
    //     _tokenIds.increment();
    // } 

    function setRecord(string calldata name, string calldata record) public virtual {
        if (msg.sender != domains[name]) revert Unauthorized();
        records[name] = record;
    }

    function getRecord(string calldata name) public view virtual returns(string memory) {
        return records[name];
    }

    function getAddress(string calldata name) public view virtual returns (address) {
        // Check that the owner is the transaction sender
        return domains[name];
    }

    //simple function to print out version
    function version() pure external virtual returns (string memory) {
        return "Domains_v1!";
    }

}

