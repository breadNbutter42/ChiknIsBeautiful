import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/supers.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_SUPERS, VITE_CONTRACT_THIRD } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_SUPERS, abi, payload)

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

  //0 vars; Write

  const SsetApprovalForAllALLOW = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, true)
  const SsetApprovalForAllREVOKE = async () => await contract.setApprovalForAll(VITE_CONTRACT_THIRD, false)

  //2 vars input: operator, bool; Write


  const SamountMintedDuringPremint = async () => await contract.amountMintedDuringPremint().then(response => Number(response))
  const SamountMintedByDevs = async () => await contract.amountMintedByDevs().then(response => Number(response))
  const SamountMintedDuringPublicSale = async () => await contract.amountMintedDuringPublicSale().then(response => Number(response))
  const ScollectionSize = async () => await contract.collectionsSize().then(response => Number(response))
  const Sname = async () => await contract.name().then(response => String(response))
  const Ssymbol = async () => await contract.symbol().then(response => String(response))
  const StokenURI = async () => await contract.tokenURI().then(response => String(response))
  const SunrevealedURI = async () => await contract.unrevealedURI().then(response => String(response))
  const StotalSupply = async () => await contract.totalSupply().then(response => Number(response))


  //0 vars input; Read

    
  const SbalanceOf = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(response))
  //owner 

  const SgetOwnershipDataSUPER = async (superID) => await contract.getOwnershipData(superID).then(response => String(response))
  //tuple response for getOwnershipData
  
  //https://gist.github.com/fnky/0a6cd5f39a7ad0ace79a7a4f5c999691

  const SisApprovedForAll = async (payload) => await contract.isApprovedForAll(payload ?? address.value, VITE_CONTRACT_THIRD).then(response => Number(response))
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
    SsetApprovalForAllALLOW,
    SsetApprovalForAllREVOKE,
    SamountMintedDuringPremint,
    SamountMintedByDevs,
    SamountMintedDuringPublicSale,
    ScollectionSize,
    Sname,
    Ssymbol,
    StokenURI,
    SunrevealedURI,
    StotalSupply,
    SbalanceOf,
    SgetOwnershipDataSUPER,
    SisApprovedForAll
  }
}
