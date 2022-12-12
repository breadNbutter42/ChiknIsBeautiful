<script setup>
import { ref, computed } from 'vue'
import { useAsyncState, useEventBus, useToggle } from '@vueuse/core'
import { useChadsContract, useSupersContract, useVialsContract, useUpgradesContract, useUser, useThirdContract } from '@/composables'
import { notify } from 'notiwind'

const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')
const { address, isAuthenticated, isAuthenticating, login } = useUser()

const { SbalanceOf, Sname, Ssymbol, } = useSupersContract(address)
//could display total Supers owned

const { CbalanceOf, Cname, Csymbol } = useChadsContract(address)
//could display total Chads owned

const { upgradeChad, fVialsBurned, nVialsBurned, vialsBurned, fVialsSet, preminted, vialToF, chadToMinted } = useThirdContract(address)
//upgradeChad gets a button far right
//fVialsSet, chadToMinted dummy checks. 
//if VialToF = true, vials is type F, else type N
//fVialsBurned, nVialsBurned, vialsBurned     
//can do double display like N Vials Burned 12/2494
//preminted = totalVials; 6 = totalVialsF; (preminted-6) = totalVialsN

const { VsetApprovalForAll, Vname, Vsymbol, VbalanceOf, VgetOwnershipDataVIAL, VisApprovedForAll } = useVialsContract(address)
//VsetApprovalForAll for approval button two modes. VisApprovedForAll double checks approval
// Vname, Vsymbol to display info
// VbalanceOf, VgetOwnershipDataVIAL, could use to check ownership or use joepegs api, display total owned
//joepegs api can get images of individual Chads and Vials from 'metadata' https://joepegs.dev/api#tag/Collections/operation/get_item_v2_collections__collection_address__tokens__token_id__get
//same here, plus check all tokens owned, for use in our drop down menu https://joepegs.dev/api#tag/Users/operation/get_user_items_v2_users__address__items_get


const VloadApprovalState = async () => {
  try {
    const [ _Vsymbol, _Vapproval] = await Promise.all([Vsymbol(), VloadUserApproval()])

    return Promise.resolve({
      Vsymbol: _Vsymbol,
      Vapproval: _Vapproval
    })
  } catch (error) {
    notify({
      type: 'error',
      title: 'Vials Approval State',
      text: error.reason ?? error.message
    })
  }
}

const VloadUserApproval = async () => {
  if (!isApproved.value) return false

  const _Vapproval = await VisApprovedForAll()
  return Promise.resolve(_Vapproval)
}

const { state: approvalState, execute: loadApproval } = useAsyncState(() => loadApprovalState(), {}, { resetOnExecute: false })

const loadThirdContractState = async () => {
  try {
    const [fVialsBurned, nVialsBurned, vialsBurned, fVialsSet, preminted, vialToF, user] = await Promise.all([fVialsBurned(), nVialsBurned(), vialsBurned(), fVialsSet(), preminted(), vialToF(), loadUserState])

    return Promise.resolve({
      fVialsBurned, 
      nVialsBurned, 
      vialsBurned, 
      fVialsSet, 
      preminted, 
      vialToF,
      ...user
    })
  } catch (error) {
    console.log(error)
  }
}

const loadUserState = async () => {
  if (!isAuthenticated.value) return Promise.resolve({ Cbalance: 0, Vbalance: 0, Sbalance: 0 })
  try {
    const [Cbalance, Vbalance, Sbalance] = await Promise.all([CbalanceOf(), VbalanceOf(), SbalanceOf()])

    return Promise.resolve({ Cbalance, Vbalance, Sbalance })
  } catch (error) {
    console.log(error)
  }
}

const { state, execute: loadStats } = useAsyncState(() => loadThirdContractState(), {}, { resetOnExecute: false })


const VapprovalPending = ref(false)
const setVApprovalForAll = async (_VapprovalBool) => {
  VapprovalPending.value = true
  try {
    const tx = await Vapprove(_VapprovalBool)
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'Vials Approval',
      text: `${_VapprovalBool === false ? 'Revoked' : 'Approved'} $${approvalState.value.symbol} Vials (Approval For All)`
    })
    emitAppEvent({ type: 'VtokensChanged' })

    return Promise.resolve(receipt)
  } catch (error) {
    notify({
      type: 'error',
      title: 'Approval',
      text: error.reason ?? error.message
    })
  } finally {
    VapprovalPending.value = false
  }
}

