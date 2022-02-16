/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers'
import { Provider } from '@ethersproject/providers'
import type { Multicall, MulticallInterface } from '../Multicall'

const _abi = [
    {
        inputs: [],
        name: 'getCurrentBlockTimestamp',
        outputs: [
            {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'addr',
                type: 'address'
            }
        ],
        name: 'getEthBalance',
        outputs: [
            {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'target',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'gasLimit',
                        type: 'uint256'
                    },
                    {
                        internalType: 'bytes',
                        name: 'callData',
                        type: 'bytes'
                    }
                ],
                internalType: 'struct AlgebraInterfaceMulticall.Call[]',
                name: 'calls',
                type: 'tuple[]'
            }
        ],
        name: 'multicall',
        outputs: [
            {
                internalType: 'uint256',
                name: 'blockNumber',
                type: 'uint256'
            },
            {
                components: [
                    {
                        internalType: 'bool',
                        name: 'success',
                        type: 'bool'
                    },
                    {
                        internalType: 'uint256',
                        name: 'gasUsed',
                        type: 'uint256'
                    },
                    {
                        internalType: 'bytes',
                        name: 'returnData',
                        type: 'bytes'
                    }
                ],
                internalType: 'struct AlgebraInterfaceMulticall.Result[]',
                name: 'returnData',
                type: 'tuple[]'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    }
]

export class Multicall__factory {
    static readonly abi = _abi

    static createInterface(): MulticallInterface {
        return new utils.Interface(_abi) as MulticallInterface
    }

    static connect(
        address: string,
        signerOrProvider: Signer | Provider
    ): Multicall {
        return new Contract(address, _abi, signerOrProvider) as Multicall
    }
}
