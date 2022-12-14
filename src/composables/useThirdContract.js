import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/third.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()

  let contract
  const setContract = (payload) => contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_THIRD, abi, payload)
  const upgradeChad = async (vialID, chadID) => await contract.upgradeChad(vialID, chadID)
  
  //two inputs, write


  
  const fVialsBurned = async () => await contract.fVialsBurned().then(response => String(response))
  const nVialsBurned = async () => await contract.nVialsBurned().then(response => String(response))
  const allVialsBurned = async () => await contract.vialsBurned().then(response => String(response))
  const fVialsSet = async () => await contract.fVialsSet().then(response => Boolean(response))

  //0 inputs, read




  const vialToF = async (vialID) => await contract.vialToF(vialID).then(response => Number(response))
  const chadToMinted = async (chadID) => await contract.chadToMinted(chadID).then(response => Boolean(response))

  //one input, read                                                    




  

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

  return {
    contract,
    upgradeChad,
    fVialsBurned,
    nVialsBurned,
    allVialsBurned,
    fVialsSet,
    vialToF,
    chadToMinted
  }
}
