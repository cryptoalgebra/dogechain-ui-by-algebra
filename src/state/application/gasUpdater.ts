import { useEffect, useState } from "react"
import { useGasPrice } from "../../hooks/useGasPrice"
import { useActiveWeb3React } from "../../hooks/web3"
import { useAppDispatch, useAppSelector } from "../hooks"
import { updateGasPrice } from "./actions"

export default function GasUpdater(): null {

    const dispatch = useAppDispatch()

    const { chainId } = useActiveWeb3React()

    const block = useAppSelector((state) => {
        return state.application.blockNumber[chainId]
    })

    const { fetchGasPrice, gasPrice, gasPriceLoading } = useGasPrice()

    useEffect(() => {
        fetchGasPrice()
    }, [dispatch, block])

    useEffect(() => {
        if (!gasPrice) return
        dispatch(updateGasPrice(gasPrice))
    }, [gasPrice, gasPriceLoading])

    return null
}