// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MultiplayerGame {

    address public owner;
    IERC20 public rewardToken;

    struct GameRoom {
        address creator;
        uint256 maxNumber;
        uint256 entryFee;
        address[] players;
        bool isActive;
    }

    mapping(uint256 => GameRoom) public gameRooms;
    mapping(uint256 => mapping(address => uint256)) public playerScores;
    mapping(uint256 => mapping(address => bool)) public isEliminated;
    uint256 public roomCounter;

    event GameRoomCreated(
        uint256 roomId,
        address creator,
        uint256 maxNumber,
        uint256 entryFee
    );
    event PlayerJoined(uint256 roomId, address player);
    event PlayerEliminated(uint256 roomId, address player);
    event WinnerDeclared(uint256 roomId, address winner, uint256 prize);
    event NoWinner(uint256 roomId, uint256 prizeTransferredToOwner);

    constructor(address _multisigAddress, address gameTokenAddress) {
        owner = msg.sender;
        rewardToken = IERC20(gameTokenAddress);
    }


    /// Function for players to create a game room

    function createGameRoom(
        uint256 _maxNumber,
        uint256 _entryFee
    ) external payable {
        require(_maxNumber > 0, "Max number must be greater than zero");
        require(_entryFee > 0, "Entry fee must be greater than zero");

        roomCounter++;

        GameRoom storage room = gameRooms[roomCounter];
        room.creator = msg.sender;
        room.maxNumber = _maxNumber;
        room.entryFee = _entryFee;
        room.isActive = true;
        room.players.push(msg.sender);

        emit GameRoomCreated(roomCounter, msg.sender, _maxNumber, _entryFee);
    }

    /// Function for players to join the room

    function joinGameRoom(uint256 _roomId) external payable {
        GameRoom storage room = gameRooms[_roomId];
        require(room.isActive, "Game room is not active");
        require(msg.value == room.entryFee, "Incorrect entry fee");
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        room.players.push(msg.sender);

        emit PlayerJoined(_roomId, msg.sender);
    }

    // Function to draw the number, it is view function

    function drawNumber(uint256 _roomId) internal view returns (uint256) {
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        return
            (uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender
                    )
                )
            ) % 100) + 1;
    }

    // Function to update the scores of players

    function updateScore(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(room.isActive, "Game is not active");
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        uint256 drawnNumber = drawNumber(_roomId);
        playerScores[_roomId][msg.sender] += drawnNumber;

        // After the players number all together he drew is more than the max number then he/she is eliminated

        if (playerScores[_roomId][msg.sender] > room.maxNumber) {
            isEliminated[_roomId][msg.sender] = true;
            emit PlayerEliminated(_roomId, msg.sender);
        }
    }

    /// What of if everyone was unlucky and they all passed the max number then i believe the owner of the contract should get all the rewards

    function checkWinner(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(room.isActive, "Game is not active");

        uint256 remainingPlayers = 0;
        address lastPlayer;

        for (uint i = 0; i < room.players.length; i++) {
            if (!isEliminated[_roomId][room.players[i]]) {
                remainingPlayers++;
                lastPlayer = room.players[i];
            }
        }

        uint256 prize = room.players.length * room.entryFee;

        if (remainingPlayers == 1) {
            payable(lastPlayer).transfer(prize);
            emit WinnerDeclared(_roomId, lastPlayer, prize);
        } else if (remainingPlayers == 0) {
            payable(owner).transfer(prize);
            emit NoWinner(_roomId, prize);
        }
    }
}
