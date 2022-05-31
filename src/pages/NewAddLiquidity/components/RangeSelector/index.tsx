import { Price, Token, Currency } from "@uniswap/sdk-core";
import Input from "components/NumericalInput";
import { USDC_POLYGON } from "constants/tokens";
import { useBestV3TradeExactIn } from "hooks/useBestV3Trade";
import { useUSDCValue } from "hooks/useUSDCPrice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bound } from "state/mint/v3/actions";
import { useInitialTokenPrice, useInitialUSDPrices } from "state/mint/v3/hooks";
import { tryParsePrice } from "state/mint/v3/utils";
import { tryParseAmount } from "state/swap/hooks";
import { PriceFormats } from "../PriceFomatToggler";

import "./index.scss";

interface IRangeSelector {
    priceLower: Price<Token, Token> | undefined;
    priceUpper: Price<Token, Token> | undefined;
    onLeftRangeInput: (typedValue: string) => void;
    onRightRangeInput: (typedValue: string) => void;
    getDecrementLower: () => string;
    getIncrementLower: () => string;
    getDecrementUpper: () => string;
    getIncrementUpper: () => string;
    currencyA: Currency | null | undefined;
    currencyB: Currency | null | undefined;
    feeAmount: number;
    ticksAtLimit: { [bound in Bound]?: boolean | undefined };
    initial: boolean;
    disabled: boolean;
    price: Price<Token, Token> | undefined;
    invertPrice: boolean;
    isBeforePrice: boolean;
    isAfterPrice: boolean;
    priceFormat: PriceFormats;
}

interface IRangePart {
    value: string;
    onUserInput: (value: string) => void;
    decrement: () => string;
    increment: () => string;
    decrementDisabled?: boolean;
    incrementDisabled?: boolean;
    // feeAmount?: FeeAmount;
    label?: string;
    width?: string;
    locked?: boolean; // disable input
    // title: ReactNode;
    tokenA: Currency | undefined;
    tokenB: Currency | undefined;
    initial: boolean;
    disabled: boolean;
    // style?: CSSProperties;
    title: string;
    priceFormat: PriceFormats;
}

export function RangeSelector({
    priceLower,
    priceUpper,
    onLeftRangeInput,
    onRightRangeInput,
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    currencyA,
    currencyB,
    feeAmount,
    ticksAtLimit,
    initial,
    disabled,
    invertPrice,
    price,
    isBeforePrice,
    isAfterPrice,
    priceFormat,
}: IRangeSelector) {
    const tokenA = (currencyA ?? undefined)?.wrapped;
    const tokenB = (currencyB ?? undefined)?.wrapped;

    const isUSD = useMemo(() => priceFormat === PriceFormats.USD, [priceFormat]);
    const currentPriceInUSD = useUSDCValue(
        tryParseAmount(price ? (invertPrice ? Number(price.invert().toSignificant(5)).toFixed(5) : Number(price.toSignificant(5)).toFixed(5)) : undefined, currencyB ?? undefined)
    );

    const initialUSDPrices = useInitialUSDPrices();
    const initialTokenPrice = useInitialTokenPrice();

    const isSorted = useMemo(() => {
        return tokenA && tokenB && tokenA.sortsBefore(tokenB);
    }, [tokenA, tokenB]);

    const leftPrice = useMemo(() => {
        return isSorted ? priceLower : priceUpper?.invert();
    }, [isSorted, priceLower, priceUpper]);

    const rightPrice = useMemo(() => {
        return isSorted ? priceUpper : priceLower?.invert();
    }, [isSorted, priceUpper, priceLower]);

    const currentPrice = useMemo(() => {
        if (!price) return;

        const isInitialInUSD = Boolean(initialUSDPrices.CURRENCY_A && initialUSDPrices.CURRENCY_B);

        let _price;

        if (!isUSD) {
            _price = isUSD && currentPriceInUSD ? currentPriceInUSD?.toSignificant(5) : invertPrice ? price.invert().toSignificant(5) : price.toSignificant(5);
        } else {
            if (isInitialInUSD) {
                _price = +initialUSDPrices.CURRENCY_A;
            } else if (currentPriceInUSD) {
                _price = currentPriceInUSD.toSignificant(5);
            }
        }

        if (Number(_price) <= 0.0001) {
            return `< ${isUSD && (currentPriceInUSD || isInitialInUSD) ? "$ " : ""}0.0001${isUSD && (currentPriceInUSD || isInitialInUSD) ? "" : ` ${currencyB?.symbol}`}`;
        } else {
            return `${isUSD && (currentPriceInUSD || isInitialInUSD) ? "$ " : ""}${Number(_price).toFixed(5)}${isUSD && (currentPriceInUSD || isInitialInUSD) ? "" : ` ${currencyB?.symbol}`}`;
        }
    }, [price, isUSD, initialUSDPrices, initialTokenPrice, currentPriceInUSD]);

    return (
        <div className="f f-jb">
            <div className={`min-price`} style={{ order: isAfterPrice ? 2 : 1 }}>
                <RangePart
                    value={ticksAtLimit[Bound.LOWER] ? "0" : leftPrice?.toSignificant(5) ?? ""}
                    onUserInput={onLeftRangeInput}
                    width="100%"
                    decrement={isSorted ? getDecrementLower : getIncrementUpper}
                    increment={isSorted ? getIncrementLower : getDecrementUpper}
                    decrementDisabled={ticksAtLimit[Bound.LOWER]}
                    incrementDisabled={ticksAtLimit[Bound.LOWER]}
                    label={leftPrice ? `${currencyB?.symbol}` : "-"}
                    tokenA={currencyA ?? undefined}
                    tokenB={currencyB ?? undefined}
                    initial={initial}
                    disabled={disabled}
                    title={"Min price"}
                    priceFormat={priceFormat}
                />
            </div>
            {price && (
                <div className="current-price f c f-ac" style={{ order: isAfterPrice ? 1 : isBeforePrice ? 3 : 2 }}>
                    <div className="mb-05" style={{ whiteSpace: "nowrap" }}>
                        {initial ? `Initial ${currencyA?.symbol} to ${isUSD ? "USD" : currencyB?.symbol} price` : `Current ${currencyA?.symbol} to ${isUSD ? "USD" : currencyB?.symbol} price`}
                    </div>
                    <div className="current-price-tip ta-c">{`${currentPrice || "Loading..."}`}</div>
                </div>
            )}
            <div className="max-price" style={{ order: isBeforePrice ? 2 : 3 }}>
                <RangePart
                    value={ticksAtLimit[Bound.UPPER] ? "∞" : rightPrice?.toSignificant(5) ?? ""}
                    onUserInput={onRightRangeInput}
                    decrement={isSorted ? getDecrementUpper : getIncrementLower}
                    increment={isSorted ? getIncrementUpper : getDecrementLower}
                    incrementDisabled={ticksAtLimit[Bound.UPPER]}
                    decrementDisabled={ticksAtLimit[Bound.UPPER]}
                    label={rightPrice ? `${currencyB?.symbol}` : "-"}
                    tokenA={currencyA ?? undefined}
                    tokenB={currencyB ?? undefined}
                    initial={initial}
                    disabled={disabled}
                    title={"Max price"}
                    priceFormat={priceFormat}
                />
            </div>
        </div>
    );
}

