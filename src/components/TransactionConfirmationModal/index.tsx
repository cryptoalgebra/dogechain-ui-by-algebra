import { Currency } from '@uniswap/sdk-core'
import { ReactNode, useContext, useEffect } from 'react'
import { ThemeContext } from 'styled-components/macro'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import Modal from '../Modal'
import { Text } from 'rebass'
import { CloseIcon, CustomLightSpinner, ExternalLink } from '../../theme'
import { RowBetween, RowFixed } from '../Row'
import { AlertTriangle, ArrowUpCircle, CheckCircle } from 'react-feather'
import { ButtonLight, ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
// @ts-ignore
import Circle from '../../assets/images/blue-loader.svg'
// @ts-ignore
import MetaMaskLogo from '../../assets/svg/metamask-logo.svg'
import { useActiveWeb3React } from '../../hooks/web3'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import { Trans } from '@lingui/macro'
import { BottomSection, ConfirmedIcon, Section, StyledLogo, Wrapper } from './styled'

function ConfirmationPendingContent({
    onDismiss,
    pendingText,
    inline
}: {
    onDismiss: () => void
    pendingText: ReactNode
    inline?: boolean // not in modal
}) {
    return (
        <Wrapper>
            <AutoColumn gap='md'>
                {!inline && (
                    <RowBetween>
                        <div />
                        <CloseIcon onClick={onDismiss} />
                    </RowBetween>
                )}
                <ConfirmedIcon inline={inline}>
                    <CustomLightSpinner src={Circle} alt='loader' size={inline ? '40px' : '90px'} />
                </ConfirmedIcon>
                <AutoColumn gap='12px' justify={'center'}>
                    <Text fontWeight={500} fontSize={20} textAlign='center'>
                        <Trans>Waiting For Confirmation</Trans>
                    </Text>
                    <AutoColumn gap='12px' justify={'center'}>
                        <Text fontWeight={600} fontSize={14} color='' textAlign='center'>
                            {pendingText}
                        </Text>
                    </AutoColumn>
                    <Text fontSize={12} color='#565A69' textAlign='center' marginBottom={12}>
                        <Trans>Confirm this transaction in your wallet</Trans>
                    </Text>
                </AutoColumn>
            </AutoColumn>
        </Wrapper>
    )
}

function TransactionSubmittedContent({
    onDismiss,
    chainId,
    hash,
    currencyToAdd,
    inline
}: {
    onDismiss: () => void
    hash: string | undefined
    chainId: number
    currencyToAdd?: Currency | undefined
    inline?: boolean // not in modal
}) {
    const theme = useContext(ThemeContext)

    const { library } = useActiveWeb3React()

    const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

    return (
        <Wrapper style={{ color: 'black' }}>
            <Section inline={inline}>
                {!inline && (
                    <RowBetween>
                        <div />
                        <CloseIcon onClick={onDismiss} />
                    </RowBetween>
                )}
                <ConfirmedIcon inline={inline}>
                    <ArrowUpCircle strokeWidth={0.5} size={inline ? '40px' : '90px'}
                                   color={theme.winterMainButton} />
                </ConfirmedIcon>
                <AutoColumn gap='12px' justify={'center'}>
                    <Text fontWeight={500} fontSize={20} textAlign='center'>
                        <Trans>Transaction Submitted</Trans>
                    </Text>
                    {chainId && hash && (
                        <ExternalLink
                            href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
                            <Text fontWeight={500} fontSize={14} color={theme.winterMainButton}>
                                <Trans>View on Explorer</Trans>
                            </Text>
                        </ExternalLink>
                    )}
                    {currencyToAdd && library?.provider?.isMetaMask && (
                        <ButtonLight mt='12px' padding='6px 12px' width='fit-content'
                                     onClick={addToken}>
                            {!success ? (
                                <RowFixed>
                                    <Trans>
                                        Add {currencyToAdd.symbol} to Metamask <StyledLogo
                                        src={MetaMaskLogo} />
                                    </Trans>
                                </RowFixed>
                            ) : (
                                <RowFixed>
                                    <Trans>Added {currencyToAdd.symbol} </Trans>
                                    <CheckCircle size={'16px'} stroke={theme.green1}
                                                 style={{ marginLeft: '6px' }} />
                                </RowFixed>
                            )}
                        </ButtonLight>
                    )}
                    <ButtonPrimary
                        onClick={onDismiss}
                        style={{ margin: '20px 0 0 0', color: 'white' }}
                    >
                        <Text fontWeight={500} fontSize={20}>
                            {inline ? <Trans>Return</Trans> : <Trans>Close</Trans>}
                        </Text>
                    </ButtonPrimary>
                </AutoColumn>
            </Section>
        </Wrapper>
    )
}

export function ConfirmationModalContent({
    title,
    bottomContent,
    onDismiss,
    topContent
}: {
    title: ReactNode
    onDismiss: () => void
    topContent: () => ReactNode
    bottomContent?: () => ReactNode | undefined
}) {
    return (
        <Wrapper>
            <Section>
                <RowBetween>
                    <Text fontWeight={500} fontSize={16}>
                        {title}
                    </Text>
                    <CloseIcon onClick={onDismiss} />
                </RowBetween>
                {topContent()}
            </Section>
            {bottomContent && <BottomSection gap='12px'>{bottomContent()}</BottomSection>}
        </Wrapper>
    )
}

export function TransactionErrorContent({
    message,
    onDismiss
}: { message: ReactNode; onDismiss: () => void }) {
    const theme = useContext(ThemeContext)
    return (
        <Wrapper>
            <Section>
                <RowBetween>
                    <Text fontWeight={500} fontSize={20}>
                        <Trans>Error</Trans>
                    </Text>
                    <CloseIcon onClick={onDismiss} />
                </RowBetween>
                <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap='24px'
                            justify='center'>
                    <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
                    <Text
                        fontWeight={500}
                        fontSize={16}
                        color={theme.red1}
                        style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}
                    >
                        {message}
                    </Text>
                </AutoColumn>
            </Section>
            <BottomSection gap='12px'>
                <ButtonPrimary onClick={onDismiss}>
                    <Trans>Dismiss</Trans>
                </ButtonPrimary>
            </BottomSection>
        </Wrapper>
    )
}

interface ConfirmationModalProps {
    isOpen: boolean
    onDismiss: () => void
    hash: string | undefined
    content: () => ReactNode
    attemptingTxn: boolean
    pendingText: ReactNode
    currencyToAdd?: Currency | undefined
}

export default function TransactionConfirmationModal({
    isOpen,
    onDismiss,
    attemptingTxn,
    hash,
    pendingText,
    content,
    currencyToAdd
}: ConfirmationModalProps) {
    const { chainId } = useActiveWeb3React()

    // if on L2 and txn is submitted, close automatically (if open)
    useEffect(() => {
        if (isOpen && chainId && hash) {
            onDismiss()
        }
    }, [chainId, hash, isOpen, onDismiss])

    if (!chainId) return null

    // confirmation screen
    // if on L2 and submitted dont render content, as should auto dismiss
    // need this to skip submitted view during state update ^^
    return (
        <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
            {attemptingTxn ? <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
                : hash ? <TransactionSubmittedContent
                        chainId={chainId}
                        hash={hash}
                        onDismiss={onDismiss}
                        currencyToAdd={currencyToAdd}
                    />
                    : content()
            }
        </Modal>
    )
}
