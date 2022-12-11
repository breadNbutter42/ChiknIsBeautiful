import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/flatpeg.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_FLATPEG, VITE_CONTRACT_THIRD } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_FLATPEG, abi, payload)

  /*
  const symbol = async () => await contract.symbol()
  //0 inputs, read
  const approve = async (_number) => await contract.approve(VITE_CONTRACT_FLATPEG, ethers.utils.parseEther(String(_number)))
  //two input spender / amount; Write
  const allowance = async (payload) => await contract.allowance(payload ?? address.value, VITE_CONTRACT_FLATPEG).then(response => Number(ethers.utils.formatEther(response)))
//two var input : owner / spender; read
  const balanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(ethers.utils.formatEther(response)).toFixed(2))
//one var user address input; read
  */



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
    symbol,
    approve,
    allowance,
    balanceOf
  }
}
