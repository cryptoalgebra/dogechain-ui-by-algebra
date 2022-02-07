import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useEffect, useState } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { useIncentiveSubgraph } from '../../hooks/useIncentiveSubgraph'
import { AlignJustify, Award } from 'react-feather'
import { useActiveWeb3React } from '../../hooks/web3'
import { StakingMenu } from '../../components/StakingMenu'
import { StakerMyRewards } from '../../components/StakerMyRewards'
import { StakerMyStakes } from '../../components/StakerMyStakes'
import { FutureEventsPage } from '../FutureEventsPage'
import { CurrentEventsPage } from '../CurrentEventsPage'
import { PageTitle } from '../../components/PageTitle'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Helmet } from 'react-helmet'
import EternalFarmsPage from '../EternalFarmsPage'
import {
    BodyWrapper,
    ConnectWalletButton,
    InnerWrapper,
    MainContentWrapper,
    MenuWrapper,
    MockScreen,
    PageWrapper
} from './styled'


export default function StakingPage() {
    const { account } = useActiveWeb3React()

    const {
        fetchRewards,
        fetchCurrentEvents,
        fetchFutureEvents,
        fetchTransferredPositions,
        fetchEternalFarms,
        fetchPositionsOnEternalFarmings
    } = useIncentiveSubgraph() || {}

    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const timeNow = setInterval(() => setNow(Date.now()), 1000)
        return () => {
            clearInterval(timeNow)
        }
    }, [])

    const { path } = useRouteMatch()

    const toggleWalletModal = useWalletModalToggle()

    return (
        <>
            <Helmet>
                <title>Algebra — Farming</title>
            </Helmet>
            <PageWrapper>
                <InnerWrapper gap='lg' justify='center'>
                    <InnerWrapper gap='lg' style={{ width: '100%', gridRowGap: '0' }}>
                        <MainContentWrapper>
                            <MenuWrapper>
                                <StakingMenu />
                            </MenuWrapper>
                            <BodyWrapper>
                                <Switch>
                                    <Route exact path={`${path}`}>
                                        <Redirect
                                            to={`${path}/${account ? 'farms' : 'infinite-farms'}`} />
                                    </Route>
                                    <Route exact path={`${path}/rewards`}>
                                        <Helmet>
                                            <title>Algebra — Farming • My rewards</title>
                                        </Helmet>
                                        <PageTitle
                                            title={'My rewards'}
                                            refreshHandler={() => (account ? fetchRewards?.fetchRewardsFn(true) : undefined)}
                                            isLoading={fetchRewards?.rewardsLoading}
                                        />
                                        {account ? (
                                            <StakerMyRewards
                                                data={fetchRewards?.rewardsResult}
                                                refreshing={fetchRewards?.rewardsLoading}
                                                fetchHandler={() => fetchRewards?.fetchRewardsFn(true)}
                                            />
                                        ) : (
                                            <MockScreen>
                                                <Award size={40} stroke={'white'} />
                                                <p>Connect your account to view rewards</p>
                                                <ConnectWalletButton onClick={toggleWalletModal}>Connect
                                                    to a wallet</ConnectWalletButton>
                                            </MockScreen>
                                        )}
                                    </Route>
                                    <Route exact path={`${path}/farms`}>
                                        <Helmet>
                                            <title>Algebra — Farming • My farms</title>
                                        </Helmet>
                                        <PageTitle
                                            title={'My farms'}
                                            refreshHandler={() =>
                                                account ? fetchTransferredPositions?.fetchTransferredPositionsFn(true) : undefined
                                            }
                                            isLoading={fetchTransferredPositions?.transferredPositionsLoading}
                                        />
                                        {account ? (
                                            <StakerMyStakes
                                                data={fetchTransferredPositions?.transferredPositions}
                                                refreshing={fetchTransferredPositions?.transferredPositionsLoading}
                                                fetchHandler={() => {
                                                    fetchTransferredPositions?.fetchTransferredPositionsFn(true)
                                                    // fetchPositionsOnEternalFarmings?.fetchPositionsOnEternalFarmingFn(true)
                                                }}
                                                now={now}
                                            />
                                        ) : (
                                            <MockScreen>
                                                <AlignJustify size={40}
                                                              stroke={'white'} />
                                                <p>Connect your account to view farms</p>
                                                <ConnectWalletButton onClick={toggleWalletModal}>Connect
                                                    to a wallet</ConnectWalletButton>
                                            </MockScreen>
                                        )}
                                    </Route>
                                    <Route exact path={`${path}/future-events`}>
                                        <Helmet>
                                            <title>Algebra — Farming • Future events</title>
                                        </Helmet>
                                        <PageTitle
                                            title={'Future events'}
                                            refreshHandler={() => fetchFutureEvents?.fetchFutureEventsFn(true)}
                                            isLoading={fetchFutureEvents?.futureEventsLoading}
                                        />
                                        <FutureEventsPage
                                            data={fetchFutureEvents?.futureEvents}
                                            refreshing={fetchFutureEvents?.futureEventsLoading}
                                            fetchHandler={() => fetchFutureEvents?.fetchFutureEventsFn(true)}
                                            now={now}
                                        />
                                    </Route>
                                    <Route exact path={`${path}/current-events`}>
                                        <Helmet>
                                            <title>Algebra — Farming • Current events</title>
                                        </Helmet>
                                        <PageTitle
                                            title={'Current events'}
                                            refreshHandler={() => fetchCurrentEvents?.fetchCurrentEventsFn(true)}
                                            isLoading={fetchCurrentEvents?.currentEventsLoading}
                                        />
                                        <CurrentEventsPage
                                            data={fetchCurrentEvents?.currentEvents}
                                            refreshing={fetchCurrentEvents?.currentEventsLoading}
                                            fetchHandler={() => fetchCurrentEvents?.fetchCurrentEventsFn(true)}
                                            now={now}
                                        />
                                    </Route>
                                    <Route exact path={`${path}/infinite-farms`}>
                                        <Helmet>
                                            <title>Algebra — Farming • Infinite farms</title>
                                        </Helmet>
                                        <PageTitle
                                            title={'Infinite farms'}
                                            refreshHandler={() => fetchCurrentEvents?.fetchCurrentEventsFn(true)}
                                            isLoading={fetchCurrentEvents?.currentEventsLoading}
                                        />
                                        <EternalFarmsPage
                                            data={fetchEternalFarms?.eternalFarms}
                                            refreshing={fetchEternalFarms?.eternalFarmsLoading}
                                            fetchHandler={() => fetchEternalFarms.fetchEternalFarmsFn(true)}
                                        />
                                    </Route>
                                </Switch>
                            </BodyWrapper>
                        </MainContentWrapper>
                    </InnerWrapper>
                </InnerWrapper>
            </PageWrapper>
            <SwitchLocaleLink />
        </>
    )
}
