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

    // Function to check if a property exists
    function propertyExists(uint256 _id) public view returns (bool) {
        return properties[_id].owner != address(0);
    }

    // Function to update the price of a property (Only the owner can update)
    function updatePropertyPrice(uint256 _propertyId, uint256 _newPrice) public {
        Property storage property = properties[_propertyId];
    
        require(msg.sender == property.owner, "You are not the owner of this property");
        require(_newPrice > 0, "Price must be greater than zero");
        
        property.price = _newPrice;
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

    function getAllPropertyIds() public view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](getPropertyCount());
        uint256 index = 0;
    
         for (uint256 i = 1; i <= getPropertyCount(); i++) {
            if (propertyExists(i)) {
                ids[index] = i;
                index++;
            }
        }
        return ids;
    }

    function getPropertyCount() public view returns (uint256) {
        return propertyCount;
    }
    function getPropertyPrice(uint256 _propertyId) public view returns (uint256) {
        require(propertyExists(_propertyId), "Property does not exist");
        return properties[_propertyId].price;
    }
    // Function to get property details
    function getPropertyDetails(uint256 _id) public view returns (string memory name, address owner, uint256 price) {
        Property storage property = properties[_id];
        return (property.name, property.owner, property.price);
    }
}
