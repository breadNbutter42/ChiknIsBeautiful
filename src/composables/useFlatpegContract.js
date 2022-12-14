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
  const approve = async (_number) => await contract.approve(VITE_CONTRACT_THIRD, ethers.utils.parseEther(String(_number)))
  //two input spender / amount; Write
  const allowance = async (payload) => await contract.allowance(payload ?? address.value, VITE_CONTRACT_THIRD).then(response => Number(ethers.utils.formatEther(response)))
  //two var input : owner / spender; read
  const balanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(ethers.utils.formatEther(response)).toFixed(2))
  //one var user address input; read
  */

  const claimPremint = async () => await contract.claimPremint()
  //0 vars; Write

  const setApprovalForAllALLOW = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, true)
  const setApprovalForAllREVOKE = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, false)

  //2 vars input: operator, bool; Write


  const amountMintedDuringPremint = async () => await contract.amountMintedDuringPremint().then(response => Number(response))
  const amountMintedByDevs = async () => await contract.amountMintedByDevs().then(response => Number(response))
  const amountMintedDuringPublicSale = async () => await contract.amountMintedDuringPublicSale().then(response => Number(response))
  const collectionSize = async () => await contract.collectionsSize().then(response => Number(response))
  const name = async () => await contract.name().then(response => String(response))
  const symbol = async () => await contract.symbol()
  const tokenURI = async () => await contract.tokenURI().then(response => String(response))
  const unrevealedURI = async () => await contract.unrevealedURI().then(response => String(response))
  const totalSupply = async () => await contract.totalSupply().then(response => Number(response))


  //0 vars input; Read

    
  const balanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(response))
  //owner 

  const getOwnershipDataSUPER = async (superID) => await contract.getOwnershipData(superID).then(response => String(response))
  const getOwnershipDataCHAD = async (chadID) => await contract.getOwnershipData(chadID).then(response => String(response))
  const getOwnershipDataVIAL = async (vialID) => await contract.getOwnershipData(vialID).then(response => String(response))
  const getOwnershipDataUPGRADE = async (upgradeID) => await contract.getOwnershipData(upgradeID).then(response => String(response))

  //tuple response for getOwnershipData
  
  //https://gist.github.com/fnky/0a6cd5f39a7ad0ace79a7a4f5c999691

  const isApprovedForAll = async (payload) => await contract.isApprovedForAll(payload ?? address.value, VITE_CONTRACT_THIRD).then(response => Number(response))
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
    claimPremint,
    setApprovalForAllALLOW,
    setApprovalForAllREVOKE,
    amountMintedDuringPremint,
    amountMintedByDevs,
    amountMintedDuringPublicSale,
    collectionSize,
    name,
    symbol,
    tokenURI,
    unrevealedURI,
    totalSupply,
    balanceOf,
    getOwnershipDataSUPER,
    getOwnershipDataCHAD,
    getOwnershipDataVIAL,
    getOwnershipDataUPGRADE,
    isApprovedForAll
  }
}