const upgradeChadPending = ref(false)
const upgradeChad = async () => {
  upgradeChadPending.value = true
  try {
    const tx = await upgradeChad()
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'UpgradingChad',
      text: `Chad Upgraded : Super Created`
    })
    emitAppEvent({ type: 'VtokensChanged' })

    return Promise.resolve(receipt)
  } catch (error) {
    notify({
      type: 'error',
      title: 'UpgradingChad',
      text: error.reason ?? error.message
    })
  } finally {
    upgradeChadPending.value = false
  }
}

/*
const onCandidateLoad = (candidate) => {
  const index = candidates.value.findIndex(t => t.token === candidate.token)
  candidates.value[index] = {
    ...candidates.value[index],
    ...candidate
  }
}

const candidatesSorted = computed(() => candidates.value.sort((a, b) => b.votes - a.votes))

const [leaderboard, toggleLeaderboard] = useToggle(false)
*/

onAppEvent(({ type }) => {
  const events = {
    'accountsChanged': () => {
      loadApproval()
      loadStats()
    },
    'VtokensChanged': () => {
      loadApproval()
      loadStats()
    }
  }
  
  events[type]?.() ?? null
})
</script>

<template>
  <div class="self-center w-full py-12 px-2 max-w-[1400px] mx-auto px-4">
    <div class="flex flex-wrap justify-between items-center">
      <div class="text-center mx-auto md:mx-0 font-celaraz">
        <div class="font-black text-5xl text-blue-300">
          Upgrade Chad Doge with DNA Vial to receive a 1:1 Supers
        </div>
        <div class="text-2xl text-blue-300">
          Community $EGG Burn Vote
        </div>
        <div class="mt-2 mb-8 text-xs text-blue-200">
          Voting Ended
        </div>
      </div>
      
      <template v-if="isAuthenticated">
        <div class="max-w-[300px] text-center grid gap-4 mx-auto md:mx-0">
          <Button
            :loading="VapprovalPending"
            :disabled="VapprovalPending || !isAuthenticated || isAuthenticating"
            @click="approvalState.approval === 0 ? setApprove(1000) : setApprove(0)"
          >
            {{ approvalState.approval === 0 ? 'Approve' : 'Revoke' }} ${{ approvalState.symbol }} spending
          </Button>
          <Button
            :disabled="!approvalState.approval"
            @click="upgradeChad()"
          >
            Vote 1 $EGG for every candidate
          </Button>
          <Button @click="toggleLeaderboard()">
            Open leaderboard
          </Button>
        </div>
      </template>
      <template v-else>
        <div class="max-w-[300px] grid gap-4 text-center mx-auto md:mx-0">
          <Button
            :loading="isAuthenticating"
            :disabled="isAuthenticating"
            @click="login()"
          >
            Connect to vote
          </Button>
          <Button @click="toggleLeaderboard()">
            Open leaderboard
          </Button>
        </div>
      </template>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">You voted</div>
        <div class="font-bold">{{ state.addressVotes }}</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">All votes cast</div>
        <div class="font-bold">{{ state.votes }}</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Hours left</div>
        <div class="font-bold">{{ state.timestamp }}</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">$EGG balance</div>
        <div class="font-bold">{{ state.balance }} $EGG</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Prize wallet</div>
        <div class="font-bold">{{ Number(state.prize).toFixed(0) }} $EGG</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Total $EGG burnt</div>
        <div class="font-bold">{{ Number(state.burned).toFixed(0) }} $EGG</div>
      </div>
    </div>
    <div class="mt-4 text-xs text-center flex flex-wrap gap-2 md:gap-6 italic">
      <div class="text-blue-200">
        One $EGG = One Vote
      </div>
      <div class="text-blue-200">
        Top 10 Chikns with the most votes advance to the final round
      </div>
    </div>
    <div class="mt-2 grid md:grid-cols-2 xl:grid-cols-3 gap-2">
      <Candidate 
        v-for="candidate in candidateIds"
        :key="candidate.id"
        :candidate="candidate"
        :approval="approvalState"
        @load="onCandidateLoad"
      />
    </div>
    <Transition name="fade">
      <Leaderboard v-if="leaderboard" :scores="candidatesSorted" @close="toggleLeaderboard()" />
    </Transition>
  </div>
</template>
