import { PolywrapClient } from "@polywrap/client-js";
import * as App from "../types/wrap";
import path from "path";
import {
  getClientConfig,
  initInfra,
  setupContractNetworks,
  stopInfra,
} from "../utils";

jest.setTimeout(60000);

describe("Template Wrapper End to End Tests", () => {

  let uri: string;

  beforeAll(() => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    uri = `fs/${wrapperPath}/build`;
  })

  it("plays a quiz", async () => {
    const {
      wallet,
      other,
      alice,
      bob,
      token,
      arcoiris,
      proportional,
      quizMC
    } = await setupContractNetworks(new PolywrapClient(getClientConfig()))

    const clientPoller = new PolywrapClient(getClientConfig({ signer: wallet.address }));

    const {
      value: { result: gatheringID }
    } = await clientPoller.invoke<App.Gathering>({
      uri,
      method: "createGathering",
      args: { arcoiris, token, proportional, quizMC, isMutable }
    });

    const {
      value: { result: { quizID, ceremonyID } }
    } = await clientPoller.invoke<App.Gathering>({
      uri,
      method: "createQuiz",
      args: { quizMC, gatheringID }
    });

    const txMintAlice = await token.mint(alice.address);

    const receiptMintAlice = await txMintAlice.wait();

    const tokenAlice = receiptMintAlice.logs[0].topics[3];

    const txMintBob = await token.mint(bob.address);

    const receiptMintBob = await txMintBob.wait();

    const tokenBob = receiptMintBob.logs[0].topics[3];

    const txApproveAlice = await token
      .connect(alice)
      .approve(arcoiris.target, tokenAlice);

    await txApproveAlice.wait();

    const txApproveBob = await token
      .connect(bob)
      .approve(arcoiris.target, tokenBob);

    await txApproveBob.wait();

    const clientAlice = new PolywrapClient(getClientConfig({ signer: alice.address }));

    await clientAlice.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "contribute",
      args: {
        arcoiris,
        gatheringID,
        ceremonyID,
        token.target,
        tokenAlice,
      },
    });

    const clientBob = new PolywrapClient(getClientConfig({ signer: bob.address }));

    await clientBob.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "contribute",
      args: {
        arcoiris,
        gatheringID,
        ceremonyID,
        token.target,
        tokenBob,
      },
    });

    function hashValue(value, salt) {
      const bytes = ethers.toUtf8Bytes(value);

      const guess = ethers.concat([bytes, salt]);

      const hash = ethers.keccak256(guess);

      return hash;
    }

    const saltCorrect = ethers.id("randomnumber");

    const saltHashCorrect = ethers.keccak256(saltCorrect);

    const hashesCorrect = [
      hashValue("banana", saltCorrect),
      hashValue("knife", saltCorrect)
    ];

    await clientPoller.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "commitCorrect",
      args: {
        quizMC,
        quizID,
        saltHashCorrect,
        hashesCorrect,
      },
    });

    const saltAlice = ethers.id("alicenumber");

    const saltHashAlice = ethers.keccak256(saltAlice);

    const hashesAlice = [
      hashValue("banana", saltAlice),
      hashValue("knife", saltAlice)
    ];

    await clientAlice.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "commitGuess",
      args: {
        quizMC,
        quizID,
        saltHashAlice,
        hashesAlice,
      },
    });

    const guessesCorrect = [
      ethers.toUtf8Bytes("banana"),
      ethers.toUtf8Bytes("knife")
    ];

    await clientPoller.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "endQuiz",
      args: {
        quizMC,
        quizID,
      },
    });

    await clientPoller.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "revealCorrect",
      args: {
        quizMC,
        quizID,
        saltCorrect,
        guessesCorrect,
      },
    });

    await clientAlice.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "revealGuess",
      args: {
        quizMC,
        quizID,
        saltAlice,
        guessesCorrect,
      },
    });

    await clientPoller.invoke<App.Ethereum_TxResponse>({
      uri,
      method: "redistribute",
      args: {
        quizMC,
        quizID,
      },
    });

    const balanceAlice = await token.balanceOf(alice.address);

    expect(balanceAlice).to.equal(2);
  });
});
