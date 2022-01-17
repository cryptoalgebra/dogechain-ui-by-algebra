import styled from 'styled-components/macro'
import Chart from './Chart'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import * as d3 from 'd3'
import Brush from './Brush'
import {BigNumber} from 'ethers'
import {formatEther, formatUnits, parseUnits} from 'ethers/lib/utils'
import {isMobile} from 'react-device-detect'
import RangeButtons from "./RangeButtons"
import dayjs from "dayjs"
import {it} from "make-plural/plurals"

const StakingAnalyticsChartWrapper = styled.div`
  max-width: 1000px;
  width: 100%;
  background-color: #052445;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 2rem 0;
`

export function convertDate(date: Date) {
    const yyyy = date.getFullYear().toString()
    const mm = (date.getMonth() + 1).toString()
    const dd = date.getDate().toString()

    const mmChars = mm.split('')
    const ddChars = dd.split('')

    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0])
}

interface StakingAnalyticsChartProps {
    stakeHistoriesResult: any[] | null
    type: string
}

export interface ChardDataInterface {
    value: string
    date: string
}

export default function StakingAnalyticsChart({stakeHistoriesResult, type}: StakingAnalyticsChartProps) {
    const [chartData, setChartData] = useState([])
    const [chartBorder, setChartBorder] = useState([])
    const focusHeight = 70
    const wrapper = useRef(null)
    // const dimensions =
    const margin = isMobile ? {left: 30, top: 30, right: 10, bottom: 50} :{left: 50, top: 30, right: 30, bottom: 30}
    const [span, setSpan] = useState('Day')


    const getDaysArray = useCallback((start, end) => {
        const arr = []
        const dt = new Date(start)

        while (dt <= end) {
            arr.push(convertDate(dt))
            dt.setDate(dt.getDate() + 1)
        }
        return arr
    }, [])

    const startTimestamp = useMemo(() => {
        const day = dayjs()

        switch (span) {
            case 'Day':
                return day.subtract(1, 'day').unix()
            case 'Week':
                return day.subtract(7, 'day').unix()
            case 'Month':
                return day.subtract(1, 'month').unix()
            case 'All':
                return 'All'
            default:
                return day.subtract(1, 'day').unix()
        }
    }, [span])

    useEffect(() => {
        if (startTimestamp === 'All') {
            setChartBorder([fullDateData[0]?.date, fullDateData[fullDateData.length - 1]?.date])
            return
        }
        setChartBorder([convertDate(new Date(startTimestamp * 1000)), convertDate(new Date())])
    }, [startTimestamp])


    useEffect(() => {
        if (stakeHistoriesResult) {
            if (type === 'apr') {
                setChartData(stakeHistoriesResult.map(item => {
                    // console.log(item.currentStakedAmount, BigNumber.from(item.currentStakedAmount))
                    // console.log(BigNumber.from(item.ALGBfromVault).div(BigNumber.from(item.currentStakedAmount)))
                    const s = BigNumber.from(item.ALGBfromVault).div(BigNumber.from(item.currentStakedAmount)).mul(parseUnits('365', 18)).mul(BigNumber.from(100))
                    console.log(formatUnits(s, 18))
                    console.log(BigNumber.from('365'))
                    return {
                        value: formatUnits(BigNumber.from(item.ALGBfromVault).div(BigNumber.from(item.currentStakedAmount)).mul(BigNumber.from('365')).mul(BigNumber.from('100')), 18),
                        date: convertDate(new Date(item.date * 1000))
                    }
                }))
            } else {
                setChartData(stakeHistoriesResult.map(item => {
                    return {
                        value: formatEther(BigNumber.from(item[type])._hex),
                        date: convertDate(new Date(item.date * 1000))
                    }
                }))
            }
        }
    }, [stakeHistoriesResult])

    let prevData = ''
    const fullDateData = useMemo(() => getDaysArray(d3.min(chartData)?.date, new Date()).map(item => {
        for (let i = 0; i < chartData.length; i++) {
            if (chartData[i].date === item) {
                prevData = chartData[i].value
                return chartData[i]
            }
        }
        if (type === 'xALGBtotalSupply') {
            return {value: prevData, date: item}
        }
        return {value: '0', date: item}
    }), [chartData])

    const borderedData = useMemo(() => fullDateData.filter(item => {
        if (item.date >= chartBorder[0] && item.date <= chartBorder[1]) {
            return true
        }
    }), [chartBorder])

    const X = useMemo(() => d3.map(fullDateData, d => new Date(d.date)), [fullDateData])

    return (
        <StakingAnalyticsChartWrapper ref={wrapper}>
            {isMobile && <RangeButtons setSpan={setSpan} span={span}/>}
            <Chart
                data={borderedData}
                margin={margin}
                dimensions={{width: isMobile ? wrapper?.current?.offsetWidth  - 80 : 900, height: isMobile ? 300 : 400}}
            />
            {!isMobile && <Brush
                data={fullDateData}
                width={isMobile ? wrapper?.current?.offsetWidth  - 80 : 900}
                margin={margin}
                focusHeight={focusHeight}
                X={X}
                updateChartData={setChartBorder}/>}
        </StakingAnalyticsChartWrapper>
    )
}