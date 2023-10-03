import path from "path";
import {
  Connection,
  Connections,
  ethereumProviderPlugin,
} from "@polywrap/ethereum-provider-js";
import { ethers, Signer, Wallet } from "ethers";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import { ETH_ENS_IPFS_MODULE_CONSTANTS } from "@polywrap/cli-js";

import * as App from "./types/wrap";
import {
  CoreClientConfig,
  PolywrapClient,
  IWrapPackage,
} from "@polywrap/client-js";
import { PolywrapClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { runCli } from "@polywrap/cli-js";
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
  ERC721PresetMinterPauserAutoId,
  Arcoiris,
  IRedistribution,
  QuizMC
} from "arcoiris/typechain-types";

interface CustomizableConfig {
  signer?: Wallet;
  safeAddress?: string;
}
const connection = { networkNameOrChainId: "testnet", node: null };
export const chainId = 1337;

export function getClientConfig(
  customConfig?: CustomizableConfig
): CoreClientConfig {
  const wrapperPath: string = path.join(
    path.resolve(__dirname),
    "..",
    ".."
  );
  const wrapperUri = `fs/${wrapperPath}/build`;
  const envs: Record<string, Record<string, unknown>> = {
    "wrap://package/ipfs-resolver": {
      provider: ETH_ENS_IPFS_MODULE_CONSTANTS.ipfsProvider,
    },
  };

  if (customConfig && customConfig.safeAddress) {
    envs[wrapperUri] = {
      safeAddress: customConfig.safeAddress,
      connection,
    };
  }

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
              signer: customConfig?.signer,
            }),
          },
          defaultNetwork: "testnet",
        }),
      }) as IWrapPackage
    );
  }

  return config.build();
}

const defaults = {
  owners: [
    "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
    "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
  ],
  threshold: 1,
};
export const setupContractNetworks = async (
  client: PolywrapClient,
): Promise<
    {
        poller: Wallet,
        alice: Wallet,
        bob: Wallet,
        token: ERC721PresetMinterPauserAutoId,
        arcoiris: Arcoiris,
        proportional: IRedistribution,
        quizMC: QuizMC
    }
> => {
    const provider = new ethers.providers.JsonRpcProvider(
        ETH_ENS_IPFS_MODULE_CONSTANTS.ethereumProvider
    );

    const poller = new Wallet(
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
        provider
    );

    const alice = new Wallet(
        "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1",
        provider
    );

    const bob = new Wallet(
        "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
        provider
    );

    const tokenFactory = new ethers.ContractFactory(ERC721ABI, ERC721Bytecode, poller);

    const token = (await tokenFactory.deploy(
        "Ticket",
        "TICKT",
        "https://example.com"
    )) as ERC721PresetMinterPauserAutoId;

    await token.deployed();

    const arcoirisFactory = new ethers.ContractFactory(
        ArcoirisABI,
        ArcoirisBytecode,
        poller
    );

    const arcoiris = (await arcoirisFactory.deploy()) as Arcoiris;

    await arcoiris.deployed();

    const proportionalFactory = new ethers.ContractFactory(
        ProportionalABI,
        ProportionalBytecode,
        poller
    );

    const proportional = (await proportionalFactory.deploy()) as IRedistribution;

    await proportional.deployed();

    const quizMCFactory = new ethers.ContractFactory(
        QuizMCABI,
        QuizMCBytecode,
        poller
    );

    const quizMC = (await quizMCFactory.deploy(arcoiris.target)) as IRedistribution;

    await quizMC.deployed();

    return {
        poller,
        alice,
        bob,
        token,
        arcoiris,
        proportional,
        quizMC
    };
};

export async function initInfra(): Promise<void> {
  const { exitCode, stderr, stdout } = await runCli({
    args: ["infra", "up", "--verbose", "--modules", "eth-ens-ipfs"],
  });

  if (exitCode) {
    throw Error(
      `initInfra failed to start test environment.\nExit Code: ${exitCode}\nStdErr: ${stderr}\nStdOut: ${stdout}`
    );
  }

  await new Promise<void>(function (resolve) {
    setTimeout(() => resolve(), 5000);
  });

  return Promise.resolve();
}

export async function stopInfra(): Promise<void> {
  const { exitCode, stderr, stdout } = await runCli({
    args: ["infra", "down", "--verbose", "--modules", "eth-ens-ipfs"],
  });

  if (exitCode) {
    throw Error(
      `initInfra failed to stop test environment.\nExit Code: ${exitCode}\nStdErr: ${stderr}\nStdOut: ${stdout}`
    );
  }
  return Promise.resolve();
}
