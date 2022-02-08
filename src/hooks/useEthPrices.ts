import { useBlocksFromTimestamps } from '../hooks/blocks'
import { useDeltaTimestamps } from '../utils/queries'
import { useEffect, useMemo, useState } from 'react'
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client'
import { useClients } from '../hooks/subgraph/useClients'
import { useActiveWeb3React } from './web3'

export interface EthPrices {
    current: number
    oneDay: number
    twoDay: number
    week: number
}

export const ETH_PRICES = gql`
  query prices($block24: Int!, $block48: Int!, $blockWeek: Int!) {
    current: bundles(first: 1, subgraphError: allow) {
      maticPriceUSD
    }
    oneDay: bundles(first: 1, block: { number: $block24 }, subgraphError: allow) {
      maticPriceUSD
    }
    twoDay: bundles(first: 1, block: { number: $block48 }, subgraphError: allow) {
      maticPriceUSD
    }
    oneWeek: bundles(first: 1, block: { number: $blockWeek }, subgraphError: allow) {
      maticPriceUSD
    }
  }
`

interface PricesResponse {
    current: {
        maticPriceUSD: string
    }[]
    oneDay: {
        maticPriceUSD: string
    }[]
    twoDay: {
        maticPriceUSD: string
    }[]
    oneWeek: {
        maticPriceUSD: string
    }[]
}

async function fetchEthPrices(
    blocks: [number, number, number],
    client: ApolloClient<NormalizedCacheObject>
): Promise<{ data: EthPrices | undefined; error: boolean }> {
    try {
        const { data, error } = await client.query<PricesResponse>({
            query: ETH_PRICES,
            variables: {
                block24: blocks[0],
                block48: blocks[1],
                blockWeek: blocks[2] ?? 1
            }
        })

        if (error) {
            return {
                error: true,
                data: undefined
            }
        } else if (data) {
            return {
                data: {
                    current: parseFloat(data.current[0].maticPriceUSD ?? 0),
                    oneDay: parseFloat(data.oneDay[0]?.maticPriceUSD ?? 0),
                    twoDay: parseFloat(data.twoDay[0]?.maticPriceUSD ?? 0),
                    week: parseFloat(data.oneWeek[0]?.maticPriceUSD ?? 0)
                },
                error: false
            }
        } else {
            return {
                data: undefined,
                error: true
            }
        }
    } catch (e) {
        console.log(e)
        return {
            data: undefined,
            error: true
        }
    }
}

/**
 * returns eth prices at current, 24h, 48h, and 1w intervals
 */
export function useEthPrices(): EthPrices | undefined {
    const [prices, setPrices] = useState<{ [network: string]: EthPrices | undefined }>()
    const [error, setError] = useState(false)
    const { dataClient } = useClients()

    const [t24, t48, tWeek] = useDeltaTimestamps()
    const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])

    // index on active network
    const { chainId } = useActiveWeb3React()
    const indexedPrices = prices?.[chainId]

    const formattedBlocks = useMemo(() => {
        if (blocks) {
            return blocks.reverse().map((b) => parseFloat(b.number))
        }
        return undefined
    }, [blocks])

    useEffect(() => {
        async function fetch() {
            const {
                data,
                error
            } = await fetchEthPrices(formattedBlocks as [number, number, number], dataClient)
            if (error || blockError) {
                setError(true)
            } else if (data) {
                setPrices({
                    [chainId]: data
                })
            }
        }

        if (!indexedPrices && !error && formattedBlocks) {
            fetch()
        }
    }, [error, prices, formattedBlocks, blockError, dataClient, indexedPrices, chainId])

    return prices?.[chainId]
}
