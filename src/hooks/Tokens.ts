import { parseBytes32String } from '@ethersproject/strings'
import { Currency, Token } from '@uniswap/sdk-core'
import { arrayify } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { createTokenFilterFunction } from '../components/SearchModal/filtering'
import { ExtendedEther, WMATIC_EXTENDED } from '../constants/tokens'
import { TokenAddressMap, useAllLists, useCombinedActiveList, useInactiveListUrls } from '../state/lists/hooks'
import { WrappedTokenInfo } from '../state/lists/wrappedTokenInfo'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { useUserAddedTokens } from '../state/user/hooks'
import { isAddress } from '../utils'

import { useActiveWeb3React } from './web3'
import { useBytes32TokenContract, useTokenContract } from './useContract'

const DEFAULT_TOKEN_LIST: any = {
    ['0xb7ddc6414bf4f5515b52d8bdd69973ae205ff101']: {
        name: 'WDOGE',
        decimals: 18,
        symbol: 'WDOGE'
    },
    ['0xb44a9b6905af7c801311e8f4e76932ee959c663c']: {
        name: 'Ether',
        decimals: 18,
        symbol: 'ETH'
    },
    ['0x765277eebeca2e31912c9946eae1021199b39c61']: {
        name: 'USDC',
        decimals: 6,
        symbol: 'USDC'
    },
    ['0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d']: {
        name: 'USDT',
        decimals: 6,
        symbol: 'USDT'
    },
    ['0xfa9343c3897324496a05fc75abed6bac29f8a40f']: {
        name: 'Wrapped Bitcoin',
        decimals: 18,
        symbol: 'WBTC'
    },
    ['0x582daef1f36d6009f64b74519cfd612a8467be18']: {
        name: 'Doge Dragon',
        decimals: 18,
        symbol: 'DD'
    },
    ['0xb12c13e66ade1f72f71834f2fc5082db8c091358']: {
        name: 'QuickSwap',
        decimals: 18,
        symbol: 'QUICK',
    },
    ['0xdc42728b0ea910349ed3c6e1c9dc06b5fb591f98']: {
        name: 'Matic',
        decimals: 18,
        symbol: 'MATIC',
    },
    ['0x7b4328c127b85369d9f82ca0503b000d09cf9180']: {
        name: 'Dogechain Token',
        decimals: 18,
        symbol: 'DC'
    },
    ['0xf480f38c366daac4305dc484b2ad7a496ff00cea']: {
        name: 'Dogira',
        decimals: 9,
        symbol: 'DOGIRA'
    },
    ['0x91cd28e57b92e34124c4540ee376c581d188b53e']: {
        name: 'DCGod',
        decimals: 18,
        symbol: 'DCGOD'
    },
    ['0xb84df10966a5d7e1ab46d9276f55d57bd336afc7']: {
        name: 'Mai Stablecoin',
        decimals: 18,
        symbol: 'MAI'
    }
}


// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap, includeUserAdded: boolean): { [address: string]: Token } {
    const { chainId } = useActiveWeb3React()
    const userAddedTokens = useUserAddedTokens()

    return useMemo(() => {
        if (!chainId) return {}

        // reduce to just tokens
        const mapWithoutUrls = Object.keys(tokenMap[chainId] ?? {}).reduce<{ [address: string]: Token }>(
            (newMap, address) => {
                newMap[address] = tokenMap[chainId][address].token
                return newMap
            },
            {}
        )

        if (includeUserAdded) {
            return (
                userAddedTokens
                    // reduce into all ALL_TOKENS filtered by the current chain
                    .reduce<{ [address: string]: Token }>(
                        (tokenMap, token) => {
                            tokenMap[token.address] = token
                            return tokenMap
                        },
                        // must make a copy because reduce modifies the map, and we do not
                        // want to make a copy in every iteration
                        { ...mapWithoutUrls }
                    )
            )
        }

        return mapWithoutUrls
    }, [chainId, userAddedTokens, tokenMap, includeUserAdded])
}

