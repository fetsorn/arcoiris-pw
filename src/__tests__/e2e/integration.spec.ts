import { PolywrapClient } from "@polywrap/client-js";
import { ethers } from "ethers";
import * as App from "../types/wrap";
import path from "path";
import {
  getClientConfig,
  initInfra,
  setupContractNetworks,
  stopInfra,
} from "../utils";

jest.setTimeout(60000);

describe("Arcoíris Wrapper End to End Tests", () => {
  let uri: string;

  beforeAll(async () => {
    await initInfra();

    const dirname: string = path.resolve(__dirname);

    const wrapperPath: string = path.join(dirname, "..", "..", "..");

    uri = `fs/${wrapperPath}/build`;
  });

  afterAll(async () => {
    await stopInfra();
  });

  it("plays a quiz", async () => {
    const { poller, alice, bob, token, arcoiris, proportional, quizMC } =
      await setupContractNetworks(new PolywrapClient(getClientConfig()));

    const clientPoller = new PolywrapClient(
      getClientConfig({ signer: poller }),
    );

    const { value: gatheringID } = await clientPoller.invoke<App.BigInt>({
      uri,
      method: "createGathering",
      args: {
        arcoiris: arcoiris.target,
        collection: token.target,
        redistribution: proportional.target,
        mc: quizMC.target,
        isMutable: false,
      },
    });

    const {
      value: { quizID, ceremonyID },
    } = await clientPoller.invoke<App.Arcoiris_Quiz>({
      uri,
      method: "createQuiz",
      args: { quizMC: quizMC.target, gatheringID },
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

    const clientAlice = new PolywrapClient(getClientConfig({ signer: alice }));

    await clientAlice.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "contribute",
      args: {
        arcoiris: arcoiris.target,
        gatheringID,
        ceremonyID,
        token: token.target,
        tokenID: tokenAlice,
      },
    });

    const clientBob = new PolywrapClient(getClientConfig({ signer: bob }));

    await clientBob.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "contribute",
      args: {
        arcoiris: arcoiris.target,
        gatheringID,
        ceremonyID,
        token: token.target,
        tokenID: tokenBob,
      },
    });

    function hashValue(value: string, salt: string) {
      const bytes = ethers.toUtf8Bytes(value);

      const guess = ethers.concat([bytes, salt]);

      const hash = ethers.keccak256(guess);

      return hash;
    }

    const saltCorrect = ethers.id("randomnumber");

    const saltHashCorrect = ethers.keccak256(saltCorrect);

    const hashesCorrect = [
      hashValue("banana", saltCorrect),
      hashValue("knife", saltCorrect),
    ];

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "commitCorrect",
      args: {
        quizMC: quizMC.target,
        quizID,
        saltHash: saltHashCorrect,
        hashes: hashesCorrect,
      },
    });

    const saltAlice = ethers.id("alicenumber");

    const saltHashAlice = ethers.keccak256(saltAlice);

    const hashesAlice = [
      hashValue("banana", saltAlice),
      hashValue("knife", saltAlice),
    ];

    await clientAlice.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "commitGuess",
      args: {
        quizMC: quizMC.target,
        quizID,
        saltHash: saltHashAlice,
        hashes: hashesAlice,
      },
    });

    const guessesCorrect = [
      ethers.toUtf8Bytes("banana"),
      ethers.toUtf8Bytes("knife"),
    ];

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "endQuiz",
      args: {
        quizMC: quizMC.target,
        quizID,
      },
    });

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "revealCorrect",
      args: {
        quizMC: quizMC.target,
        quizID,
        saltCorrect,
        guessesCorrect,
      },
    });

    await clientAlice.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "revealGuess",
      args: {
        quizMC: quizMC.target,
        quizID,
        saltAlice,
        guessesCorrect,
      },
    });

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "redistribute",
      args: {
        quizMC: quizMC.target,
        quizID,
      },
    });

    const balanceAlice = await token.balanceOf(alice.address);

    expect(balanceAlice).toEqual(2n);
  });
});
