import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/flatpeg.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_UPGRADES, VITE_CONTRACT_THIRD } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_UPGRADES, abi, payload)

 

  const UsetApprovalForAllALLOW = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, true)
  const UsetApprovalForAllREVOKE = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, false)

  //2 vars input: operator, bool; Write


  const UamountMintedDuringPremint = async () => await contract.amountMintedDuringPremint().then(response => Number(response))
  const UamountMintedByDevs = async () => await contract.amountMintedByDevs().then(response => Number(response))
  const UamountMintedDuringPublicSale = async () => await contract.amountMintedDuringPublicSale().then(response => Number(response))
  const UcollectionSize = async () => await contract.collectionsSize().then(response => Number(response))
  const Uname = async () => await contract.name().then(response => String(response))
  const Usymbol = async () => await contract.symbol().then(response => String(response))
  const UtokenURI = async () => await contract.tokenURI().then(response => String(response))
  const UunrevealedURI = async () => await contract.unrevealedURI().then(response => String(response))
  const UtotalSupply = async () => await contract.totalSupply().then(response => Number(response))


  //0 vars input; Read

    
  const UbalanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(response))
  //owner 

  const UgetOwnershipDataUPGRADE = async (upgradeID) => await contract.getOwnershipData(upgradeID).then(response => String(response))

  //tuple response for getOwnershipData
  
  //https://gist.github.com/fnky/0a6cd5f39a7ad0ace79a7a4f5c999691

  const UisApprovedForAll = async (payload) => await contract.isApprovedForAll(payload ?? address.value, VITE_CONTRACT_THIRD).then(response => Number(response))
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
    UsetApprovalForAllALLOW,
    UsetApprovalForAllREVOKE,
    UamountMintedDuringPremint,
    UamountMintedByDevs,
    UamountMintedDuringPublicSale,
    UcollectionSize,
    Uname,
    Usymbol,
    UtokenURI,
    UunrevealedURI,
    UtotalSupply,
    UbalanceOf,
    UgetOwnershipDataUPGRADE,
    UisApprovedForAll
  }
}
