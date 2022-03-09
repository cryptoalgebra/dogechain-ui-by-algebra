import React from 'react'
import { CheckCircle } from 'react-feather'
import { isAddress } from '@ethersproject/address'
import Loader from '../Loader'
import { UnstakingInterface } from '../../models/interfaces'

interface ModalBodyProps {
    sending: UnstakingInterface
    recipient: string
    setRecipient: any
    setSending: any
    account: string | undefined
    sendModal: string | null
    sendNFTHandler: any
}

export default function ModalBody({ sending, recipient, setRecipient, setSending, account, sendModal, sendNFTHandler }: ModalBodyProps) {
    return (
        <div className={'p-2'} style={{ alignItems: sending && sending.state === 'done' ? 'center' : '' }}>
            {sending.state === 'done' ? (
                <>
                    <CheckCircle size={'35px'} stroke={'#27AE60'} />
                    <div className={'mt-1'}>{`NFT was sent!`}</div>
                </>
            ) : (
                <div className={'my-stakes__nft-send'}>
                    <div className={'mb-1 c-p fs-125 b'}>Send NFT to another account</div>
                    <div
                        className={'my-stakes__nft-send__warning br-12 p-05 mb-1 c-dec'}>{'If you send your NFT to another account, you can’t get it back unless you have an access to the recipient’s account.'}</div>
                    <div className={'mb-1'}>
                        <input
                            className={'w-100 p-05 br-8'}
                            placeholder='Enter a recipient'
                            value={recipient}
                            onChange={(v) => {
                                setRecipient(v.target.value)
                            }}
                        />
                    </div>
                    <button className={'btn primary w-100 pv-075 ph-1 c-w br-8 '}
                            disabled={!isAddress(recipient) || recipient === account}
                            onClick={() => {
                                setSending({ id: sendModal, state: 'pending' })
                                sendNFTHandler(sendModal)
                            }}
                    >
                        {sending && sending.id === sendModal && sending.state !== 'done' ? (
                            <span className={'f f-ac f-jc'}>
                                        <Loader size={'1rem'} stroke={'white'} />
                                        <span className={'ml-05'}>Sending</span>
                                    </span>
                        ) : (
                            <span>{`Send NFT`}</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
};