import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { daysCount } from './index'

import dayjs from 'dayjs'
import { ChartSpan, ChartType } from '../../pages/PoolInfoPage'

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

interface ChartInterface {
  feeData
  dimensions: {
    width: number
    height: number
    margin: { top: number; right: number; bottom: number; left: number }
  }
  span: ChartSpan
  type: ChartType
}

export default function Chart({ feeData: { data, previousData } = {}, span, type, dimensions }: ChartInterface) {
  const svgRef = useRef(null)
  const { width, height, margin } = dimensions
  const svgWidth = width + margin.left + margin.right + 10
  const svgHeight = height + margin.bottom + margin.top

  const firstNonEmptyValue = useMemo(() => {
    if (!previousData) return null

    if (previousData[0]) {
      return {
        value: previousData[0].value,
        timestamp: previousData[0].timestamp,
      }
    } else {
      return null
    }
  }, [data, previousData])

  const xTicks = useMemo(() => {
    switch (span) {
      case ChartSpan.DAY:
        return 24
      case ChartSpan.MONTH:
        return 30
      case ChartSpan.WEEK:
        return 7
    }
  }, [span])

  const tickWidth = useMemo(() => {
    switch (span) {
      case ChartSpan.DAY:
        return dimensions.width / 24
      case ChartSpan.MONTH:
        return dimensions.width / 30
      case ChartSpan.WEEK:
        return dimensions.width / 7
    }
  }, [span, dimensions, data])

  const _chartData = useMemo(() => {
    if (data.length === 0) return []

    let sameDays = []
    let res = []

    if (data.length === 0 || (data[1] && dayjs(data[1].timestamp).isSame(data[0].timestamp))) {
      res.push({
        value: data[0].value,
        timestamp: data[0].timestamp,
      })
    }

    for (let i = 1; i < data.length; i++) {
      if (sameDay(new Date(data[i].timestamp), new Date(data[i - 1].timestamp))) {
        sameDays.push(data[i])
      } else {
        if (sameDays.length !== 0) {
          res.push(
            sameDays.reduce(
              (prev, cur) => {
                return {
                  timestamp: cur.timestamp,
                  value:
                    span === ChartSpan.DAY || type === ChartType.FEES
                      ? prev.value + cur.value
                      : Math.max(prev.value, cur.value),
                }
              },
              {
                value: 0,
                timestamp: null,
              }
            )
          )
          if (type === ChartType.FEES) {
            res[res.length - 1].value = res[res.length - 1].value / sameDays.length
          }
        } else {
          res.push({
            value: data[i].value,
            timestamp: data[i].timestamp,
          })
        }
        sameDays = []
      }
    }

    console.log('SAME DAYS', sameDays)

    if (sameDays.length !== 0) {
      res.push(
        sameDays.reduce(
          (prev, cur) => {
            return {
              timestamp: cur.timestamp,
              value:
                span === ChartSpan.DAY || type === ChartType.FEES
                  ? prev.value + cur.value
                  : Math.max(prev.value, cur.value),
            }
          },
          {
            value: 0,
            timestamp: null,
          }
        )
      )
      if (type === ChartType.FEES) {
        res[res.length - 1].value = res[res.length - 1].value / sameDays.length
      }
    }

    if (res.length === 0) {
      res = res.concat([...data])
    }

    console.log('RES', sameDays, res)

    let _data = []

    if (res.length < xTicks) {
      const _span = span !== ChartSpan.DAY ? 'day' : 'hour'

      const firstRealDay = dayjs(res[0].timestamp).startOf(_span)
      const lastRealDay = dayjs(res[res.length - 1].timestamp).startOf(_span)

      const firstAdditionalDay = dayjs(Date.now())
        .subtract(xTicks - 1, _span)
        .startOf(_span)
      const lastAdditionalDay = dayjs(Date.now()).startOf(_span)

      console.log(firstRealDay, firstAdditionalDay, lastRealDay, lastAdditionalDay)

      if (firstRealDay > firstAdditionalDay) {
        for (
          let i = firstAdditionalDay.unix();
          i < firstRealDay.unix();
          i += span === ChartSpan.DAY ? 3600 : 24 * 3600
        ) {
          _data.push({
            timestamp: new Date(i * 1000),
            value: firstNonEmptyValue ? firstNonEmptyValue.value : 0,
          })
        }
      }

      console.log('first', [..._data])

      _data.push({
        timestamp: new Date(res[0].timestamp),
        value: res[0].value,
      })

      let last = _data[_data.length - 1]

      for (let i = 1; i < res.length; i++) {
        console.log('res l', res[i])
        const isNext = dayjs(res[i].timestamp)
          .subtract(1, span === ChartSpan.DAY ? 'hours' : 'days')
          .isSame(dayjs(res[i - 1].timestamp))

        if (isNext) {
          _data.push({
            timestamp: new Date(res[i].timestamp * 1000),
            value: res[i].value,
          })
        } else {
          const difference = dayjs(res[i].timestamp).diff(last.timestamp, span === ChartSpan.DAY ? 'hours' : 'days')

          for (let j = 1; j <= difference; j++) {
            const nextDay = new Date(
              dayjs(last.timestamp)
                .add(1, span === ChartSpan.DAY ? 'hours' : 'days')
                .unix() * 1000
            )

            _data.push({
              timestamp: nextDay,
              value: last.value,
            })

            last = _data[_data.length - 1]
          }
        }
        last = res[i]
      }

      _data.push(last)

      console.log('second', [..._data])

      if (lastRealDay < lastAdditionalDay) {
        for (let i = lastRealDay.unix(); i < lastAdditionalDay.unix(); i += span === ChartSpan.DAY ? 3600 : 24 * 3600) {
          _data.push({
            timestamp: new Date(i * 1000),
            value: res[res.length - 1].value,
          })
        }
      }
    } else {
      _data = [...res]
    }

    console.log('third', [..._data])

    return [..._data]
  }, [data, previousData])

  const xScale = useMemo(() => {
    return d3
      .scaleTime()
      .domain([d3.min(_chartData, (d) => new Date(d.timestamp)), d3.max(_chartData, (d) => new Date(d.timestamp))])
      .range([0, width])
  }, [span, _chartData])

  const Line = d3
    .create('svg:line')
    .attr('id', 'pointer2')
    .attr('x1', '0px')
    .attr('y1', 0)
    .attr('x2', '0px')
    .attr('y2', height)
    .style('stroke-width', 1)
    .style('stroke', '#595f6e')
    .style('display', 'none')

  const InfoRectGroup = d3.create('svg:g').style('pointer-events', 'none').style('display', 'none')

  const InfoRect = d3
    .create('svg:rect')
    .append('rect')
    .attr('id', 'info-label')
    .attr('width', '150px')
    .attr('height', '60px')
    .attr('rx', '6')
    .style('fill', '#12151d')

  const InfoRectFeeText = d3
    .create('svg:text')
    .attr('transform', 'translate(16, 25)')
    .attr('fill', 'white')
    .attr('font-weight', '600')
    .attr('font-size', '14px')

  const InfoRectDateText = d3
    .create('svg:text')
    .attr('transform', 'translate(16, 45)')
    .attr('fill', 'white')
    .attr('font-weight', '500')
    .attr('font-size', '12px')
    .attr('fill', '#b0b0b0')

  InfoRectGroup.node().append(InfoRect.node())
  InfoRectGroup.node().append(InfoRectFeeText.node())
  InfoRectGroup.node().append(InfoRectDateText.node())

  const Focus = d3
    .create('svg:circle')
    .style('fill', 'white')
    .attr('stroke', '#00cab2')
    .attr('stroke-width', '2')
    .attr('r', 5.5)
    .style('opacity', 1)
    .style('display', 'none')

  useEffect(() => {
    if (data.length === 0) return

    console.log('_chartData', _chartData)

    const svgEl = d3.select(svgRef.current)
    svgEl.selectAll('*').remove()

    const svg = svgEl.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

    svgEl.on('mouseenter', () => {
      Line.style('display', 'block')
      InfoRectGroup.style('display', 'block')
      Focus.style('display', 'block')
    })

    svgEl.on('mouseleave', () => {
      Line.style('display', 'none')
      InfoRectGroup.style('display', 'none')
      Focus.style('display', 'none')
    })

    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(xTicks).tickSizeOuter(0))
    xAxisGroup.selectAll('line').attr('stroke', 'rgba(255, 255, 255, 0)').attr('id', 'xline')
    xAxisGroup.selectAll('text').attr('opacity', 0.5).attr('color', 'white').attr('font-size', '0.75rem')

    const y = d3
      .scaleLinear()
      .domain([d3.min(_chartData, (d) => +d.value - 0.01), d3.max(_chartData, (d) => +d.value + 0.01)])
      .range([height, 0])

    const yAxisGroup = svg.append('g').call(
      d3
        .axisLeft(y)
        .ticks(10)
        .tickFormat((val) => `${type === ChartType.FEES ? `${val}%` : `$${val}`}`)
        .tickSize(-width)
    )

    yAxisGroup.selectAll('line').attr('stroke', 'rgba(255, 255, 255, 0.1)').attr('id', 'xline')
    yAxisGroup.select('.domain').remove()
    yAxisGroup.selectAll('text').attr('opacity', 0.5).attr('color', 'white').attr('font-size', '0.75rem')

    //Gradient
    svg
      .append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        {
          offset: '0%',
          color: 'rgba(4,120,106,0.75)',
        },
        {
          offset: '100%',
          color: 'rgba(163,218,211,0)',
        },
      ])
      .enter()
      .append('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color)

    // Chart data visualize
    svg
      .append('path')
      .datum(_chartData)
      .attr('fill', 'none')
      .attr('stroke', '#00cab2')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line()
          .curve(d3.curveBumpX)
          .x(function (d) {
            return xScale(d.timestamp)
          })
          .y(function (d) {
            return y(d.value)
          })
      )

    svg
      .append('path')
      .datum(_chartData)
      .attr('fill', 'url(#gradient)')
      .attr(
        'd',
        d3
          .area()
          .curve(d3.curveBumpX)
          .x((d) => xScale(d.timestamp))
          .y0((d) => y(d3.min(_chartData, (d) => +d.value - 0.01)))
          .y1((d) => y(d.value))
      )

    xAxisGroup
      .selectAll('.tick')
      .nodes()
      .map((el, i) => {
        const xTranslate = d3
          .select(el)
          .attr('transform')
          .match(/\((.*?)\)/)[1]
          .split(',')[0]

        if (i % 2 === 0 && span !== ChartSpan.WEEK) {
          d3.select(el).attr('display', 'none')
        }

        // d3.select(el).attr('transform', `translate(${+xTranslate + +tickWidth}, 0)`)

        const rect = d3
          .create('svg:rect')
          .attr('x', `${xTranslate - tickWidth / 2}px`)
          .attr('y', `-${0}px`)
          .attr('width', `${tickWidth}px`)
          .attr('height', `${dimensions.height}px`)
          .attr('fill', 'transparent')
          .on('mouseover', (e) => {
            const isOverflowing = Number(xTranslate) + 150 + 16 > dimensions.width
            const date = new Date(_chartData[i]?.timestamp)
            Line.attr('x1', `${xTranslate}px`).attr('x2', `${xTranslate}px`)
            InfoRectGroup.attr(
              'transform',
              `translate(${isOverflowing ? Number(xTranslate) - 150 - 16 : Number(xTranslate) + 16},10)`
            )
            InfoRectFeeText.property(
              'innerHTML',
              `${type === ChartType.FEES ? 'Fee:' : type === ChartType.TVL ? 'TVL:' : 'Volume:'} ${
                type !== ChartType.FEES ? '$' : ''
              }${Number(_chartData[i]?.value).toFixed(2)}${type === ChartType.FEES ? '%' : ''}`
            )
            InfoRectDateText.property(
              'innerHTML',
              span === ChartSpan.DAY
                ? `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:${
                    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
                  }:${date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()}`
                : `${date.getDate()}/${date.getMonth() - 1}/${date.getFullYear()}`
            )
            Focus.attr('transform', `translate(${xScale(_chartData[i].timestamp)},${y(_chartData[i]?.value)})`)
          })

        svg.node().append(rect.node())
      })

    svg.append(() => InfoRectGroup.node())
    svg.append(() => Line.node())
    svg.append(() => Focus.node())
  }, [data])

  return <svg ref={svgRef} style={{ overflow: 'visible' }} width={svgWidth} height={svgHeight} />
}