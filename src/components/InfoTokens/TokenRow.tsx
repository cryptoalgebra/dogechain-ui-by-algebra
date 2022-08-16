import CurrencyLogo from "../CurrencyLogo";
import { Token } from "@uniswap/sdk-core";
import { SupportedChainId } from "../../constants/chains";
import { WrappedCurrency } from "../../models/types";
import { HideMedium, MediumOnly } from "../../theme";
import { Label } from "../Text";
import { RowFixed } from "../Row";
import HoverInlineText from "../HoverInlineText";
import { ExternalLink } from "react-feather";
import React from "react";

export const TokenRow = ({ address, symbol, name }: any) => (
    <a className={"link"} href={`https://explorer.dogechain.dog/address/${address}`} rel="noopener noreferrer" target="_blank">
        <span className={"currency-wrapper hover-op trans-op"}>
            <span className={"currency-wrapper__row"}>
                <CurrencyLogo currency={new Token(SupportedChainId.DOGECHAIN, address, 18, symbol) as WrappedCurrency} size={"20px"} />
            </span>
            <MediumOnly>
                <Label>{symbol}</Label>
            </MediumOnly>
            <HideMedium>
                <RowFixed>
                    <HoverInlineText text={name} maxCharacters={18} />
                    <Label ml="8px" color={"white"}>
                        ({symbol})
                    </Label>
                </RowFixed>
            </HideMedium>
            <ExternalLink size={16} color={"white"} />
        </span>
    </a>
);
