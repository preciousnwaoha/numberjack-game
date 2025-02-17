// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IToken {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract MultiplayerGame {
    address public owner;
    IToken public gameToken;
    uint256 public skipFee = 10; // Fee (in tokens) to skip turn

    // Enumerations for game status and mode
    enum GameStatus { 
        NotStarted, 
        InProgress, 
        Ended 
    }
    enum GameMode {
        Rounds, 
        TimeBased 
    }

    // GameRoom now tracks status, mode, and turn order (for rounds)
    struct GameRoom {
        address creator;
        uint256 gameId;
        uint256 maxNumber;
        uint256 entryFee;
        address[] players;
        bool isActive;
        GameStatus status;
        GameMode mode;
        uint256 startTime;      // When the game starts (for time-based mode)
        uint256 duration;       // Duration in seconds for time-based games
        uint256 rounds;         // Maximum rounds for rounds mode
        uint256 currentRound;   // Current round number (for rounds mode)
        uint256 currentPlayerIndex; // Index in players array for whose turn it is (rounds mode)
    }

    mapping(uint256 => GameRoom) public gameRooms;
    mapping(uint256 => mapping(address => uint256)) public playerScores;
    mapping(uint256 => mapping(address => bool)) public isEliminated;
    uint256 public roomCounter;

    event GameRoomCreated(uint256 roomId, address creator, uint256 maxNumber, uint256 entryFee, GameMode mode);
    event PlayerJoined(uint256 roomId, address player);
    event PlayerEliminated(uint256 roomId, address player);
    event WinnerDeclared(uint256 roomId, address winner, uint256 prize);
    event NoWinner(uint256 roomId, uint256 prizeTransferredToOwner);
    event TurnSkipped(uint256 roomId, address player);

    constructor(address _tokenAddress) {
        owner = msg.sender;
        gameToken = IToken(_tokenAddress);
    }

    // Create a game room. _durationOrRounds is used as duration (in seconds) for TimeBased mode
    // or maximum rounds for Rounds mode.
    function createGameRoom(
        uint256 _maxNumber,
        uint256 _entryFee,
        GameMode _mode,
        uint256 _durationOrRounds
    ) external payable {
        require(_maxNumber > 0, "Max number must be > 0");
        require(_entryFee > 0, "Entry fee must be > 0");
        // Creator must also pay entry fee
        roomCounter++;
        GameRoom storage room = gameRooms[roomCounter];
        room.creator = msg.sender;
        room.gameId = roomCounter;
        room.maxNumber = _maxNumber;
        room.entryFee = _entryFee;
        room.isActive = true;
        room.status = GameStatus.NotStarted;
        room.mode = _mode;

        if (_mode == GameMode.Rounds) {
            room.rounds = _durationOrRounds;
        } else {
            room.duration = _durationOrRounds;
        }

        room.currentRound = 1;
        room.currentPlayerIndex = 0;
        room.players.push(msg.sender);
        emit GameRoomCreated(roomCounter, msg.sender, _maxNumber, _entryFee, _mode);
    }

    // Allow players to join a room before the game starts.
    function joinGameRoom(uint256 _roomId) external payable {
        GameRoom storage room = gameRooms[_roomId];
        require(room.isActive, "Room inactive");
        require(room.status == GameStatus.NotStarted, "Game already started");
        require(msg.value == room.entryFee, "Incorrect entry fee");
        room.players.push(msg.sender);
        emit PlayerJoined(_roomId, msg.sender);
    }

    // Start the game. Only the creator can start.
    function startGame(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(msg.sender == room.creator, "Only creator can start");
        require(room.status == GameStatus.NotStarted, "Game already started");
        room.status = GameStatus.InProgress;
        room.startTime = block.timestamp;
    }

    // Internal helper to generate two random numbers between 1 and 100.
    function _getDraws(address _player, uint256 _nonce) internal view returns (uint256, uint256) {
        uint256 first = (uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, _player, _nonce))) % 100) + 1;
        uint256 second = (uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, _player, _nonce + 1))) % 100) + 1;
        return (first, second);
    }

    // For rounds mode: the current player takes their turn.
    function playTurn(uint256 _roomId) external returns (uint256, uint256) {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(room.mode == GameMode.Rounds, "Not rounds mode");
        require(room.players[room.currentPlayerIndex] == msg.sender, "Not your turn");
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        // Use a nonce combining current round and turn index for randomness.
        (uint256 draw1, uint256 draw2) = _getDraws(msg.sender, room.currentRound + room.currentPlayerIndex);
        uint256 totalDraw = draw1 + draw2;
        playerScores[_roomId][msg.sender] += totalDraw;

        if (playerScores[_roomId][msg.sender] > room.maxNumber) {
            isEliminated[_roomId][msg.sender] = true;
            emit PlayerEliminated(_roomId, msg.sender);
        }
        _advanceTurn(_roomId);
        return (draw1, draw2);
    }

    // For time-based mode: any player (not eliminated) can update their score at any time.
    function updateScore(uint256 _roomId) external returns (uint256, uint256) {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(room.mode == GameMode.TimeBased, "Not time-based mode");
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        (uint256 draw1, uint256 draw2) = _getDraws(msg.sender, block.timestamp);
        uint256 totalDraw = draw1 + draw2;
        playerScores[_roomId][msg.sender] += totalDraw;
        if (playerScores[_roomId][msg.sender] > room.maxNumber) {
            isEliminated[_roomId][msg.sender] = true;
            emit PlayerEliminated(_roomId, msg.sender);
        }
        return (draw1, draw2);
    }

    // For rounds mode: allows the current player to skip their turn by paying tokens.
    function skipTurn(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(room.mode == GameMode.Rounds, "Not rounds mode");
        require(room.players[room.currentPlayerIndex] == msg.sender, "Not your turn");
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        require(gameToken.transferFrom(msg.sender, owner, skipFee), "Token transfer failed");
        emit TurnSkipped(_roomId, msg.sender);
        _advanceTurn(_roomId);
    }

    // Internal function to advance turn in rounds mode by moving to the next non-eliminated player.
    // If a full cycle is completed, increments the round counter.
    function _advanceTurn(uint256 _roomId) internal {
        GameRoom storage room = gameRooms[_roomId];
        uint256 playersCount = room.players.length;
        uint256 startingIndex = room.currentPlayerIndex;
        do {
            room.currentPlayerIndex = (room.currentPlayerIndex + 1) % playersCount;
            if (room.currentPlayerIndex == 0) {
                room.currentRound++;
            }
            // Break if we've looped over all players (all eliminated scenario)
            if (room.currentPlayerIndex == startingIndex) break;
        } while (isEliminated[_roomId][room.players[room.currentPlayerIndex]]);
    }

    // Concludes the game and determines the winner.
    // - For rounds mode: if only one player remains or the max rounds are exceeded, the last active player wins.
    // - For time-based mode: if the duration has passed, the player with the lowest score wins (unless only one remains).
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

        if (room.mode == GameMode.Rounds) {
            // End game if one player remains or max rounds exceeded; award the remaining player's prize.
            if (remainingPlayers == 1 || room.currentRound > room.rounds) {
                payable(lastPlayer).transfer(prize);
                emit WinnerDeclared(_roomId, lastPlayer, prize);
            } else if (remainingPlayers == 0) {
                payable(owner).transfer(prize);
                emit NoWinner(_roomId, prize);
            } else {
                revert("Game not yet concluded");
            }
        } else {
            // Time-based: if duration expired, determine winner based on lowest score unless only one remains.
            if (block.timestamp >= room.startTime + room.duration) {
                if (remainingPlayers == 1) {
                    payable(lastPlayer).transfer(prize);
                    emit WinnerDeclared(_roomId, lastPlayer, prize);
                } else if (remainingPlayers > 1) {
                    payable(lowestScorer).transfer(prize);
                    emit WinnerDeclared(_roomId, lowestScorer, prize);
                } else if (remainingPlayers == 0) {
                    payable(owner).transfer(prize);
                    emit NoWinner(_roomId, prize);
                }
            } else {
                revert("Game duration not yet ended");
            }
        }
        room.status = GameStatus.Ended;
        room.isActive = false;
    }
}
