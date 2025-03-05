// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const gameAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

module.exports = buildModule("GameModule", (m) => {
  const gameTokenAddress = m.getParameter("gameTokenAddress", gameAddress);

  const game = m.contract("NumberJackGame", [gameTokenAddress]);

  return { game };
});
