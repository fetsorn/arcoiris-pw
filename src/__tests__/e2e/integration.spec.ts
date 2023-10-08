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

jest.setTimeout(600000);

describe("Arcoíris Wrapper End to End Tests", () => {
  let uri: string;

  let tx: any;

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
      await setupContractNetworks();

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

    // tx = await arcoiris.createGathering(
    //   token.target,
    //   proportional.target,
    //   quizMC.target,
    //   false,
    // );

    // const receiptGathering = await tx.wait();

    // const gatheringID = receiptGathering.logs[0].topics[1];

    const {
      value: { quizID, ceremonyID },
    } = await clientPoller.invoke<App.Arcoiris_Quiz>({
      uri,
      method: "createQuiz",
      args: { quizMC: quizMC.target, gatheringID },
    });

    // tx = await quizMC.createQuiz(gatheringID);

    // const receiptQuiz = await tx.wait();

    // const quizID = receiptQuiz.logs[0].topics[1];

    // const ceremonyID = await quizMC.getCeremonyID(quizID);

    tx = await token.mint(alice.address);

    const receiptMintAlice = await tx.wait();

    const tokenAlice = receiptMintAlice.logs[0].topics[3];

    tx = await token.mint(bob.address);

    const receiptMintBob = await tx.wait();

    const tokenBob = receiptMintBob.logs[0].topics[3];

    tx = await token.connect(alice).approve(arcoiris.target, tokenAlice);

    await tx.wait();

    tx = await token.connect(bob).approve(arcoiris.target, tokenBob);

    await tx.wait();

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

    // tx = await arcoiris
    //   .connect(alice)
    //   .contribute(gatheringID, ceremonyID, token.target, tokenAlice);

    // await tx.wait();

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

    // tx = await arcoiris
    //   .connect(bob)
    //   .contribute(gatheringID, ceremonyID, token.target, tokenBob);

    // await tx.wait();

    const guessesCorrect = ["answer1", "answer2"];

    const saltCorrect = "randomnumber";

    const saltAlice = "alicenumber";

    function hashValue(saltID: string) {
      return (value: string) => {
        const salted = ethers.concat([ethers.toUtf8Bytes(value), saltID]);

        const hash = ethers.keccak256(salted);

        return hash;
      };
    }

    const saltCorrectID = ethers.id(saltCorrect);

    const saltHashCorrect = ethers.keccak256(saltCorrectID);

    const hashesCorrect = guessesCorrect.map(hashValue(saltCorrectID));

    const saltAliceID = ethers.id(saltAlice);

    const saltHashAlice = ethers.keccak256(saltAliceID);

    const hashesAlice = guessesCorrect.map(hashValue(saltAliceID));

    const guessesBytes = guessesCorrect.map((value: string) =>
      ethers.toUtf8Bytes(value),
    );

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "commitCorrect",
      args: {
        quizMC: quizMC.target,
        quizID,
        salt: saltCorrect,
        guesses: guessesCorrect,
      },
    });

    // tx = await quizMC
    //   .connect(poller)
    //   .commitCorrect(quizID, saltHashCorrect, hashesCorrect);

    // await tx.wait();

    expect(await quizMC.getSaltHash(quizID, quizMC.target)).toEqual(
      saltHashCorrect,
    );

    expect(await quizMC.getHashes(quizID, quizMC.target)).toEqual(
      hashesCorrect,
    );

    await clientAlice.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "commitGuess",
      args: {
        quizMC: quizMC.target,
        quizID,
        salt: saltAlice,
        guesses: guessesCorrect,
      },
    });

    // tx = await quizMC
    //   .connect(alice)
    //   .commitGuess(quizID, saltHashAlice, hashesAlice);

    // await tx.wait();

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "endQuiz",
      args: {
        quizMC: quizMC.target,
        quizID,
      },
    });

    // tx = await quizMC.connect(poller).endQuiz(quizID);

    // await tx.wait();

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "revealCorrect",
      args: {
        quizMC: quizMC.target,
        quizID,
        salt: saltCorrect,
        guesses: guessesCorrect,
      },
    });

    // tx = await quizMC
    //   .connect(poller)
    //   .revealCorrect(quizID, saltCorrectID, guessesBytes);

    // await tx.wait();

    await clientAlice.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "revealGuess",
      args: {
        quizMC: quizMC.target,
        quizID,
        salt: saltAlice,
        guesses: guessesCorrect,
      },
    });

    // tx = await quizMC
    //   .connect(alice)
    //   .revealGuess(quizID, saltAliceID, guessesBytes);

    // await tx.wait();

    await clientPoller.invoke<App.Ethers_TxReceipt>({
      uri,
      method: "redistribute",
      args: {
        quizMC: quizMC.target,
        quizID,
      },
    });

    // tx = await quizMC.redistribute(quizID);

    // await tx.wait();

    const balanceAlice = await token.balanceOf(alice.address);

    expect(balanceAlice).toEqual(2n);
  });
});
