import { Plus } from 'react-feather'
import { useActiveWeb3React } from '../../hooks/web3'
import { useWalletModalToggle } from '../../state/application/hooks'
import { convertDateTime, getCountdownTime } from '../../utils/time'
import { getProgress } from '../../utils/getProgress'
import Loader from '../Loader'
import CurrencyLogo from '../CurrencyLogo'
import {
    Card,
    CardHeader,
    EventEndTime,
    EventProgress,
    EventProgressInner,
    LoadingShim,
    PoolsSymbols,
    RewardAmount,
    RewardSymbol,
    RewardWrapper,
    StakeButton,
    StakeDate,
    StakeInfo,
    Subtitle,
    TokenIcon,
    TokensIcons
} from './styled'
import { useMemo } from 'react'
import { convertLocalDate } from '../../utils/convertDate'

interface StakerEventCardProps {
    active?: boolean
    skeleton?: any
    now?: number
    refreshing?: boolean
    stakeHandler?: () => void
    event?: {
        pool?: any
        createdAtTimestamp?: string
        rewardToken?: any
        bonusRewardToken?: any
        reward?: number
        bonusReward?: number
        startTime?: number
        endTime?: number
        apr?: number
    };
    eternal?: boolean
}

export function StakerEventCard({
    active,
    skeleton,
    refreshing,
    stakeHandler,
    now,
    event: {
        pool,
        createdAtTimestamp,
        rewardToken,
        bonusRewardToken,
        reward,
        bonusReward,
        startTime,
        endTime,
        apr
    } = {},
    eternal
}: StakerEventCardProps) {
    const { account } = useActiveWeb3React()
    const toggleWalletModal = useWalletModalToggle()

    const _startTime = useMemo(() => {
        if (!startTime) return []

        const date = new Date(+startTime * 1000)

        return [convertLocalDate(date), convertDateTime(date)]
    }, [startTime])

    const _endTime = useMemo(() => {
        if (!endTime) return []

        const date = new Date(+endTime * 1000)

        return [convertLocalDate(date), convertDateTime(date)]
    }, [endTime])

    return skeleton ? (
        <Card skeleton>
            <CardHeader>
                <TokensIcons>
                    <TokenIcon skeleton />
                    <TokenIcon skeleton />
                </TokensIcons>
                <div>
                    <Subtitle skeleton />
                    <PoolsSymbols skeleton />
                </div>
            </CardHeader>
            <RewardWrapper skeleton style={{ marginBottom: '6px' }}>
                <TokenIcon skeleton />
                <div style={{ marginLeft: '1rem' }}>
                    <Subtitle skeleton />
                    <RewardSymbol skeleton />
                </div>
                <RewardAmount skeleton />
            </RewardWrapper>
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        left: 'calc(50% - 11px)',
                        top: '-15px',
                        backgroundColor: '#5aa7df',
                        borderRadius: '50%',
                        padding: '3px'
                    }}
                >
                    <Plus style={{ display: 'block' }} size={18} />
                </div>
            </div>
            <RewardWrapper skeleton>
                <TokenIcon skeleton />
                <div style={{ marginLeft: '1rem' }}>
                    <Subtitle skeleton />
                    <RewardSymbol skeleton />
                </div>
                <RewardAmount skeleton />
            </RewardWrapper>
            <StakeInfo active>
                <div>
                    <Subtitle skeleton />
                    <StakeDate skeleton />
                    <StakeDate skeleton />
                </div>
                <div>
                    <Subtitle skeleton />
                    <StakeDate skeleton />
                    <StakeDate skeleton />
                </div>
            </StakeInfo>
            {active ? (
                <>
                    <EventEndTime skeleton>
                        <span />
                    </EventEndTime>
                    <EventProgress skeleton />
                </>
            ) : (
                <StakeButton skeleton />
            )}
        </Card>
    ) : (
        <Card refreshing={refreshing}>
            {refreshing && (
                <LoadingShim>
                    <Loader size={'18px'} stroke={'white'} style={{ margin: 'auto' }} />
                </LoadingShim>
            )}
            <CardHeader>
                <TokensIcons>
                    <CurrencyLogo
                        currency={{ address: pool.token0.id, symbol: pool.token0.symbol }}
                        size={'35px'}
                    />
                    <CurrencyLogo
                        currency={{ address: pool.token1.id, symbol: pool.token1.symbol }}
                        size={'35px'}
                    />
                </TokensIcons>
                <div>
                    <Subtitle>POOL</Subtitle>
                    <PoolsSymbols>{`${pool.token0.symbol}/${pool.token1.symbol}`}</PoolsSymbols>
                </div>
            </CardHeader>
            <RewardWrapper style={{ marginBottom: '6px' }}>
                <CurrencyLogo
                    currency={{ address: rewardToken.id, symbol: rewardToken.symbol }}
                    size={'35px'}
                />
                <div style={{ marginLeft: '1rem' }}>
                    <Subtitle style={{ color: 'rgb(138, 190, 243)' }}>
                        {'Reward'}
                    </Subtitle>
                    <RewardSymbol>{rewardToken.symbol}</RewardSymbol>
                </div>
                {reward && (
                    <RewardAmount title={reward.toString()}>
                        {eternal ? (
                            <span></span>
                        ) : (
                            <span>{`${
                                ('' + reward).length <= 8
                                    ? reward
                                    : ('' + reward).slice(0, 6) + '..'
                            }`}</span>
                        )}
                    </RewardAmount>
                )}
            </RewardWrapper>
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        left: 'calc(50% - 11px)',
                        top: '-15px',
                        backgroundColor: 'rgb(19, 56, 93)',
                        borderRadius: '50%',
                        padding: '3px'
                    }}
                >
                    <Plus style={{ display: 'block' }} size={18} />
                </div>
            </div>
            {bonusReward > 0 && (
                <RewardWrapper>
                    <CurrencyLogo
                        currency={{ address: bonusRewardToken.id, symbol: bonusRewardToken.symbol }}
                        size={'35px'}
                    />
                    <div style={{ marginLeft: '1rem' }}>
                        <Subtitle style={{ color: 'rgb(138, 190, 243)' }}>
                            {'Bonus'}
                        </Subtitle>
                        <RewardSymbol>{bonusRewardToken.symbol}</RewardSymbol>
                    </div>
                    {bonusReward && (
                        <RewardAmount title={bonusReward.toString()}>
                            {eternal ? (
                                <span></span>
                            ) : (
                                <span>{`${
                                    ('' + bonusReward).length <= 8
                                        ? bonusReward
                                        : ('' + bonusReward).slice(0, 6) + '..'
                                }`}</span>
                            )}
                        </RewardAmount>
                    )}
                </RewardWrapper>
            )}
            {!eternal && (
                <StakeInfo active>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Subtitle>Start</Subtitle>
                        <span>
                            {startTime && _startTime[0]}
                        </span>
                        <span>
                    {startTime && _startTime[1]}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Subtitle>End</Subtitle>
                        <span>
                            {endTime && _endTime[0]}

                        </span>
                        <span>
                          {endTime && _endTime[1]}
                        </span>
                    </div>
                </StakeInfo>
            )}
            {!eternal && (
                <EventEndTime>
                    {active ? (
                        <span>{`ends in ${getCountdownTime(endTime, now)}`}</span>
                    ) : (
                        <span>{`starts in ${getCountdownTime(startTime, now)}`}</span>
                    )}
                </EventEndTime>
            )}
            {!eternal && (
                <EventProgress>
                    {active ?
                        <EventProgressInner progress={getProgress(startTime, endTime, now)} /> :
                        <EventProgressInner
                            progress={getProgress(Number(createdAtTimestamp), startTime, now)} />
                    }
                </EventProgress>
            )}
            {eternal && (
                <RewardWrapper style={{ justifyContent: 'space-between' }}>
                    <Subtitle style={{ fontSize: '14px', color: 'white', textTransform: 'none', lineHeight: '19px' }}>
                        {'Overall APR:'}
                    </Subtitle>
                    <RewardSymbol>{`${apr.toFixed(2)}%`}</RewardSymbol>
                </RewardWrapper>
            )}
            {account && !active ?
                <StakeButton
                    style={{ marginTop: eternal ? '0' : '10px' }}
                    onClick={stakeHandler}
                    skeleton={skeleton}
                > Farm </StakeButton>
                : !active &&
                <StakeButton
                    onClick={toggleWalletModal}
                    skeleton={skeleton}
                > Connect Wallet </StakeButton>
            }
        </Card>
    )
}
