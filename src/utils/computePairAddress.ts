import { getCreate2Address } from "@ethersproject/address"
import { pack, keccak256 } from '@ethersproject/solidity'
import { Token } from '@uniswap/sdk-core'

import { BigintIsh, Price, sqrt, CurrencyAmount } from '@uniswap/sdk-core'
import invariant from 'tiny-invariant'
import JSBI from 'jsbi'
import { V2_FACTORY_ADDRESSES, V3_MIGRATOR_ADDRESSES } from "../constants/addresses"

// import { InsufficientReservesError, InsufficientInputAmountError } from '../errors'

export const FACTORY_ADDRESS = V2_FACTORY_ADDRESSES[137]
export const SUSHI_FACTORY_ADDRESS = "0xc35dadb65012ec5796536bd9864ed8773abc74c4"

export const INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const FIVE = JSBI.BigInt(5)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

export const computePairAddress = ({
    factoryAddress,
    hash = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
    tokenA,
    tokenB
}: {
    factoryAddress: string
    tokenA: Token
    tokenB: Token
    hash?: string
}): string => {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

    return getCreate2Address(
        factoryAddress,
        keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]),
        hash
    )
}

export class Pair {
    public readonly liquidityToken: Token
    private readonly tokenAmounts: [CurrencyAmount<Token>, CurrencyAmount<Token>]

    public static getAddress(tokenA: Token, tokenB: Token, sushi?: boolean): string {
        return computePairAddress({ factoryAddress: sushi ? SUSHI_FACTORY_ADDRESS : FACTORY_ADDRESS, tokenA, tokenB, hash: sushi ? '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303' : '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' })
    }

    public constructor(currencyAmountA: CurrencyAmount<Token>, tokenAmountB: CurrencyAmount<Token>, sushi?: boolean) {
        const tokenAmounts = currencyAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
            ? [currencyAmountA, tokenAmountB]
            : [tokenAmountB, currencyAmountA]

        this.liquidityToken = new Token(
            tokenAmounts[0].currency.chainId,
            Pair.getAddress(tokenAmounts[0].currency, tokenAmounts[1].currency, sushi),
            18,
            'UNI-V2',
            'Uniswap V2'
        )

        this.tokenAmounts = tokenAmounts as [CurrencyAmount<Token>, CurrencyAmount<Token>]
    }

    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    public involvesToken(token: Token): boolean {
        return token.equals(this.token0) || token.equals(this.token1)
    }

    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    public get token0Price(): Price<Token, Token> {
        const result = this.tokenAmounts[1].divide(this.tokenAmounts[0])
        return new Price(this.token0, this.token1, result.denominator, result.numerator)
    }

    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    public get token1Price(): Price<Token, Token> {
        const result = this.tokenAmounts[0].divide(this.tokenAmounts[1])
        return new Price(this.token1, this.token0, result.denominator, result.numerator)
    }

    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    public priceOf(token: Token): Price<Token, Token> {
        invariant(this.involvesToken(token), 'TOKEN')
        return token.equals(this.token0) ? this.token0Price : this.token1Price
    }

    /**
     * Returns the chain ID of the tokens in the pair.
     */
    public get chainId(): number {
        return this.token0.chainId
    }

    public get token0(): Token {
        return this.tokenAmounts[0].currency
    }

    public get token1(): Token {
        return this.tokenAmounts[1].currency
    }

    public get reserve0(): CurrencyAmount<Token> {
        return this.tokenAmounts[0]
    }

    public get reserve1(): CurrencyAmount<Token> {
        return this.tokenAmounts[1]
    }

    public reserveOf(token: Token): CurrencyAmount<Token> {
        invariant(this.involvesToken(token), 'TOKEN')
        return token.equals(this.token0) ? this.reserve0 : this.reserve1
    }

