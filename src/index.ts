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
    // const txQuiz = await quizMC.createQuiz(gatheringID)
    return {
      ceremonyID: BigInt.from(1),
      quizID: BigInt.from(1),
    };
  }

  contribute(args: Args_contribute): Ethers_TxReceipt {
    // .contribute(gatheringID, ceremonyID, token.target, tokenBob)

    return {
      to: "",
      _from: "",
      contractAddress: "",
      gasUsed: BigInt.from(0),
      logsBloom: "",
      transactionHash: "",
      logs: [],
      blockNumber: BigInt.from(0),
      blockHash: "",
      cumulativeGasUsed: BigInt.from(0),
      effectiveGasPrice: BigInt.from(0),
    };
  }

  commitCorrect(args: Args_commitCorrect): Ethers_TxReceipt {
    // await quizMC.commitCorrect(quizID, saltHashCorrect, hashesCorrect)
    return {
      to: "",
      _from: "",
      contractAddress: "",
      gasUsed: BigInt.from(0),
      logsBloom: "",
      transactionHash: "",
      logs: [],
      blockNumber: BigInt.from(0),
      blockHash: "",
      cumulativeGasUsed: BigInt.from(0),
      effectiveGasPrice: BigInt.from(0),
    };
  }

  commitGuess(args: Args_commitGuess): Ethers_TxReceipt {
    // await quizMC.commitCorrect(quizID, saltHashCorrect, hashesCorrect)
    return {
      to: "",
      _from: "",
      contractAddress: "",
      gasUsed: BigInt.from(0),
      logsBloom: "",
      transactionHash: "",
      logs: [],
      blockNumber: BigInt.from(0),
      blockHash: "",
      cumulativeGasUsed: BigInt.from(0),
      effectiveGasPrice: BigInt.from(0),
    };
  }

  endQuiz(args: Args_endQuiz): Ethers_TxReceipt {
    // await quizMC.endQuiz(quizID)
    return {
      to: "",
      _from: "",
      contractAddress: "",
      gasUsed: BigInt.from(0),
      logsBloom: "",
      transactionHash: "",
      logs: [],
      blockNumber: BigInt.from(0),
      blockHash: "",
      cumulativeGasUsed: BigInt.from(0),
      effectiveGasPrice: BigInt.from(0),
    };
  }

  revealCorrect(args: Args_revealCorrect): Ethers_TxReceipt {
    // await quizMC.revealCorrect(quizID, saltCorrect, guessesCorrect)
    return {
      to: "",
      _from: "",
      contractAddress: "",
      gasUsed: BigInt.from(0),
      logsBloom: "",
      transactionHash: "",
      logs: [],
      blockNumber: BigInt.from(0),
      blockHash: "",
      cumulativeGasUsed: BigInt.from(0),
      effectiveGasPrice: BigInt.from(0),
    };
  }

  revealGuess(args: Args_revealGuess): Ethers_TxReceipt {
    // await quizMC.revealCorrect(quizID, saltCorrect, guessesCorrect)
    return {
      to: "",
      _from: "",
      contractAddress: "",
      gasUsed: BigInt.from(0),
      logsBloom: "",
      transactionHash: "",
      logs: [],
      blockNumber: BigInt.from(0),
      blockHash: "",
      cumulativeGasUsed: BigInt.from(0),
      effectiveGasPrice: BigInt.from(0),
    };
  }

  redistribute(args: Args_redistribute): Ethers_TxReceipt {
    // await quizMC.redistribute(quizID)
    return {
      to: "",
      _from: "",
      contractAddress: "",
      gasUsed: BigInt.from(0),
      logsBloom: "",
      transactionHash: "",
      logs: [],
      blockNumber: BigInt.from(0),
      blockHash: "",
      cumulativeGasUsed: BigInt.from(0),
      effectiveGasPrice: BigInt.from(0),
    };
  }
}