export function useAllTokens(): { [address: string]: Token } {
    const allTokens = useCombinedActiveList()
    return useTokensFromMap(allTokens, true)
}

export function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
    const lists = useAllLists()
    const inactiveUrls = useInactiveListUrls()
    const { chainId } = useActiveWeb3React()
    const activeTokens = useAllTokens()

    return useMemo(() => {
        if (!search || search.trim().length === 0) return []
        const tokenFilter = createTokenFilterFunction(search)
        const result: WrappedTokenInfo[] = []
        const addressSet: { [address: string]: true } = {}
        for (const url of inactiveUrls) {
            const list = lists[url].current
            if (!list) continue
            for (const tokenInfo of list.tokens) {
                if (tokenInfo.chainId === chainId && tokenFilter(tokenInfo)) {
                    const wrapped: WrappedTokenInfo = new WrappedTokenInfo(tokenInfo, list)
                    if (!(wrapped.address in activeTokens) && !addressSet[wrapped.address]) {
                        addressSet[wrapped.address] = true
                        result.push(wrapped)
                        if (result.length >= minResults) return result
                    }
                }
            }
        }
        return result
    }, [activeTokens, chainId, inactiveUrls, lists, minResults, search])
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
    const activeTokens = useAllTokens()

    if (!activeTokens || !token) {
        return false
    }

    return !!activeTokens[token.address]
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
    const userAddedTokens = useUserAddedTokens()

    if (!currency) {
        return false
    }

    return !!userAddedTokens.find((token) => currency.equals(token))
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
    return str && str.length > 0
        ? str
        : // need to check for proper bytes string and valid terminator
        bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
            ? parseBytes32String(bytes32)
            : defaultValue
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
    const { chainId } = useActiveWeb3React()
    const tokens = useAllTokens()

    const address = isAddress(tokenAddress)
    const _lowkeyAddress = useMemo(() => {
        if (!address) return

        return address.toLowerCase()

    }, [tokenAddress, address])

    const tokenContract = useTokenContract(address ? address : undefined, false)
    const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false)
    const token: Token | undefined = address ? tokens[address] : undefined

    const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
    const tokenNameBytes32 = useSingleCallResult(
        token ? undefined : tokenContractBytes32,
        'name',
        undefined,
        NEVER_RELOAD
    )

    const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)
    const symbolBytes32 = useSingleCallResult(token ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)

    const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

    return useMemo(() => {
        if (token) return token
        if (!chainId || !address || !_lowkeyAddress) return undefined
        if (_lowkeyAddress in DEFAULT_TOKEN_LIST) return new Token(
            chainId,
            address,
            DEFAULT_TOKEN_LIST[_lowkeyAddress].decimals,
            DEFAULT_TOKEN_LIST[_lowkeyAddress].symbol,
            DEFAULT_TOKEN_LIST[_lowkeyAddress].name
        )
        if (decimals.loading || symbol.loading || tokenName.loading) return null
        if (decimals.result) {
            return new Token(
                chainId,
                address,
                decimals.result[0],
                parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
                parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token')
            )
        }
        return undefined
    }, [
        address,
        chainId,
        decimals.loading,
        decimals.result,
        symbol.loading,
        symbol.result,
        symbolBytes32.result,
        token,
        tokenName.loading,
        tokenName.result,
        tokenNameBytes32.result
    ])
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
    const { chainId } = useActiveWeb3React()
    let isETH
    if (chainId === 2000) {
        isETH = currencyId?.toUpperCase() === 'WDOGE'
    }

    const token = useToken(isETH ? undefined : currencyId)
    const extendedEther = useMemo(() => (chainId ? ExtendedEther.onChain(chainId) : undefined), [chainId])
    const weth = chainId ? WMATIC_EXTENDED[chainId] : undefined
    if (weth?.address?.toLowerCase() === currencyId?.toLowerCase()) return weth
    return isETH ? extendedEther : token
}
