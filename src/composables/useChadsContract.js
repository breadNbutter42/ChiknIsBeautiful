import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/flatpeg.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_CHADS } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_CHADS, abi, payload)

  //https://snowtrace.io//address/0x357928b721890ed007142e45502a323827caf812#readContract  Chads Mainnet

  const Csymbol = async () => await contract.symbol()
  
  //0 vars input; Read

    
  const CbalanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => String(response))
  //owner 


  userStore.$onAction(({ name, after }) => {
    after(() => {
      const actions = {
        setUser: () => setContract(wallet.getSigner()),
        resetUser: () => setContract(wallet)
      }

      actions[name]?.() || null
    })
  })

  isAuthenticated.value ? setContract(wallet.getSigner()) : setContract(wallet)

  return {//repeat the function names here again
    contract,
    CbalanceOf,
    Csymbol
  }
}
