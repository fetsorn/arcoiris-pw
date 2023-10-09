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
  Args_getSalt,
  Args_getSaltHash,
  Args_getHashes,
  Args_getGuesses,
  Args_id,
  Args_saltAndHashValue,
  Args_balanceOf,
  Args_tokenOfOwnerByIndex,
  Quiz,
  ModuleBase,
  Commitment,
  Ethers_TxReceipt,
  Ethers_Log,
  Ethers_Module,
  EthersUtils_Module,
} from "./wrap";
import { BigInt } from "@polywrap/wasm-as";
import { encode } from "as-hex";

function hashValues(values: string[], saltID: string): string[] {
  var hashes = new Array<string>(0);

  for (let i = 0, l = values.length; i < l; ++i) {
    const salted = "0x" + encode(values[i]) + saltID.substring(2);

    const hash = EthersUtils_Module.keccak256({
      value: salted,
    }).unwrap();

    hashes.push(hash);
  }

  return hashes;
}

function encodeValues(values: string[]): string[] {
  var bytes = new Array<string>(0);

  for (let i = 0, l = values.length; i < l; ++i) {
    bytes.push("0x" + encode(values[i]));
  }

  return bytes;
}

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

  commitCorrect(args: Args_commitCorrect): Commitment {
    const saltID = EthersUtils_Module.keccak256({
      value: "0x" + encode(args.salt),
    }).unwrap();

    const saltHash = EthersUtils_Module.keccak256({
      value: saltID,
    }).unwrap();

    const hashes = hashValues(args.guesses, saltID);

    Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function commitCorrect(uint256 quizID, bytes32 saltHash, bytes32[] memory hashes) external onlyModerator(quizID)",
      args: [args.quizID.toString(), saltHash, "[" + hashes.toString() + "]"],
    }).unwrap();

    return {
      saltHash,
      guessHashes: hashes,
    };
  }

  commitGuess(args: Args_commitGuess): Commitment {
    const saltID = EthersUtils_Module.keccak256({
      value: "0x" + encode(args.salt),
    }).unwrap();

    const saltHash = EthersUtils_Module.keccak256({
      value: saltID,
    }).unwrap();

    const hashes = hashValues(args.guesses, saltID);

    Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function commitGuess(uint256 quizID, bytes32 saltHash, bytes32[] memory hashes) external",
      args: [args.quizID.toString(), saltHash, "[" + hashes.toString() + "]"],
    }).unwrap();

    return {
      saltHash,
      guessHashes: hashes,
    };
  }

  endQuiz(args: Args_endQuiz): Ethers_TxReceipt {
    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method: "function endQuiz(uint256 quizID) external onlyModerator(quizID)",
      args: [args.quizID.toString()],
    }).unwrap();
  }

  revealCorrect(args: Args_revealCorrect): Ethers_TxReceipt {
    const saltID = EthersUtils_Module.keccak256({
      value: "0x" + encode(args.salt),
    }).unwrap();

    const hashes = hashValues(args.guesses, saltID);

    const guesses = encodeValues(args.guesses);

    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function revealCorrect(uint256 quizID, bytes32 salt, bytes[] memory guesses) external onlyModerator(quizID)",
      args: [args.quizID.toString(), saltID, "[" + guesses.toString() + "]"],
    }).unwrap();
  }

  revealGuess(args: Args_revealGuess): Ethers_TxReceipt {
    const saltID = EthersUtils_Module.keccak256({
      value: "0x" + encode(args.salt),
    }).unwrap();

    const hashes = hashValues(args.guesses, saltID);

    const guesses = encodeValues(args.guesses);

    return Ethers_Module.callContractMethodAndWait({
      address: args.quizMC,
      method:
        "function revealGuess(uint256 quizID, bytes32 salt, bytes[] memory guesses) external onlyModerator(quizID)",
      args: [args.quizID.toString(), saltID, "[" + guesses.toString() + "]"],
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

  getSaltHash(args: Args_getSaltHash): string {
    return Ethers_Module.callContractView({
      address: args.quizMC,
      method:
        "function getSaltHash(uint256 quizID, address player) external view returns (bytes32 saltHash)",
      args: [
        args.quizID.toString(),
        args.address,
      ],
    }).unwrap();
  }

  getSalt(args: Args_getSalt): string {
    return Ethers_Module.callContractView({
      address: args.quizMC,
      method:
        "function getSalt(uint256 quizID, address player) external view returns (bytes32 salt)",
      args: [
        args.quizID.toString(),
        args.address,
      ],
    }).unwrap();
  }

  getHashes(args: Args_getHashes): string {
    return Ethers_Module.callContractView({
      address: args.quizMC,
      method:
        "function getHashes(uint256 quizID, address player) external view returns (bytes32[] memory hashes)",
      args: [
        args.quizID.toString(),
        args.address,
      ],
    }).unwrap();
  }

  getGuesses(args: Args_getGuesses): string {
    return Ethers_Module.callContractView({
      address: args.quizMC,
      method:
        "function getGuesses(uint256 quizID, address player) external view returns (bytes[] memory guesses)",
      args: [
        args.quizID.toString(),
        args.address,
      ],
    }).unwrap();
  }

  id(args: Args_id): string {
    return EthersUtils_Module.keccak256({
      value: "0x" + encode(args.value),
    }).unwrap();
  }

  saltAndHashValue(args: Args_saltAndHashValue): string {
    const saltID = EthersUtils_Module.keccak256({
      value: "0x" + encode(args.salt),
    }).unwrap();

    const salted = "0x" + encode(args.value) + saltID.substring(2);

    const hash = EthersUtils_Module.keccak256({
      value: salted,
    }).unwrap();

    return hash;
  }

  balanceOf(args: Args_balanceOf): BigInt {
    const balance = Ethers_Module.callContractView({
      address: args.token,
      method:
        "function balanceOf(address owner) external view returns (uint256 balance)",
      args: [
        args.address,
      ],
    }).unwrap();

    return BigInt.from(balance);
  }

  tokenOfOwnerByIndex(args: Args_tokenOfOwnerByIndex): BigInt {
    const tokenID = Ethers_Module.callContractView({
      address: args.token,
      method:
        "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
      args: [
        args.address,
        args.index.toString()
      ],
    }).unwrap();

    return BigInt.from(tokenID);
  }
}
