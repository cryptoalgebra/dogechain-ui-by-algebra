import React from 'react'
import { NFTPositionIcon } from './styled'
import { IsActive } from './IsActive'
import CurrencyLogo from '../CurrencyLogo'
import { Token } from '@uniswap/sdk-core'
import { WrappedCurrency } from '../../models/types'
import Loader from '../Loader'
import { ChevronsUp, Send } from 'react-feather'
import { Deposit, UnstakingInterface } from '../../models/interfaces'
import { t } from '@lingui/macro'

interface PositionHeaderProps {
    el: Deposit
    unstaking: UnstakingInterface
    setSendModal: any
    setUnstaking: any
    withdrawHandler: any
}

export default function PositionHeader({ el, unstaking, setUnstaking, withdrawHandler, setSendModal }: PositionHeaderProps) {
    return (
        <div className={'my-stakes__position-card__header flex-s-between mb-1 br-8 p-1'}>
            <div className={'my-stakes__position-card__header__row'}>
                <div className={'f f-ac '}>
                    <NFTPositionIcon name={el.id}>
                        <span>{el.id}</span>
                    </NFTPositionIcon>
                    <div className={'ml-05'}>
                        <IsActive el={el} />
                        <a className={'c-w fs-075'} href={`https://app.algebra.finance/#/pool/${+el.id}?onFarming=true`} rel='noopener noreferrer' target='_blank'>
                            View position
                        </a>
                    </div>
                </div>
                <div className={'f f-ac ml-2 mxs_ml-0 mxs_mv-1'}>
                    <CurrencyLogo currency={new Token(137, el.token0, 18, el.pool.token0.symbol) as WrappedCurrency} size={'35px'} />
                    <CurrencyLogo currency={new Token(137, el.token1, 18, el.pool.token1.symbol) as WrappedCurrency} size={'35px'} style={{ marginLeft: '-1rem' }} />
                    <div className={'ml-05'}>
                        <div className={'b'}>Pool</div>
                        <div>{`${el.pool.token0.symbol} / ${el.pool.token1.symbol}`}</div>
                    </div>
                </div>
            </div>
            <div className={'my-stakes__position-card__header__row'}>
                {!el.incentive && !el.eternalFarming && (
                    <button
                        className={'btn f f-ac c-p b pv-025 mxs_mv-05'}
                        disabled={unstaking.id === el.id && unstaking.state !== 'done'}
                        onClick={() => {
                            setUnstaking({ id: el.id, state: 'pending' })
                            withdrawHandler(el.id)
                        }}
                    >
                        {unstaking && unstaking.id === el.id && unstaking.state !== 'done' ? (
                            <>
                                <Loader size={'1rem'} stroke={'var(--primary)'} style={{ margin: 'auto' }} />
                                <span className={'ml-05'}>Withdrawing</span>
                            </>
                        ) : (
                            <>
                                <ChevronsUp color={'var(--primary)'} size={'1rem'} />
                                <span className={'ml-05'}>{t`Withdraw`}</span>
                            </>
                        )}
                    </button>
                )}
                <button className={'btn f f-ac c-p b pv-025 ml-05 mxs_ml-0 mxs_f-jc'} onClick={() => setSendModal(el.L2tokenId)}>
                    <Send color={'var(--primary)'} size={'1rem'} />
                    <span className={'ml-05 c-p'}>Send</span>
                </button>
            </div>
        </div>
    )
};