    public getOutputAmount(inputAmount: CurrencyAmount<Token>): [CurrencyAmount<Token>, Pair] {
        invariant(this.involvesToken(inputAmount.currency), 'TOKEN')
        if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO)) {
            // throw new InsufficientReservesError()
            throw new Error()
        }
        const inputReserve = this.reserveOf(inputAmount.currency)
        const outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0)
        const inputAmountWithFee = JSBI.multiply(inputAmount.quotient, _997)
        const numerator = JSBI.multiply(inputAmountWithFee, outputReserve.quotient)
        const denominator = JSBI.add(JSBI.multiply(inputReserve.quotient, _1000), inputAmountWithFee)
        const outputAmount = CurrencyAmount.fromRawAmount(
            inputAmount.currency.equals(this.token0) ? this.token1 : this.token0,
            JSBI.divide(numerator, denominator)
        )
        if (JSBI.equal(outputAmount.quotient, ZERO)) {
            // throw new InsufficientInputAmountError()
            throw new Error()
        }
        return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))]
    }

    public getInputAmount(outputAmount: CurrencyAmount<Token>): [CurrencyAmount<Token>, Pair] {
        invariant(this.involvesToken(outputAmount.currency), 'TOKEN')
        if (
            JSBI.equal(this.reserve0.quotient, ZERO) ||
            JSBI.equal(this.reserve1.quotient, ZERO) ||
            JSBI.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient)
        ) {
            // throw new InsufficientReservesError()
            throw new Error()
        }

        const outputReserve = this.reserveOf(outputAmount.currency)
        const inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0)
        const numerator = JSBI.multiply(JSBI.multiply(inputReserve.quotient, outputAmount.quotient), _1000)
        const denominator = JSBI.multiply(JSBI.subtract(outputReserve.quotient, outputAmount.quotient), _997)
        const inputAmount = CurrencyAmount.fromRawAmount(
            outputAmount.currency.equals(this.token0) ? this.token1 : this.token0,
            JSBI.add(JSBI.divide(numerator, denominator), ONE)
        )
        return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))]
    }

    public getLiquidityMinted(
        totalSupply: CurrencyAmount<Token>,
        tokenAmountA: CurrencyAmount<Token>,
        tokenAmountB: CurrencyAmount<Token>
    ): CurrencyAmount<Token> {
        invariant(totalSupply.currency.equals(this.liquidityToken), 'LIQUIDITY')
        const tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
            ? [tokenAmountA, tokenAmountB]
            : [tokenAmountB, tokenAmountA]
        invariant(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1), 'TOKEN')

        let liquidity: JSBI
        if (JSBI.equal(totalSupply.quotient, ZERO)) {
            liquidity = JSBI.subtract(
                sqrt(JSBI.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)),
                MINIMUM_LIQUIDITY
            )
        } else {
            const amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].quotient, totalSupply.quotient), this.reserve0.quotient)
            const amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].quotient, totalSupply.quotient), this.reserve1.quotient)
            liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1
        }
        if (!JSBI.greaterThan(liquidity, ZERO)) {
            // throw new InsufficientInputAmountError()
            throw new Error()
        }
        return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity)
    }

    public getLiquidityValue(
        token: Token,
        totalSupply: CurrencyAmount<Token>,
        liquidity: CurrencyAmount<Token>,
        feeOn = false,
        kLast?: BigintIsh
    ): CurrencyAmount<Token> {
        invariant(this.involvesToken(token), 'TOKEN')
        invariant(totalSupply.currency.equals(this.liquidityToken), 'TOTAL_SUPPLY')
        invariant(liquidity.currency.equals(this.liquidityToken), 'LIQUIDITY')
        invariant(JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient), 'LIQUIDITY')

        let totalSupplyAdjusted: CurrencyAmount<Token>
        if (!feeOn) {
            totalSupplyAdjusted = totalSupply
        } else {
            invariant(!!kLast, 'K_LAST')
            const kLastParsed = JSBI.BigInt(kLast)
            if (!JSBI.equal(kLastParsed, ZERO)) {
                const rootK = sqrt(JSBI.multiply(this.reserve0.quotient, this.reserve1.quotient))
                const rootKLast = sqrt(kLastParsed)
                if (JSBI.greaterThan(rootK, rootKLast)) {
                    const numerator = JSBI.multiply(totalSupply.quotient, JSBI.subtract(rootK, rootKLast))
                    const denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast)
                    const feeLiquidity = JSBI.divide(numerator, denominator)
                    totalSupplyAdjusted = totalSupply.add(CurrencyAmount.fromRawAmount(this.liquidityToken, feeLiquidity))
                } else {
                    totalSupplyAdjusted = totalSupply
                }
            } else {
                totalSupplyAdjusted = totalSupply
            }
        }

        return CurrencyAmount.fromRawAmount(
            token,
            JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupplyAdjusted.quotient)
        )
    }
}