function RangePart({
    value,
    decrement,
    increment,
    decrementDisabled = false,
    tokenA,
    tokenB,
    incrementDisabled = false,
    width,
    locked,
    onUserInput,
    initial,
    disabled,
    title,
    priceFormat,
}: IRangePart) {
    // let user type value and only update parent value on blur
    const [localValue, setLocalValue] = useState("");
    const [useLocalValue, setUseLocalValue] = useState(false);

    const isUSD = useMemo(() => {
        return priceFormat === PriceFormats.USD;
    }, [priceFormat]);

    const valueUSD = useUSDCValue(tryParseAmount(value === "∞" || value === "0" ? undefined : Number(value).toFixed(5), tokenB));
    const tokenValue = useBestV3TradeExactIn(tryParseAmount("1", USDC_POLYGON), tokenB);

    // animation if parent value updates local value
    const handleOnFocus = () => {
        setUseLocalValue(true);
    };

    const handleOnBlur = useCallback(() => {
        setUseLocalValue(false);
    }, [localValue, onUserInput]);

    // for button clicks
    const handleDecrement = useCallback(() => {
        setUseLocalValue(false);
        onUserInput(decrement());
    }, [decrement, onUserInput]);

    const handleIncrement = useCallback(() => {
        setUseLocalValue(false);
        onUserInput(increment());
    }, [increment, onUserInput]);

    const handleInput = useCallback(
        (val) => {
            setLocalValue(val.trim());
            if (isUSD && valueUSD && tokenValue && tokenValue.trade) {
                onUserInput(String(val.trim() * +tokenValue.trade.outputAmount.toSignificant(5)));
            } else if (!isUSD) {
                onUserInput(val.trim());
            }
        },
        [onUserInput, valueUSD, tokenValue, isUSD]
    );

    useEffect(() => {
        if (localValue !== value && !useLocalValue) {
            setTimeout(() => {
                if (isUSD && valueUSD) {
                    setLocalValue(valueUSD.toSignificant(5)); // reset local value to match parent
                } else {
                    setLocalValue(value);
                }
            }, 0);
        }
    }, [localValue, useLocalValue, value, isUSD, valueUSD]);

    useEffect(() => {
        if (value && isUSD && valueUSD) {
            setLocalValue(valueUSD.toSignificant(5));
        }
    }, [isUSD, valueUSD]);

    return (
        <div>
            <div className="mb-05 f f-ac">
                <div>{title}</div>
                <div className="ml-a">
                    <button onClick={handleIncrement} disabled={incrementDisabled || disabled} className="range-input__btn">
                        +
                    </button>
                    <button onClick={handleDecrement} disabled={decrementDisabled || disabled} className="range-input__btn">
                        -
                    </button>
                </div>
            </div>
            <div className="f pos-r f-ac">
                {isUSD && valueUSD && (
                    <label htmlFor={title} className="range-input__usd">
                        $
                    </label>
                )}
                <Input
                    value={localValue}
                    id={title}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    className={`range-input ${isUSD && valueUSD ? "is-usd" : ""}`}
                    disabled={disabled || locked}
                    onUserInput={handleInput}
                    placeholder="0.00"
                />
            </div>
        </div>
    );
}
