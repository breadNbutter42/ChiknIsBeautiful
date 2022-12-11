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
  const upgradeSuper = async (vialID, superID) => await contract.upgradeSuper(vialID, superID)
  
  //two inputs, write


  const zeroAddress = async () => await contract.zeroAddress().then(response => String(response))
  const vialContract = async () => await contract.vialContract().then(response => String(response))
  const upgradeContract = async () => await contract.upgradeContract().then(response => String(response))
  const superContract = async () => await contract.superContract().then(response => String(response))
  const chadContract = async () => await contract.chadContract().then(response => Number(response))
  const fVialsBurned = async () => await contract.fVialsBurned().then(response => Number(response))
  const nVialsBurned = async () => await contract.nVialsBurned().then(response => Number(response))
  const vialsBurned = async () => await contract.vialsBurned().then(response => Number(response))
  const fVialsSet = async () => await contract.fVialsSet().then(response => Boolean(response))
  const preminted = async () => await contract.preminted().then(response => Number(response))

  //0 inputs, read






  const vialToF = async (vialID) => await contract.vialToF(vialID).then(response => Number(response))
  const supersToChad = async (superID) => await contract.supersToChad(superID).then(response => Number(response))
  const superTokenURI = async (superID) => await contract.superTokenURI(superID).then(response => String(response))
  const superToMinted = async (superID) => await contract.superToMinted(superID).then(response => Boolean(response))
  const chadToMinted = async (chadID) => await contract.chadToMinted(chadID).then(response => Boolean(response))
  const chadToSupers = async (chadID) => await contract.chadToSupers(chadID).then(response => Number(response))
  const getShuffledTokenIDSUPERS = async (superID) => await contract.getShuffledTokenID(superID).then(response => Number(response))
  const getShuffledTokenIDCHAD = async (chadID) => await contract.getShuffledTokenID(chadID).then(response => Number(response))

  const id2UpgradeArray = async (superID) => await contract.id2UpgradeArray(superID).then(response => Array(response))

  //one input, read                                                    

  const superToUpgradeArray = async (superID, arraySlotX) => await contract.superToUpgradeArray(superID, arraySlotX).then(response => Number(response))

  //two input to read id and then position in array
  //read


  

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
    upgradeSuper,
    zeroAddress,
    vialContract,
    upgradeContract,
    superContract,
    chadContract,
    fVialsBurned,
    nVialsBurned,
    vialsBurned,
    fVialsSet,
    preminted,
    vialToF,
    supersToChad,
    superTokenURI,
    superToMinted,
    chadToMinted,
    chadToSupers,
    getShuffledTokenIDSUPERS,
    getShuffledTokenIDCHAD,
    id2UpgradeArray,
    superToUpgradeArray
  }
}
