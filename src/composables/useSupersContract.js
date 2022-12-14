import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/supers.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_SUPERS } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_SUPERS, abi, payload)

  const Ssymbol = async () => await contract.symbol()
  
  //0 vars input; Read
 
  const SbalanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(response))
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
    SbalanceOf,
    Ssymbol,
  }
}
