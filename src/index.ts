import {
  Args_createGathering,
  Args_createQuiz,
  Args_contribute,
  Args_commitCorrect,
  Args_commitGuess,
  Args_endQuiz,
  Args_revealCorrect,
  Args_revealGuess,
  Args_redistribute,
  Quiz,
  ModuleBase,
  Ethers_TxReceipt,
  Ethers_Log,
  Ethers_Module,
} from "./wrap";
import { BigInt } from "@polywrap/wasm-as";

export class Module extends ModuleBase {
  createGathering(args: Args_createGathering): BigInt {
    const tx = Ethers_Module.callContractMethodAndWait({
      address: args.arcoiris,
      method:
        "function createGathering(address collection, address redistribution, address mc, bool isMutable) external returns (uint256 gatheringID)",
      args: [
        args.collection,
        args.redistribution,
        args.mc,
        args.isMutable.toString(),
      ],
    }).unwrap();

    // CreateGathering (index_topic_1 uint256 gatheringID, index_topic_2 address focalizer, index_topic_3 address mc, address collection, address redistribution, bool isMutable)
    const createGatheringEvent =
      "0x7278386a55533b695ad284d518708f0ebf2b7c029ca31a5c744110eab102daf9";

    const index = tx.logs.findIndex(
      (log: Ethers_Log) => log.topics[0] == createGatheringEvent,
    );

    if (index == -1) {
      throw new Error(
        "Couldn't fetch address from event logs from transaction " +
          tx.transactionHash,
      );
    }

    const gatheringID = tx.logs[index].topics[1];

    return BigInt.from(gatheringID);
  }

  createQuiz(args: Args_createQuiz): Quiz {
    const tx = Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function createQuiz(uint256 gatheringID) external returns (uint256 quizID)",
      args: [args.gatheringID.toString()],
    }).unwrap();

    // CreateQuiz (index_topic_1 uint256 quizID, index_topic_2 uint256 gatheringID, index_topic_3 uint256 ceremonyID, address moderator)
    const createQuizEvent =
      "0x67c0bcd395b0bd90ff48a3248891a5b14d7c1b5ae0be524539ffbead463f2c8d";

    const index = tx.logs.findIndex(
      (log: Ethers_Log) => log.topics[0] == createQuizEvent,
    );

    if (index == -1) {
      throw new Error(
        "Couldn't fetch address from event logs from transaction " +
          tx.transactionHash,
      );
    }

    const quizID = tx.logs[index].topics[1];

    const ceremonyID = tx.logs[index].topics[3];

    return {
      ceremonyID: BigInt.from(ceremonyID),
      quizID: BigInt.from(quizID),
    };
  }

  contribute(args: Args_contribute): Ethers_TxReceipt {
    // can approve here, but cheaper to approve elsewhere with setApprovalForAll
    return Ethers_Module.callContractMethodAndWait({
      address: args.arcoiris,
      method:
        "function contribute(uint256 gatheringID, uint256 ceremonyID, address tokenAddress, uint256 tokenID)",
      args: [
        args.gatheringID.toString(),
        args.ceremonyID.toString(),
        args.token,
        args.tokenID.toString(),
      ],
    }).unwrap();
  }

  commitCorrect(args: Args_commitCorrect): Ethers_TxReceipt {
    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function commitCorrect(uint256 quizID, bytes32 saltHash, bytes32[] memory hashes) external onlyModerator(quizID)",
      args: [args.quizID.toString(), args.saltHash, args.hashes.toString()],
    }).unwrap();
  }

  commitGuess(args: Args_commitGuess): Ethers_TxReceipt {
    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function commitGuess(uint256 quizID, bytes32 saltHash, bytes32[] memory hashes) external",
      args: [args.quizID.toString(), args.saltHash, args.hashes.toString()],
    }).unwrap();
  }

  endQuiz(args: Args_endQuiz): Ethers_TxReceipt {
    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method: "function endQuiz(uint256 quizID) external onlyModerator(quizID)",
      args: [args.quizID.toString()],
    }).unwrap();
  }

  revealCorrect(args: Args_revealCorrect): Ethers_TxReceipt {
    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function revealCorrect(uint256 quizID, bytes32 salt, bytes[] memory guesses) external onlyModerator(quizID)",
      args: [args.quizID.toString(), args.salt, args.guesses.toString()],
    }).unwrap();
  }

  revealGuess(args: Args_revealGuess): Ethers_TxReceipt {
    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function revealGuess(uint256 quizID, bytes32 salt, bytes[] memory guesses) external",
      args: [args.quizID.toString(), args.salt, args.guesses.toString()],
    }).unwrap();
  }

  redistribute(args: Args_redistribute): Ethers_TxReceipt {
    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function redistribute(uint256 quizID) external onlyModerator(quizID)",
      args: [args.quizID.toString()],
    }).unwrap();
  }
}
