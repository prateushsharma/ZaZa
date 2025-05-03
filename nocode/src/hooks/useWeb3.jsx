import { createContext, useContext, useEffect, useState } from 'react'
import Web3 from 'web3'

const Web3Context = createContext()

export function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState(null)

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          const web3Instance = new Web3(window.ethereum)
          const accounts = await web3Instance.eth.getAccounts()
          setWeb3(web3Instance)
          setAccount(accounts[0])
        } catch (error) {
          console.error('Error connecting to MetaMask:', error)
        }
      }
    }

    initWeb3()
  }, [])

  return (
    <Web3Context.Provider value={{ web3, account }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)