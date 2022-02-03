/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { FiniteFarming, FiniteFarmingInterface } from "../FiniteFarming";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IAlgebraPoolDeployer",
        name: "_deployer",
        type: "address",
      },
      {
        internalType: "contract INonfungiblePositionManager",
        name: "_nonfungiblePositionManager",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_maxIncentiveStartLeadTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_maxIncentiveDuration",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "incentiveId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "rewardAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "bonusRewardToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bonusReward",
        type: "uint256",
      },
    ],
    name: "FarmEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "incentiveId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
    ],
    name: "FarmStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IERC20Minimal",
        name: "rewardToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IERC20Minimal",
        name: "bonusRewardToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IAlgebraPool",
        name: "pool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "virtualPool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "IncentiveAttached",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IERC20Minimal",
        name: "rewardToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IERC20Minimal",
        name: "bonusRewardToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IAlgebraPool",
        name: "pool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "virtualPool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bonusReward",
        type: "uint256",
      },
    ],
    name: "IncentiveCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IERC20Minimal",
        name: "rewardToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IERC20Minimal",
        name: "bonusRewardToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IAlgebraPool",
        name: "pool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "virtualPool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "IncentiveDetached",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "incentiveMaker",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_incentiveMaker",
        type: "address",
      },
    ],
    name: "IncentiveMakerChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "rewardAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "RewardClaimed",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20Minimal",
            name: "rewardToken",
            type: "address",
          },
          {
            internalType: "contract IERC20Minimal",
            name: "bonusRewardToken",
            type: "address",
          },
          {
            internalType: "contract IAlgebraPool",
            name: "pool",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        internalType: "struct IIncentiveKey.IncentiveKey",
        name: "key",
        type: "tuple",
      },
    ],
    name: "attachIncentive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Minimal",
        name: "rewardToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountRequested",
        type: "uint256",
      },
    ],
    name: "claimReward",
    outputs: [
      {
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Minimal",
        name: "rewardToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountRequested",
        type: "uint256",
      },
    ],
    name: "claimRewardFrom",
    outputs: [
      {
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20Minimal",
            name: "rewardToken",
            type: "address",
          },
          {
            internalType: "contract IERC20Minimal",
            name: "bonusRewardToken",
            type: "address",
          },
          {
            internalType: "contract IAlgebraPool",
            name: "pool",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        internalType: "struct IIncentiveKey.IncentiveKey",
        name: "key",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "bonusReward",
        type: "uint256",
      },
    ],
    name: "createIncentive",
    outputs: [
      {
        internalType: "address",
        name: "virtualPool",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "deployer",
    outputs: [
      {
        internalType: "contract IAlgebraPoolDeployer",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20Minimal",
            name: "rewardToken",
            type: "address",
          },
          {
            internalType: "contract IERC20Minimal",
            name: "bonusRewardToken",
            type: "address",
          },
          {
            internalType: "contract IAlgebraPool",
            name: "pool",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        internalType: "struct IIncentiveKey.IncentiveKey",
        name: "key",
        type: "tuple",
      },
    ],
    name: "detachIncentive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20Minimal",
            name: "rewardToken",
            type: "address",
          },
          {
            internalType: "contract IERC20Minimal",
            name: "bonusRewardToken",
            type: "address",
          },
          {
            internalType: "contract IAlgebraPool",
            name: "pool",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        internalType: "struct IIncentiveKey.IncentiveKey",
        name: "key",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "enterFarming",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20Minimal",
            name: "rewardToken",
            type: "address",
          },
          {
            internalType: "contract IERC20Minimal",
            name: "bonusRewardToken",
            type: "address",
          },
          {
            internalType: "contract IAlgebraPool",
            name: "pool",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        internalType: "struct IIncentiveKey.IncentiveKey",
        name: "key",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "exitFarming",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "farmingCenter",
    outputs: [
      {
        internalType: "contract IFarmingCenter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "farms",
    outputs: [
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        internalType: "int24",
        name: "tickLower",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickUpper",
        type: "int24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20Minimal",
            name: "rewardToken",
            type: "address",
          },
          {
            internalType: "contract IERC20Minimal",
            name: "bonusRewardToken",
            type: "address",
          },
          {
            internalType: "contract IAlgebraPool",
            name: "pool",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        internalType: "struct IIncentiveKey.IncentiveKey",
        name: "key",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getRewardInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "bonusReward",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "incentives",
    outputs: [
      {
        internalType: "uint256",
        name: "totalReward",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "bonusReward",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "virtualPoolAddress",
        type: "address",
      },
      {
        internalType: "uint96",
        name: "numberOfFarms",
        type: "uint96",
      },
      {
        internalType: "bool",
        name: "isPoolCreated",
        type: "bool",
      },
      {
        internalType: "uint224",
        name: "totalLiquidity",
        type: "uint224",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxIncentiveDuration",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxIncentiveStartLeadTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "nonfungiblePositionManager",
    outputs: [
      {
        internalType: "contract INonfungiblePositionManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Minimal",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "rewards",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_farmingCenter",
        type: "address",
      },
    ],
    name: "setFarmingCenterAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_incentiveMaker",
        type: "address",
      },
    ],
    name: "setIncentiveMaker",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class FiniteFarming__factory {
  static readonly abi = _abi;
  static createInterface(): FiniteFarmingInterface {
    return new utils.Interface(_abi) as FiniteFarmingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FiniteFarming {
    return new Contract(address, _abi, signerOrProvider) as FiniteFarming;
  }
}