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

  //https://snowtrace.io//address/0x357928b721890ed007142e45502a323827caf812#readContract  Chads Mainnet

  const CsetApprovalForAllALLOW = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, true)
  const CsetApprovalForAllREVOKE = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, false)

  //2 vars input: operator, bool; Write


  const CamountMintedDuringPremint = async () => await contract.amountMintedDuringPremint().then(response => Number(response))
  const CamountMintedByDevs = async () => await contract.amountMintedByDevs().then(response => Number(response))
  const CamountMintedDuringPublicSale = async () => await contract.amountMintedDuringPublicSale().then(response => Number(response))
  const CcollectionSize = async () => await contract.collectionsSize().then(response => Number(response))
  const Cname = async () => await contract.name().then(response => String(response))
  const Csymbol = async () => await contract.symbol().then(response => String(response))
  const CtokenURI = async () => await contract.tokenURI().then(response => String(response))
  const CunrevealedURI = async () => await contract.unrevealedURI().then(response => String(response))
  const CtotalSupply = async () => await contract.totalSupply().then(response => Number(response))


  //0 vars input; Read

    
  const CbalanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(response))
  //owner 

  const CgetOwnershipDataCHAD = async (chadID) => await contract.getOwnershipData(chadID).then(response => String(response))
  
  //tuple response for getOwnershipData
  
  //https://gist.github.com/fnky/0a6cd5f39a7ad0ace79a7a4f5c999691

  const CisApprovedForAll = async (payload) => await contract.isApprovedForAll(payload ?? address.value, VITE_CONTRACT_THIRD).then(response => Number(response))
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
    CsetApprovalForAllALLOW,
    CsetApprovalForAllREVOKE,
    CamountMintedDuringPremint,
    CamountMintedByDevs,
    CamountMintedDuringPublicSale,
    CcollectionSize,
    Cname,
    Csymbol,
    CtokenURI,
    CunrevealedURI,
    CtotalSupply,
    CbalanceOf,
    CgetOwnershipDataCHAD,
    CisApprovedForAll
  }
}
