// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NumberJackGame {
    address public owner;
    IERC20 public gameToken;
    uint256 public skipFee = 10; // Fee (in tokens) to skip turn

    // Game status and mode enumerations
    enum GameStatus { NotStarted, InProgress, Ended }

    // The game room now tracks turn-related timing
    struct GameRoom {
        address creator;
        uint256 gameId;
        uint256 maxNumber;
        uint256 entryFee;
        address[] players;
        bool isActive;
        GameStatus status;
        uint256 rounds;         // Maximum rounds (round-based mode)
        uint256 currentRound;   // Current round number (round-based mode)
        uint256 currentPlayerIndex; // Which player’s turn it is (round-based mode)
        uint256 lastTurnTimestamp;  // When the current turn began
        uint256 turnTimeout;        // Maximum allowed time per turn (seconds)

        // Add total Money for the room
    }

    mapping(uint256 => GameRoom) public gameRooms;
    mapping(uint256 => mapping(address => uint256)) public playerScores;
    mapping(uint256 => mapping(address => bool)) public isEliminated;
    uint256 public roomCounter;

    GameRoom[] private allGameRooms;

    // Events for various actions
    event GameRoomCreated(uint256 roomId, address creator, uint256 maxNumber, uint256 entryFee, uint256 rounds);
    event PlayerJoined(uint256 roomId, address player);
    event GameStarted(uint256 _roomId);
    event PlayerPlayed(uint256 _roomId, address player);
    event PlayerEliminated(uint256 roomId, address player);
    event WinnerDeclared(uint256 roomId, address winner, uint256 prize);
    event NoWinner(uint256 roomId, uint256 prizeTransferredToOwner);
    event TurnSkipped(uint256 roomId, address player);
    event TurnTimedOut(uint256 roomId, address timedOutPlayer);
    event TurnAdvanced(uint256 roomId, address newPlayer, uint256 currentRound, uint256 turnStartTime);


    constructor(address gameTokenAddress) {
        owner = msg.sender;
        gameToken = IERC20(gameTokenAddress);
    }

    // Create a game room; _turnTimeout sets the max time (in seconds) for each turn.
    function createGameRoom(
        uint256 _maxNumber,
        uint256 _entryFee,
        uint256 _rounds,
        uint256 _turnTimeout
    ) external payable {
        require(_maxNumber > 0, "Max number must be > 0");
        require(_entryFee > 0, "Entry fee must be > 0");
        require(msg.value == _entryFee, "Incorrect entry fee");

        roomCounter++;
        GameRoom storage room = gameRooms[roomCounter];
        room.creator = msg.sender;
        room.gameId == roomCounter;
        room.maxNumber = _maxNumber;
        room.entryFee = _entryFee;
        room.isActive = true;
        room.status = GameStatus.NotStarted;
        room.rounds = _rounds;
        room.currentRound = 1;
        room.currentPlayerIndex = 0;
        room.turnTimeout = _turnTimeout;
        // lastTurnTimestamp will be set when the game starts
        room.lastTurnTimestamp = 0;
        room.players.push(msg.sender);

        allGameRooms.push(room);


        emit GameRoomCreated(roomCounter, msg.sender, _maxNumber, _entryFee, _rounds);

        emit PlayerJoined(roomCounter, msg.sender);
    }

    // Players join before the game starts.
    function joinGameRoom(uint256 _roomId) external payable {
        GameRoom storage room = gameRooms[_roomId];
        require(room.isActive, "Room inactive");
        require(room.status == GameStatus.NotStarted, "Game already started");
        require(msg.value == room.entryFee, "Incorrect entry fee");
        room.players.push(msg.sender);

        allGameRooms[_roomId - 1] = room;

        emit PlayerJoined(_roomId, msg.sender);
    }

    // Only the creator can start the game.
    function startGame(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(msg.sender == room.creator, "Only creator can start"); // I will have to remove this
        require(room.status == GameStatus.NotStarted, "Game already started");
        room.status = GameStatus.InProgress;

        // Begin the first turn immediately.
        room.lastTurnTimestamp = block.timestamp;

        allGameRooms[_roomId - 1] = room;

        emit GameStarted(_roomId);
    }

    // Internal helper to generate two random draws (1-100) based on input nonce.
    function _getDraws(address _player, uint256 _nonce) internal view returns (uint256, uint256) {
        uint256 first = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _player, _nonce))) % 100) + 1;
        uint256 second = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _player, _nonce + 1))) % 100) + 1;
        return (first, second);
    }

    // For rounds mode: the current player takes their turn.
    function playTurn(uint256 _roomId) external returns (uint256, uint256) {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(room.players[room.currentPlayerIndex] == msg.sender, "Not your turn");
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        // Check that the current player hasn’t exceeded the allowed turn time.
        // require(block.timestamp <= room.lastTurnTimestamp + room.turnTimeout, "Turn timed out, force skip");

        (uint256 draw1, uint256 draw2) = _getDraws(msg.sender, room.currentRound + room.currentPlayerIndex);
        uint256 totalDraw = draw1 + draw2;
        playerScores[_roomId][msg.sender] += totalDraw;

        if (playerScores[_roomId][msg.sender] > room.maxNumber) {
            isEliminated[_roomId][msg.sender] = true;
            emit PlayerEliminated(_roomId, msg.sender);
        }

        _advanceTurn(_roomId);

        emit PlayerPlayed(_roomId, msg.sender);

        return (draw1, draw2);
    }

    // In rounds mode, the current player can voluntarily skip their turn by paying a fee.
    function skipTurn(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(room.players[room.currentPlayerIndex] == msg.sender, "Not your turn");
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        require(gameToken.transferFrom(msg.sender, owner, skipFee), "Token transfer failed");
        emit TurnSkipped(_roomId, msg.sender);
        _advanceTurn(_roomId);
    }

    // This function allows any player to force the game to move forward if the current player timed out.
    // It eliminates the inactive player and advances the turn.
    function forceAdvance(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(block.timestamp > room.lastTurnTimestamp + room.turnTimeout, "Turn not timed out yet");

        address timedOutPlayer = room.players[room.currentPlayerIndex];
        isEliminated[_roomId][timedOutPlayer] = true;
        emit TurnTimedOut(_roomId, timedOutPlayer);
        _advanceTurn(_roomId);
    }

    // Internal function that advances the turn to the next non-eliminated player.
    // Also resets the lastTurnTimestamp to the current time.
    function _advanceTurn(uint256 _roomId) internal {
        GameRoom storage room = gameRooms[_roomId];
        uint256 playersCount = room.players.length;
        uint256 startingIndex = room.currentPlayerIndex;
        // Set the turn start time for the new turn.
        room.lastTurnTimestamp = block.timestamp;
        do {
            room.currentPlayerIndex = (room.currentPlayerIndex + 1) % playersCount;
            if (room.currentPlayerIndex == 0) {
                room.currentRound++;
            }
            // Break if we've looped over all players.
            if (room.currentPlayerIndex == startingIndex) break;
        } while (isEliminated[_roomId][room.players[room.currentPlayerIndex]]);

        emit TurnAdvanced(_roomId, room.players[room.currentPlayerIndex], room.currentRound, room.lastTurnTimestamp);
    }

    // This function concludes the game and determines the winner.
    // For rounds mode: if one player remains or max rounds are exceeded, the last active wins.
    // For time-based mode: if the duration has expired, the player with the lowest score wins,
    // unless only one player remains.
    function checkWinner(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");

        uint256 remainingPlayers = 0;
        address lastPlayer;
        uint256 lowestScore = type(uint256).max;
        address lowestScorer;
        for (uint i = 0; i < room.players.length; i++) {
            if (!isEliminated[_roomId][room.players[i]]) {
                remainingPlayers++;
                lastPlayer = room.players[i];
                if (playerScores[_roomId][room.players[i]] < lowestScore) {
                    lowestScore = playerScores[_roomId][room.players[i]];
                    lowestScorer = room.players[i];
                }
            }
        }
        uint256 prize = room.players.length * room.entryFee;

        if (remainingPlayers == 1 || room.currentRound > room.rounds) {
            payable(lastPlayer).transfer(prize);
            emit WinnerDeclared(_roomId, lastPlayer, prize);
        } else if (remainingPlayers == 0) {
            payable(owner).transfer(prize);
            emit NoWinner(_roomId, prize);
        } else {
            revert("Game not yet concluded");
        }

        room.status = GameStatus.Ended;
        room.isActive = false;

        allGameRooms[_roomId - 1] = room;
    }

    /// GETTER FUNCTIONS

    function getGameRoomById(uint256 _gameRoomId) public view returns (GameRoom memory) {
        return gameRooms[_gameRoomId];
    }

    function getALlGameRooms() public view returns (GameRoom[] memory) {
        return allGameRooms;
    }

    function getPlayerScoresForEachGameRoom(uint256 _roomId, address _player) public view returns (uint256) {
        return playerScores[_roomId][_player];
    }

    function getIsPlayerEliminatedByRoomId(uint256 _roomId, address _player) public view returns (bool) {
        return isEliminated[_roomId][_player];
    }

    function getTotalRoomsCreated() public view returns (uint256) {
        return roomCounter;
    }
}
