import {
  Connection,
  Connections,
  ethereumProviderPlugin,
} from "@polywrap/ethereum-provider-js";
import { ethers, Wallet } from "ethers";
import { ETH_ENS_IPFS_MODULE_CONSTANTS } from "@polywrap/cli-js";
import { spawn, ChildProcess } from "child_process";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

import {
  CoreClientConfig,
  PolywrapClient,
  IWrapPackage,
} from "@polywrap/client-js";
import { PolywrapClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { configure } from "../../client-config";

import {
  abi as ERC721ABI,
  bytecode as ERC721Bytecode,
} from "arcoiris/artifacts/ERC721PresetMinterPauserAutoId.sol/ERC721PresetMinterPauserAutoId.json";
import {
  abi as ArcoirisABI,
  bytecode as ArcoirisBytecode,
} from "arcoiris/artifacts/Arcoiris.sol/Arcoiris.json";
import {
  abi as ProportionalABI,
  bytecode as ProportionalBytecode,
} from "arcoiris/artifacts/Proportional.sol/Proportional.json";
import {
  abi as QuizMCABI,
  bytecode as QuizMCBytecode,
} from "arcoiris/artifacts/QuizMC.sol/QuizMC.json";
import {
  IERC721,
  Arcoiris,
  IRedistribution,
  QuizMC,
} from "arcoiris/typechain-types";

import { pkPoller, pkAlice, pkBob } from "./constants";

interface CustomizableConfig {
  signer?: Wallet;
  safeAddress?: string;
}
export const chainId = 1337;

export function getClientConfig(
  customConfig?: CustomizableConfig,
): CoreClientConfig {
  const envs: Record<string, Record<string, unknown>> = {
    "wrap://package/ipfs-resolver": {
      provider: ETH_ENS_IPFS_MODULE_CONSTANTS.ipfsProvider,
    },
  };

  const config = configure(new PolywrapClientConfigBuilder());
  config.addEnvs(envs);

  if (customConfig && customConfig.signer) {
    config.setPackage(
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0",
      ethereumProviderPlugin({
        connections: new Connections({
          networks: {
            testnet: new Connection({
              provider: ETH_ENS_IPFS_MODULE_CONSTANTS.ethereumProvider,
              signer: customConfig?.signer.address,
            }),
          },
          defaultNetwork: "testnet",
        }),
      }) as IWrapPackage,
    );
  }

  return config.build();
}

export const setupContractNetworks = async (
  client: PolywrapClient,
): Promise<{
  poller: Wallet;
  alice: Wallet;
  bob: Wallet;
  token: IERC721;
  arcoiris: Arcoiris;
  proportional: IRedistribution;
  quizMC: QuizMC;
}> => {
  const provider = new ethers.JsonRpcProvider(
    ETH_ENS_IPFS_MODULE_CONSTANTS.ethereumProvider,
  );

  const poller = new Wallet(pkPoller, provider);

  const alice = new Wallet(pkAlice, provider);

  const bob = new Wallet(pkBob, provider);

  await provider.send("hardhat_setBalance", [
    poller.address,
    ethers.toQuantity(100n ** 18n),
  ]);
  await provider.send("hardhat_setBalance", [
    alice.address,
    ethers.toQuantity(100n ** 18n),
  ]);
  await provider.send("hardhat_setBalance", [
    bob.address,
    ethers.toQuantity(100n ** 18n),
  ]);

  const tokenFactory = new ethers.ContractFactory(
    ERC721ABI,
    ERC721Bytecode,
    poller,
  );

  const token = (await tokenFactory.deploy(
    "Ticket",
    "TICKT",
    "https://example.com",
  )) as IERC721;

  await token.waitForDeployment();

  const arcoirisFactory = new ethers.ContractFactory(
    ArcoirisABI,
    ArcoirisBytecode,
    poller,
  );

  const arcoiris = (await arcoirisFactory.deploy()) as Arcoiris;

  await arcoiris.waitForDeployment();

  const proportionalFactory = new ethers.ContractFactory(
    ProportionalABI,
    ProportionalBytecode,
    poller,
  );

  const proportional = (await proportionalFactory.deploy()) as IRedistribution;

  await proportional.waitForDeployment();

  const quizMCFactory = new ethers.ContractFactory(
    QuizMCABI,
    QuizMCBytecode,
    poller,
  );

  const quizMC = (await quizMCFactory.deploy(
    arcoiris.target,
  )) as IRedistribution;

  await quizMC.waitForDeployment();

  return {
    poller,
    alice,
    bob,
    token,
    arcoiris,
    proportional,
    quizMC,
  };
};

var hardhatNode: ChildProcess;

export async function initInfra(): Promise<void> {
  hardhatNode = spawn("npx", ["hardhat", "node"]);

  await new Promise<void>(function (resolve) {
    setTimeout(() => resolve(), 5000);
  });

  return Promise.resolve();
}

export async function stopInfra(): Promise<void> {
  hardhatNode.kill();

  return Promise.resolve();
}
