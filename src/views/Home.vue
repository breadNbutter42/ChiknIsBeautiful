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


const loadVApprovalState = async () => {
  try {
    const [ _Vsymbol, _Vapproval] = await Promise.all([Vsymbol(), loadUserVApproval()])

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

const loadUserVApproval = async () => {
  if (!isAuthenticated.value) return false

  const _Vapproval = await VisApprovedForAll()
  return Promise.resolve(_Vapproval)
}

const { state: VapprovalState, execute: loadVApproval } = useAsyncState(() => loadVApprovalState(), {}, { resetOnExecute: false })

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
      text: `${_VapprovalBool === false ? 'Revoked' : 'Approved'} $${VapprovalState.value.symbol} Vials (Approval For All)`
    })
    emitAppEvent({ type: 'VtokensChanged' })

    return Promise.resolve(receipt)
  } catch (error) {
    notify({
      type: 'error',
      title: 'VApproval',
      text: error.reason ?? error.message
    })
  } finally {
    VapprovalPending.value = false
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
*/

const [ChadChecker, toggleChadChecker] = useToggle(false)


onAppEvent(({ type }) => {
  const events = {
    'accountsChanged': () => {
      loadVApproval()
      loadStats()
    },
    'VtokensChanged': () => {
      loadVApproval()
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
          THE LAB
        </div>
      </div>
      <template v-if="isAuthenticated">
        <div class="max-w-[300px] text-center grid gap-4 mx-auto md:mx-0">
          <Button
            :loading="VapprovalPending"
            :disabled="VapprovalPending || !isAuthenticated || isAuthenticating"
            @click="VapprovalState.Vapproval === false ? setApprove(true) : setApprove(false)"
          >
            {{ VapprovalState.Vapproval === false ? 'Approve' : 'Revoke' }} ${{ VapprovalState.symbol }} burning
          </Button>
          <Button @click="toggleChadChecker()">
            ChadChecker
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
            Connect to upgrade
          </Button>
          <Button @click="toggleChadChecker()">
            Open ChadChecker
          </Button>
        </div>
      </template>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">All Vials Burned</div>
        <div class="font-bold"> / 2185 Burned</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">N Vials Burned</div>
        <div class="font-bold"> / 2179 Type-N</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">F Vials Burned</div>
        <div class="font-bold"> / 6 Type-F</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Chads Owned</div>
        <div class="font-bold"> CHADS</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Vials Owned</div>
        <div class="font-bold"> VIALS</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Supers Owned</div>
        <div class="font-bold">{{ state.Sbalance }} SUPERS</div>
      </div>
    </div>
    <div class="mt-4 text-xs text-center flex flex-wrap gap-2 md:gap-6 italic">
      <div class="text-blue-200">
        Check if Chad has been upgraded already with ChadChecker.
      </div>
      <div class="text-blue-200">
        Burn a vial to upgrade a Chad Doge and create a Super.
      </div>
    </div>
    <!---tests fine up to here if remove below-->
    <!---don't remove below for tests-->

    <Transition name="fade">
      <ChadChecker v-if="ChadChecker" :scores="candidatesSorted" @close="toggleChadChecker()" />
    </Transition>
  </div>
</template>
