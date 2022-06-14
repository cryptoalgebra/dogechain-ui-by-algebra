import { Trans } from "@lingui/macro";
import { Currency } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { Divide } from "react-feather";

import "./index.scss";

interface ITokenRatio {
    currencyA: Currency | null | undefined;
    currencyB: Currency | null | undefined;
    token0Ratio: string;
    token1Ratio: string;
}

export function TokenRatio({ currencyA, currencyB, token0Ratio, token1Ratio }: ITokenRatio) {
    const isEmpty = useMemo(() => {
        return token0Ratio === "0" && token1Ratio === "0";
    }, [token0Ratio, token1Ratio]);

    return (
        <div className={"preset-ranges-wrapper pl-1 mxs_pl-0 mxs_mb-1 ms_pl-0 ms_mb-1"}>
            <div className="mb-1 f f-ac">
                <Divide style={{ display: "block", fill: "currentcolor" }} size={15} />
                <span className="ml-05">
                    <Trans>Token ratio</Trans>
                </span>
            </div>
            <div className="f full-h pos-r">
                <div className="token-ratio f ms_w-100" style={{ opacity: isEmpty ? "0.5" : "1" }}>
                    <div className="token-ratio__part full-h" style={{ width: `${token0Ratio}%`, background: "#707eff", borderRadius: +token0Ratio === 100 ? "8px" : "8px 0 0 8px" }}></div>
                    <div className="token-ratio__part full-h" style={{ width: `${token1Ratio}%`, background: "#ec92ff", borderRadius: +token1Ratio === 100 ? "8px" : "0 8px 8px 0" }}></div>
                </div>
            </div>
            <div className="mt-1" style={{ opacity: isEmpty ? 0.5 : "1" }}>
                <div className="f mb-1">
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#707eff" }}></div>
                    <div className="ml-05">{currencyA?.symbol}</div>
                    <div className="ml-a">{`${Number(token0Ratio).toPrecision(3)}%`}</div>
                </div>
                <div className="f">
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#ec92ff" }}></div>
                    <div className="ml-05">{currencyB?.symbol}</div>
                    <div className="ml-a">{`${isEmpty ? 0 : (100 - +token0Ratio).toPrecision(3)}%`}</div>
                </div>
            </div>
        </div>
    );
}