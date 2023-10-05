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
} from "./wrap";
import { BigInt } from "@polywrap/wasm-as";

export class Module extends ModuleBase {
  createGathering(args: Args_createGathering): BigInt {
    return BigInt.from(1);
  }

  createQuiz(args: Args_createQuiz): Quiz {
    return {
      ceremonyID: BigInt.from(1),
      quizID: BigInt.from(1),
    };
  }

  contribute(args: Args_contribute): Ethers_TxReceipt {
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
