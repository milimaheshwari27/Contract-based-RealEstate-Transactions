// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RealEstateTransaction {

    struct Property {
        uint256 id;
        string name;
        address owner;
        uint256 price;
    }

    mapping(uint256 => Property) public properties;

    event PropertyTransferred(uint256 indexed propertyId, address indexed previousOwner, address indexed newOwner);

    // Function to add a new property (Only the contract owner can add properties)
    function addProperty(uint256 _id, string memory _name, uint256 _price) public {
        properties[_id] = Property({
            id: _id,
            name: _name,
            owner: msg.sender,
            price: _price
        });
    }

    // Function to transfer ownership of a property
    function transferOwnership(uint256 _propertyId, address _newOwner) public payable {
        Property storage property = properties[_propertyId];
        
        require(msg.sender == property.owner, "You are not the owner");
        require(msg.value >= property.price, "Insufficient funds");
        
        address previousOwner = property.owner;
        property.owner = _newOwner;

        payable(previousOwner).transfer(msg.value);

        emit PropertyTransferred(_propertyId, previousOwner, _newOwner);
    }

    // Function to get property details
    function getPropertyDetails(uint256 _id) public view returns (string memory name, address owner, uint256 price) {
        Property storage property = properties[_id];
        return (property.name, property.owner, property.price);
    }
}
