import { Trans } from '@lingui/macro'
import PositionList from 'components/PositionList'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useV3Positions } from 'hooks/useV3Positions'
import { useActiveWeb3React } from 'hooks/web3'
import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useWalletModalToggle } from 'state/application/hooks'
import { useUserHideClosedPositions } from 'state/user/hooks'
import { Helmet } from 'react-helmet'
import Loader from '../../components/Loader'
import FilterPanelItem from './FilterPanelItem'
import { PositionPool } from '../../models/interfaces'
import Card from '../../shared/components/Card/Card'
import AutoColumn from '../../shared/components/AutoColumn'
import { SwapPoolTabs } from '../../components/NavigationTabs'

export default function Pool() {
    const { account, chainId } = useActiveWeb3React()
    const toggleWalletModal = useWalletModalToggle()

    const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()
    const [hideFarmingPositions, setHideFarmingPositions] = useState(false)

    const { positions, loading: positionsLoading } = useV3Positions(account)

    const [openPositions, closedPositions] = positions?.reduce<[PositionPool[], PositionPool[]]>((acc, p) => {
        acc[p.liquidity?.isZero() ? 1 : 0].push(p)
        return acc
    }, [[], []]) ?? [[], []]

    const filters = [
        {
            title: 'Closed',
            method: setUserHideClosedPositions,
            checkValue: userHideClosedPositions
        },
        {
            title: 'Farming',
            method: setHideFarmingPositions,
            checkValue: hideFarmingPositions
        }
    ]

    const farmingPositions = useMemo(() => positions?.filter(el => el.onFarming), [positions, account])
    const inRangeWithOutFarmingPositions = useMemo(() => openPositions.filter(el => !el.onFarming), [openPositions])

    const filteredPositions = useMemo(() => [
        ...(hideFarmingPositions || !farmingPositions ? [] : farmingPositions),
        ...inRangeWithOutFarmingPositions,
        ...(userHideClosedPositions ? [] : closedPositions)
    ], [inRangeWithOutFarmingPositions, userHideClosedPositions, hideFarmingPositions])

    const showConnectAWallet = Boolean(!account)

    let chainSymbol

    if (chainId === 137) {
        chainSymbol = 'MATIC'
    }

    return (
        <>
            <Helmet>
                <title>Algebra — Pool</title>
            </Helmet>
            <Card isDark classes={'br-24 ph-2 pv-1'}>
                <SwapPoolTabs active={'pool'} />
                <AutoColumn gap='1'>
                    <div className={'flex-s-between'}>
                        <span className={'fs-125'}>
                            <Trans>Pools Overview</Trans>
                        </span>
                        <div className={'flex-s-between'}>
                            <NavLink
                                className={'btn primary p-05 br-8 mr-1'}
                                id='join-pool-button'
                                to={`/migrate`}
                            >
                                <Trans>Migrate Pool</Trans>
                            </NavLink>
                            <NavLink
                                className={'btn primary p-05 br-8'}
                                id='join-pool-button'
                                to={`/add/${chainSymbol}`}
                            >
                                + <Trans>New Position</Trans>
                            </NavLink>
                        </div>
                    </div>
                    <div className={'f mb-05 rg-2 cg-2'}>
                        {filters.map((item, key) =>
                            <FilterPanelItem
                                item={item}
                                key={key}
                            />)}
                    </div>
                    <main className={'f c f-ac'}>
                        {positionsLoading ? (
                            <Loader style={{ margin: 'auto' }} stroke='white' size={'2rem'} />
                        ) : filteredPositions && filteredPositions.length > 0 ? (
                            <PositionList positions={filteredPositions} />
                        ) : (
                            <div className={'f c f-ac f-jc h-400 w-100 maw-300'}>
                                <Trans>You do not have any liquidity positions.</Trans>
                                {showConnectAWallet && (
                                    <button className={'btn primary pv-05 ph-1 mt-1 w-100'} onClick={toggleWalletModal}>
                                        <Trans>Connect Wallet</Trans>
                                    </button>
                                )}
                            </div>
                        )}
                    </main>
                </AutoColumn>
            </Card>
            <SwitchLocaleLink />
        </>
    )
}
