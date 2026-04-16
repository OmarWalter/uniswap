import { Currency } from '@uniswap/sdk-core'
import { memo, useCallback } from 'react'

import { useWindowSize } from '../../hooks/useWindowSize'
import Modal from '../Modal'
import { CurrencySearch, CurrencySearchFilters } from './CurrencySearch'

interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCurrencyAmount?: boolean
  currencySearchFilters?: CurrencySearchFilters
}

export default memo(function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCurrencyAmount = true,
  currencySearchFilters,
}: CurrencySearchModalProps) {
  const handleCurrencySelect = useCallback(
    (currency: Currency, _hasWarning?: boolean) => {
      void _hasWarning
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  const { height: windowHeight } = useWindowSize()
  let modalHeight: number | undefined = 80
  if (windowHeight) {
    modalHeight = Math.min(Math.round((680 / windowHeight) * 100), 80)
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} height={modalHeight}>
      <CurrencySearch
        isOpen={isOpen}
        onDismiss={onDismiss}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
        otherSelectedCurrency={otherSelectedCurrency}
        showCurrencyAmount={showCurrencyAmount}
        filters={currencySearchFilters}
      />
    </Modal>
  )
})
