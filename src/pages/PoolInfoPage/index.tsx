import { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components/macro'
import FeeChartRangeInput from '../../components/FeeChartRangeInput'
import PoolInfoChartToolbar from '../../components/PoolInfoChartToolbar'
import { PoolInfoHeader } from '../../components/PoolInfoHeader'
import { useInfoSubgraph } from '../../hooks/subgraph/useInfoSubgraph'
import { useIncentiveSubgraph } from '../../hooks/useIncentiveSubgraph'
import { useInfoPoolChart } from '../../hooks/useInfoPoolChart'
import { usePoolDynamicFee } from '../../hooks/usePoolDynamicFee'
import { usePool } from '../../hooks/usePools'
import { useActiveWeb3React } from '../../hooks/web3'
import DensityChart from '../../components/DensityChart'

import dayjs from 'dayjs'
import Loader from '../../components/Loader'
import { useInfoTickData } from '../../hooks/subgraph/useInfoTickData'
import LiquidityBarChart from '../../components/LiquidityBarChart'

const Wrapper = styled.div`
  min-width: 915px;
  max-width: 995px;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  // padding-bottom: 10rem;
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: unset;
    width: 100%;
  `}
`
const BodyWrapper = styled.div`
  display: flex;
  // height: 550px;
  width: 100%;
`
const ChartWrapper = styled.div`
  width: 100%;
`
const LoaderMock = styled.div`
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export enum ChartType {
  VOLUME,
  TVL,
  FEES,
  LIQUIDITY,
}

export enum ChartSpan {
  DAY,
  WEEK,
  MONTH,
}

export default function PoolInfoPage({
  match: {
    params: { id },
  },
  history,
}: RouteComponentProps<{ id?: string }>) {
  const { chainId } = useActiveWeb3React()

  const {
    fetchPool: { fetchPoolFn, poolLoading, poolResult },
  } = useInfoPoolChart()

  const {
    fetchChartFeesData: { feesResult, feesLoading, fetchFeePoolFn },
    fetchChartPoolData: { chartPoolData, chartPoolDataLoading, fetchChartPoolDataFn },
  } = useInfoSubgraph()

  const {
    fetchTicksSurroundingPrice: { ticksResult, ticksLoading, fetchTicksSurroundingPriceFn },
  } = useInfoTickData()

  const [span, setSpan] = useState(ChartSpan.DAY)
  const [type, setType] = useState(ChartType.VOLUME)

  const startTimestamp = useMemo(() => {
    const day = dayjs()

    switch (span) {
      case ChartSpan.DAY:
        return day.subtract(1, 'day').unix()
      case ChartSpan.WEEK:
        return day.subtract(7, 'day').unix()
      case ChartSpan.MONTH:
        return day.subtract(1, 'month').unix()
    }
  }, [span])

  const chartTypes = [
    {
      type: ChartType.VOLUME,
      title: 'Volume',
    },
    {
      type: ChartType.TVL,
      title: 'TVL',
    },
    {
      type: ChartType.FEES,
      title: 'Pool fee',
    },
    {
      type: ChartType.LIQUIDITY,
      title: 'Liquidity',
    },
  ]

  const chartSpans = [
    {
      type: ChartSpan.DAY,
      title: 'Day',
    },
    {
      type: ChartSpan.WEEK,
      title: 'Week',
    },
    {
      type: ChartSpan.MONTH,
      title: 'Month',
    },
  ]

  useEffect(() => {
    if (type === ChartType.FEES) {
      fetchFeePoolFn(id, startTimestamp, Math.floor(new Date().getTime() / 1000))
    } else if (type === ChartType.LIQUIDITY) {
      fetchTicksSurroundingPriceFn(id)
    } else {
      fetchChartPoolDataFn(id, startTimestamp, Math.floor(new Date().getTime() / 1000))
    }
  }, [span, type])

  useEffect(() => {
    if (!id) return
    fetchPoolFn(id)
  }, [id])

  const data = useMemo(() => {
    if (type === ChartType.FEES) {
      return feesResult
    } else if (type === ChartType.LIQUIDITY) {
      return ticksResult
    } else {
      return chartPoolData
    }
  }, [feesResult, chartPoolData, ticksResult])

  const refreshing = useMemo(() => {
    return feesLoading || chartPoolDataLoading || ticksLoading
  }, [feesLoading, chartPoolDataLoading, ticksLoading])

  return (
    <Wrapper>
      {poolResult ? (
        <>
          <PoolInfoHeader token0={poolResult.token0.id} token1={poolResult.token1.id} fee={poolResult.fee} />
          <BodyWrapper>
            <ChartWrapper>
              <PoolInfoChartToolbar
                chartSpans={chartSpans}
                chartTypes={chartTypes}
                setType={setType}
                span={span}
                type={type}
                setSpan={setSpan}
              />
              {type === ChartType.LIQUIDITY ? (
                // <DensityChart address={id} />
                <LiquidityBarChart
                  data={data || undefined}
                  token0={poolResult.token0.symbol}
                  token1={poolResult.token1.symbol}
                  refreshing={refreshing}
                ></LiquidityBarChart>
              ) : (
                <FeeChartRangeInput
                  fetchedData={data || undefined}
                  refreshing={refreshing}
                  id={id}
                  span={span}
                  type={type}
                />
              )}
            </ChartWrapper>
          </BodyWrapper>
        </>
      ) : (
        <LoaderMock>
          <Loader stroke={'white'} size={'30px'} />
        </LoaderMock>
      )}
    </Wrapper>
  )
}
