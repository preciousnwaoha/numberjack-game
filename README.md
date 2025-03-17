# Numberjack

Numberjack is an easy-to-play web3 multiplayer game built on the Core Blockchain. In this competitive experience, players draw number pairs and use tactics to stay below a preset maximum number. The last player standing wins all the rewards for that room, giving every match an exciting chance to earn tokens.

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Gameplay](#gameplay)
- [Key Features](#key-features)
- [Upcoming Features](#upcoming-features)
- [Running Locally](#running-locally)
- [Deployed](#deployed)
- [Developers](#developers)
- [Additional Info](#additional-info)

## Description

Numberjack offers a simple yet competitive gaming experience that connects random players with a rare chance to earn tokens through gameplay. Each game room features unique parameters such as a maximum number, an entry fee, and a defined number of rounds. Players can either create a new room or join an available one. Once the game starts, participants take turns performing game actions—either drawing a pair of numbers or skipping their turn. If a player refuses to take action within a set timeout period, other players have the option to force the move. A round concludes when only one player remains below the room’s maximum number, and once all rounds are completed, the winner is determined as the player with the lowest sum of all drawn numbers.

## Tech Stack

### Blockchain

- **Hardhat**
- **Solidity**
- **TypeScript**

### Frontend

- **Next.js**
- **TypeScript**
- **Ether.js**
- **TailwindCSS**
- **Websockets**

## Gameplay

- **Room Creation & Joining:**

  - Players can create a new room or join an existing one.
  - Each room is defined by its unique settings including maximum number, entry fee, and number of rounds.

- **Entry Fee:**

  - Players must stake an entry fee to participate in a room.

- **Game Actions:**

  - On their turn, players can choose to either draw a pair of numbers or skip their turn.
  - A timeout mechanism allows other players to force an action if someone refuses to act.

- **Round & Game Completion:**
  - A round ends when only one player remains under the room’s maximum number.
  - At the end of all rounds, the winner is the player with the lowest cumulative sum of all drawn numbers.

## Deployed

Experience the game live at: [numberjack.onrender.com](https://numberjack.onrender.com)

Test Websocket server is at [numberjack-game.onrender.com](https://numberjack-game.onrender.com)

## Dev Contracts

0xf51CBF7d0992576D72ef72D2c484ab2096cC67a4
0x8d4157F27Ef176e3a18398161Bb4f5930bc6Cf13

## Upcoming Features

Our vision for Numberjack continues to evolve. Based on our latest presentation slides, here’s what’s coming soon:

- **New Design:**
  - A refreshed and modern user interface for a better gaming experience.
- **Additional Game Modes:**
  - Modes such as **Timed** and **Drain** to introduce new challenges and strategies.
- **In-Game Tokens:**
  - A token system to further incentivize play and reward skillful tactics.
- **Lobby Chat:**
  - Real-time chat functionality to boost community interaction.
- **More Enhancements:**
  - Ongoing updates as we refine gameplay, introduce new features, and build a thriving ecosystem.


## Running Locally

To run the project locally, follow these instructions for each part of the application:

### Frontend

1. Navigate to the `./frontend` folder.
2. Create a `.env` file in the `./frontend` directory with the following content:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x7422e0BAf785e3058DD37F2048d1B93A6f716DE1
NEXT_PUBLIC_TOKEN_CONTACT_ADDRESS=0x9e558ec6f71ED33b6566BA66802147b0FA3834e6
```
3. Install dependencies and run the development server:

```bash
npm i && npm run dev
```

### Server

1. Navigate to the `./server` folder.
2. Create a .env file in the `./server` directory as needed.
3. Install dependencies and start the development server:
```bash
npm i && npm run start:dev
```

### Blockend

1. Navigate to the `./blockend` folder.
2. Create a `.env` file in the `./blockend` directory with the following content:
```env
PRIVATE_KEY=PRIVATE_KEY_TO_DEPLOYER_WALLET
```
3. Install dependencies:
```bash
npm i
```
4. Use Hardhat commands to compile and deploy the contracts. For example:
```
npx hardhat compile
npx hardhat run scripts/deploy-contracts.js
```

## Developers

This project is actively developed by:

- [preciousnwaoha](https://github.com/preciousnwaoha)
- [adamsdavee](https://github.com/adamsdavee)

## Additional Info

Contributions are allowed
### Stage

MVP and tests
