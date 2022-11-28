import { ReactNode, useCallback, useEffect, useState } from 'react'
import { createContext } from 'use-context-selector'
import { api } from '../lib/axios'

interface Transaction {
  id: number
  description: string
  category: string
  price: number
  type: 'income' | 'outcome'
  createdAt: string
}

type CreateNewTransactionData = Omit<Transaction, 'id' | 'createdAt'>

export interface TransactionsContextData {
  transactions: Transaction[]
  fetchTransactions: (query?: string) => Promise<void>
  createNewTransaction: (data: CreateNewTransactionData) => Promise<void>
}

export const TransactionsContext = createContext({} as TransactionsContextData)

interface TransactionsContextProviderProps {
  children: ReactNode
}

export function TransactionsContextProvider({
  children,
}: TransactionsContextProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const fetchTransactions = useCallback(async (query?: string) => {
    const response = await api.get('transactions', {
      params: {
        _sort: 'createdAt',
        _order: 'desc',
        q: query,
      },
    })

    setTransactions(response.data)
  }, [])

  const createNewTransaction = useCallback(
    async (data: CreateNewTransactionData) => {
      const { description, price, category, type } = data

      const newTransaction = await api.post('transactions', {
        description,
        price,
        category,
        type,
        createdAt: new Date(),
      })

      setTransactions((state) => [newTransaction.data, ...state])
    },
    [],
  )

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        fetchTransactions,
        createNewTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}
