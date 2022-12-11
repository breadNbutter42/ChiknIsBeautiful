import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/third.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()

  let contract
  const setContract = (payload) => contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_THIRD, abi, payload)

  
  const voteWithEggByCandidateNumber = async (id, amt) => await contract.voteWithEggByCandidateNumber(id, amt)
  const voteOneEggForEachCandidate = async () => await contract.voteOneEggForEachCandidate()

  const returnTotalVotesForCandidateIDNumber = async (id) => await contract.returnTotalVotesForCandidateIDNumber(id).then(response => Number(response))
  
  const prizeMoneyTotalWei = async () => await contract.prizeMoneyTotalWei().then(response => String(ethers.utils.formatEther(response)))
  const eggBurntTotalWei = async () => await contract.eggBurntTotalWei().then(response => String(ethers.utils.formatEther(response)))
  const allVotesTotalBase = async () => await contract.allVotesTotalBase().then(response => String(response))
  const votingTimeLeftBlockTimestampHours = async () => await contract.votingTimeLeftBlockTimestamp().then(response => String(Math.floor(Number(response) / 3600))).catch(() => 0)
  const totalVotesFromVoterAddress = async (payload) => await contract.totalVotesFromVoterAddress(payload ?? address.value).then(response => String(response))
  const addressTotalVotesForIDNumber = async (id, payload) => await contract.addressTotalVotesForIdNumber(payload ?? address.value, id).then(response => String(response))
//this payload one is interesting
//original VOTR contract https://snowtrace.io/address/0x33b0db1369f81c99908affc6a2fbba8f1bc99096#readContract
  
  
  const upgradeChad = async (vialID, chadID) => await contract.upgradeChad(vialID, chadID)
  const upgradeSuper = async (vialID, superID) => await contract.upgradeSuper(vialID, superID)
  
//two inputs, write


const chadContract = async () => await contract.chadContract().then(response => String(response))
const fVialsBurned = async () => await contract.fVialsBurned().then(response => String(response))
const nVialsBurned = async () => await contract.nVialsBurned().then(response => String(response))
const fVialsSet = async () => await contract.fVialsSet().then(response => String(response))
const preminted = async () => await contract.preminted().then(response => String(response))

//0 inputs, read

const chadToMinted = async (chadID) => await contract.chadToMinted(chadID).then(response => String(response))
const chadToSupers = async (chadID) => await contract.chadToSupers(chadID).then(response => String(response))
const getShuffledTokenID = async (superID) => await contract.getShuffledTokenID(superID).then(response => String(response))
const id2UpgradeArray = async (superID) => await contract.id2UpgradeArray(superID).then(response => String(response))

//one input, read                                                    

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
    returnTotalVotesForCandidateIDNumber,
    voteWithEggByCandidateNumber,
    voteOneEggForEachCandidate,
    prizeMoneyTotalWei,
    eggBurntTotalWei,
    allVotesTotalBase,
    totalVotesFromVoterAddress,
    votingTimeLeftBlockTimestampHours,
    addressTotalVotesForIDNumber
    
  }
}
