// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NumberJackGame {
    address public owner;
    IERC20 public gameToken;
    uint256 public skipFee = 10; // Fee (in tokens) to skip turn

    // Game status and mode enumerations
    enum GameStatus {
        NotStarted,
        InProgress,
        Ended
    }
    enum GameMode {
        Rounds,
        TimeBased
    }

    // The game room now tracks turn-related timing
    struct GameRoom {
        address creator;
        uint256 id;
        uint256 maxNumber;
        uint256 entryFee;
        address[] players;
        bool isActive;
        GameStatus status;
        GameMode mode;
        uint256 startTime; // Game start (for time-based mode)
        uint256 duration; // Total game duration (time-based mode)
        uint256 roundValue; // Maximum rounds (round-based mode)
        uint256 roundCurrentValue; // Current round number (round-based mode)
        uint256 currentPlayerIndex; // Which player’s turn it is (round-based mode)
        uint256 lastTurnTimestamp; // When the current turn began
        uint256 turnTimeout; // Maximum allowed time per turn (seconds)
    }

    mapping(uint256 => GameRoom) public gameRooms;
    // Removed the previous playerScores mapping.
    // New mapping to keep track of each player's draws.
    // Their draws are stored as a flat array: [prev1, prev2, newDraw1, newDraw2, ...]
    mapping(uint256 => mapping(address => uint256[])) public playerDraws;
    mapping(uint256 => mapping(address => bool)) public isEliminated;
    uint256 public roomCounter;

    GameRoom[] private allGameRooms;

    // Events for various actions
    event GameRoomCreated(
        uint256 roomId,
        address creator,
        uint256 maxNumber,
        uint256 entryFee,
        GameMode mode
    );
    event PlayerJoined(uint256 roomId, address player);
    event GameStarted(uint256 _roomId);
    event PlayerPlayed(uint256 _roomId, address player);
    event PlayerEliminated(uint256 roomId, address player);
    event WinnerDeclared(uint256 roomId, address winner, uint256 prize);
    event NoWinner(uint256 roomId, uint256 prizeTransferredToOwner);
    event TurnSkipped(uint256 roomId, address player);
    event TurnTimedOut(uint256 roomId, address timedOutPlayer);
    event TurnAdvanced(
        uint256 roomId,
        address newPlayer,
        uint256 currentRound,
        uint256 turnStartTime
    );

    constructor(address gameTokenAddress) {
        owner = msg.sender;
        gameToken = IERC20(gameTokenAddress);
    }

    // Create a game room; _turnTimeout sets the max time (in seconds) for each turn.
    function createGameRoom(
        uint256 _maxNumber,
        GameMode _mode,
        uint256 _durationOrRounds,
        uint256 _turnTimeout
    ) external payable {
        require(_maxNumber > 0, "Max number must be > 0");
        require(msg.value > 0, "Entry fee must be greater than zero");

        roomCounter++;
        GameRoom storage room = gameRooms[roomCounter];
        room.creator = msg.sender;
        room.id = roomCounter; // fixed assignment from '==' to '='
        room.maxNumber = _maxNumber;
        room.entryFee = msg.value;
        room.isActive = true;
        room.status = GameStatus.NotStarted;
        room.mode = _mode;
        if (_mode == GameMode.Rounds) {
            room.roundValue = _durationOrRounds;
        } else {
            room.duration = _durationOrRounds;
        }
        room.roundCurrentValue = 1;
        room.currentPlayerIndex = 0;
        room.turnTimeout = _turnTimeout;
        // lastTurnTimestamp will be set when the game starts
        room.lastTurnTimestamp = 0;
        room.players.push(msg.sender);

        allGameRooms.push(room);

        emit GameRoomCreated(
            roomCounter,
            msg.sender,
            _maxNumber,
            msg.value,
            _mode
        );
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
    function _getDraws(
        address _player,
        uint256 _nonce
    ) internal view returns (uint256, uint256) {
        uint256 first = (uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    _player,
                    _nonce
                )
            )
        ) % 100) + 1;
        uint256 second = (uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    _player,
                    _nonce + 1
                )
            )
        ) % 100) + 1;
        return (first, second);
    }

    // For rounds mode: the current player takes their turn.
    function playTurn(uint256 _roomId) external returns (uint256, uint256) {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(
            room.players[room.currentPlayerIndex] == msg.sender,
            "Not your turn"
        );
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        (uint256 draw1, uint256 draw2) = _getDraws(
            msg.sender,
            room.roundCurrentValue + room.currentPlayerIndex
        );

        // Instead of accumulating the total draw, we store the pair in the player's draw history.
        playerDraws[_roomId][msg.sender].push(draw1);
        playerDraws[_roomId][msg.sender].push(draw2);

        // Calculate the sum of all draws for this player.
        uint256 sum = 0;
        uint256[] storage draws = playerDraws[_roomId][msg.sender];
        for (uint256 i = 0; i < draws.length; i++) {
            sum += draws[i];
        }

        if (sum > room.maxNumber) {
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
        require(
            room.players[room.currentPlayerIndex] == msg.sender,
            "Not your turn"
        );
        require(!isEliminated[_roomId][msg.sender], "You are eliminated");

        require(
            gameToken.transferFrom(msg.sender, owner, skipFee),
            "Token transfer failed"
        );
        emit TurnSkipped(_roomId, msg.sender);
        _advanceTurn(_roomId);
    }

    // This function allows any player to force the game to move forward if the current player timed out.
    // It eliminates the inactive player and advances the turn.
    function forceAdvance(uint256 _roomId) external {
        GameRoom storage room = gameRooms[_roomId];
        require(room.status == GameStatus.InProgress, "Game not in progress");
        require(
            block.timestamp > room.lastTurnTimestamp + room.turnTimeout,
            "Turn not timed out yet"
        );

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
            room.currentPlayerIndex =
                (room.currentPlayerIndex + 1) %
                playersCount;
            if (room.currentPlayerIndex == 0) {
                room.roundCurrentValue++;
            }
            // Break if we've looped over all players.
            if (room.currentPlayerIndex == startingIndex) break;
        } while (isEliminated[_roomId][room.players[room.currentPlayerIndex]]);

        emit TurnAdvanced(
            _roomId,
            room.players[room.currentPlayerIndex],
            room.roundCurrentValue,
            room.lastTurnTimestamp
        );
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
                // Calculate the total score by summing all draws for the player.
                uint256 total = 0;
                uint256[] storage draws = playerDraws[_roomId][room.players[i]];
                for (uint256 j = 0; j < draws.length; j++) {
                    total += draws[j];
                }
                if (total < lowestScore) {
                    lowestScore = total;
                    lowestScorer = room.players[i];
                }
            }
        }
        uint256 prize = room.players.length * room.entryFee;

        // Note: fixed reference from room.currentRound and room.rounds to room.roundCurrentValue and room.roundValue
        if (remainingPlayers == 1 || room.roundCurrentValue > room.roundValue) {
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

    function getGameRoomById(
        uint256 _gameRoomId
    ) public view returns (GameRoom memory) {
        return gameRooms[_gameRoomId];
    }

    function getAllGameRooms() public view returns (GameRoom[] memory) {
        return allGameRooms;
    }

    // Returns the draw history for a given room and player.
    function getPlayerDrawsForGameRoom(
        uint256 _roomId,
        address _player
    ) public view returns (uint256[] memory) {
        return playerDraws[_roomId][_player];
    }

    function getIsPlayerEliminatedByRoomId(
        uint256 _roomId,
        address _player
    ) public view returns (bool) {
        return isEliminated[_roomId][_player];
    }

    function getTotalRoomsCreated() public view returns (uint256) {
        return roomCounter;
    }

    function getAvailableRooms() public view returns (GameRoom[] memory) {
        // First, count how many rooms are available.
        uint256 availableCount = 0;
        for (uint256 i = 0; i < allGameRooms.length; i++) {
            if (
                allGameRooms[i].isActive &&
                allGameRooms[i].status == GameStatus.NotStarted
            ) {
                availableCount++;
            }
        }

        // Allocate a new array with the exact count.
        GameRoom[] memory availableRooms = new GameRoom[](availableCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allGameRooms.length; i++) {
            if (
                allGameRooms[i].isActive &&
                allGameRooms[i].status == GameStatus.NotStarted
            ) {
                availableRooms[index] = allGameRooms[i];
                index++;
            }
        }

        return availableRooms;
    }
}
