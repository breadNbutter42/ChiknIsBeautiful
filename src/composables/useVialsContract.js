import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/vials.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_VIALS, VITE_CONTRACT_THIRD } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_VIALS, abi, payload)

  const VsetApprovalForAll = async (_bool) => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, _bool)

  //2 vars input: operator, bool; Write

  const Vsymbol = async () => await contract.symbol()

  //0 vars input; Read

    
  const VbalanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(response))
  //owner 

  const VisApprovedForAll = async (payload) => await contract.isApprovedForAll(payload ?? address.value, VITE_CONTRACT_THIRD).then(response => Boolean(response))
  //owner / operator : bool ; Read




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
    VsetApprovalForAll,
    Vsymbol,
    VbalanceOf,
    VisApprovedForAll
  }
}
