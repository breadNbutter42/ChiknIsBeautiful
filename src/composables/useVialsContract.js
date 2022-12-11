import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/flatpeg.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_VIALS, VITE_CONTRACT_THIRD } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_VIALS, abi, payload)


  const VclaimPremint = async () => await contract.claimPremint()
  //0 vars; Write

  const VsetApprovalForAllALLOW = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, true)
  const VsetApprovalForAllREVOKE = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, false)

  //2 vars input: operator, bool; Write


  const VamountMintedDuringPremint = async () => await contract.amountMintedDuringPremint().then(response => Number(response))
  const VamountMintedByDevs = async () => await contract.amountMintedByDevs().then(response => Number(response))
  const VamountMintedDuringPublicSale = async () => await contract.amountMintedDuringPublicSale().then(response => Number(response))
  const VcollectionSize = async () => await contract.collectionsSize().then(response => Number(response))
  const Vname = async () => await contract.name().then(response => String(response))
  const Vsymbol = async () => await contract.symbol().then(response => String(response))
  const VtokenURI = async () => await contract.tokenURI().then(response => String(response))
  const VunrevealedURI = async () => await contract.unrevealedURI().then(response => String(response))
  const VtotalSupply = async () => await contract.totalSupply().then(response => Number(response))


  //0 vars input; Read

    
  const VbalanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(response))
  //owner 

  const VgetOwnershipDataVIAL = async (vialID) => await contract.getOwnershipData(vialID).then(response => String(response))

  //tuple response for getOwnershipData
  //need to add tuple support I think or some string magic maybe
  //https://gist.github.com/fnky/0a6cd5f39a7ad0ace79a7a4f5c999691

  const VisApprovedForAll = async (payload) => await contract.isApprovedForAll(payload ?? address.value, VITE_CONTRACT_THIRD).then(response => Number(response))
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
    VclaimPremint,
    VsetApprovalForAllALLOW,
    VsetApprovalForAllREVOKE,
    VamountMintedDuringPremint,
    VamountMintedByDevs,
    VamountMintedDuringPublicSale,
    VcollectionSize,
    Vname,
    Vsymbol,
    VtokenURI,
    VunrevealedURI,
    VtotalSupply,
    VbalanceOf,
    VgetOwnershipDataVIAL,
    VisApprovedForAll
  }
}
