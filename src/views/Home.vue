<script setup>
import { toRefs, ref, computed } from 'vue'
import { useAsyncState, useEventBus, useToggle, useFetch } from '@vueuse/core'
import { useChadsContract, useSupersContract, useVialsContract, useUser, useThirdContract } from '@/composables'
import { notify } from 'notiwind'
import { candidateIds, randomize } from '@/utils'

const candidates = ref(randomize(candidateIds))

const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')
const { address, isAuthenticated, isAuthenticating, login } = useUser()
const { SbalanceOf, Ssymbol } = useSupersContract(address)
const { CbalanceOf, Csymbol } = useChadsContract(address)
//could display total Chads owned

const { upgradeChad, fVialsBurned, nVialsBurned, vialsBurned, fVialsSet, vialToF, chadToMinted } = useThirdContract(address)
//upgradeChad gets a button far right
//fVialsSet, chadToMinted dummy checks. 
//if VialToF = true, vials is type F, else type N
//fVialsBurned, nVialsBurned, vialsBurned     
//can do double display like N Vials Burned 12/2494
//preminted = totalVials; 6 = totalVialsF; (preminted-6) = totalVialsN

const { VsetApprovalForAll, Vsymbol, VbalanceOf, VisApprovedForAll } = useVialsContract(address)
//VsetApprovalForAll for approval button two modes. VisApprovedForAll double checks approval
// Vsymbol to display info
// VbalanceOf could use to check ownership and also use joepegs api, display total owned
//joepegs api can get images of individual Chads and Vials from 'metadata' https://joepegs.dev/api#tag/Collections/operation/get_item_v2_collections__collection_address__tokens__token_id__get
//same here, plus check all tokens owned, for use in our drop down menu https://joepegs.dev/api#tag/Users/operation/get_user_items_v2_users__address__items_get



const isImageLoaded = ref(false)
const emit = defineEmits(['load'])
const loadState = async () => {
  try {
    const [userState, votes, backend, metadata] = await Promise.all([
      loadUserState(),
      returnTotalVotesForCandidateIDNumber(candidate.value.id),
      useFetch(`https://api.chikn.farm/api/chikn/details/${candidate.value.token}`).get().json(),
      useFetch(`https://api.chikn.farm/api/chikn/metadata/${candidate.value.token}`).get().json()
    ])

    return Promise.resolve({
      votes,
      backend: backend.data.value,
      metadata: metadata.data.value,
      userState
    })
  } catch (error) {
    console.log(error)
  }
}





const loadVApprovalState = async () => {
  if (!isAuthenticated.value) return Promise.resolve({ fVialsSet: false, Vbalances: 0, Vsymbol: 'Vials', Vapproval: false, Cbalances: 0, Csymbol: 'Chads', Sbalances: 0, Ssymbol: 'Supers', fVialsBurned: 0, nVialsBurned: 0, vialsBurned: 0 })
  try {
    const [ _fVialsSet, _Vbalances, _Vsymbol, _Vapproval, _Cbalances, _Csymbol, _Sbalances, _Ssymbol, _fVialsBurned, _nVialsBurned, _vialsBurned ] = await Promise.all([fVialsSet(), VbalanceOf(), Vsymbol(), loadUserVApproval(), CbalanceOf(), Csymbol(), SbalanceOf(), Ssymbol(), fVialsBurned(), nVialsBurned(), vialsBurned()])

    return Promise.resolve({
      fVialsSet: _fVialsSet,
      Vbalances: _Vbalances,
      Vsymbol: _Vsymbol,
      Vapproval: _Vapproval,
      Cbalances: _Cbalances,
      Csymbol: _Csymbol,
      Sbalances: _Sbalances,
      Ssymbol: _Ssymbol,
      fVialsBurned: _fVialsBurned,
      nVialsBurned: _nVialsBurned,
      vialsBurned: _vialsBurned
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
    const [fVialsBurned, nVialsBurned, vialsBurned, preminted, vialToF, user] = await Promise.all([fVialsBurned(), nVialsBurned(), vialsBurned(), preminted(), vialToF(), loadUserState()])

    return Promise.resolve({
      fVialsBurned, 
      nVialsBurned, 
      vialsBurned, 
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
    const tx = await VsetApprovalForAll(_VapprovalBool)
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'Vials Approval',
      text: `${_VapprovalBool === false ? 'Revoked' : 'Approved'} $${VapprovalState.value.Vsymbol} Approval For All`
    })
    loadUserVApproval()
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

const upgradePending = ref(false)
const upgradeTheChad = async () => {
  upgradePending.value = true
  try {
    const tx = await upgradeChad()
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'Upgrading',
      text: `Chad Upgraded: Burned Vial And Received Super`
    })
    emitAppEvent({ type: 'VtokensChanged' })

    return Promise.resolve(receipt)
  } catch (error) {
    notify({
      type: 'error',
      title: 'Upgrading',
      text: error.reason ?? error.message
    })
  } finally {
    upgradePending.value = false
  }
}

const onCandidateLoad = (candidate) => {
  const index = candidates.value.findIndex(t => t.token === candidate.token)
  candidates.value[index] = {
    ...candidates.value[index],
    ...candidate
  }
}

const candidatesSorted = computed(() => candidates.value.sort((a, b) => b.votes - a.votes))


const [chadChecker, toggleChadChecker] = useToggle(false)

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

const upgradeChadPending = ref(false)
let chadID = ref(0)
let vialID = ref(0)


</script>





<template>
  <div class="self-center w-full py-12 px-2 max-w-[1400px] mx-auto px-4">
    <div class="flex flex-wrap justify-between items-center">
      <div class="text-center mx-auto md:mx-0 font-celaraz">
        <div class="font-black text-5xl text-blue-300">
          THE LAB
        </div>
        <div class="text-2xl text-blue-300">
          Burn Vials
        </div>
        <div class="mt-2 mb-8 text-xs text-blue-200">
          Upgrade Chad Doge to get a Super
        </div>
      </div>



      <template v-if="isAuthenticated">
        <div class="max-w-[300px] text-center grid gap-4 mx-auto md:mx-0">
          <Button
            :loading="VapprovalPending"
            :disabled="VapprovalPending || !isAuthenticated || isAuthenticating"
            @click="VapprovalState.Vapproval === false ? setVApprovalForAll(true) : setVApprovalForAll(false)"
          >
            {{ VapprovalState.Vapproval === false ? 'Approve' : 'Revoke' }} All ${{ VapprovalState.Vsymbol }}
          </Button>
          <Button @click="toggleChadChecker()">
            Open ChadChecker
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
        <div class="font-bold">  {{ VapprovalState.vialsBurned }} of 2185</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Type-N Burned</div>
        <div class="font-bold"> {{ VapprovalState.nVialsBurned }} of 2179</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Type-F Burned</div>
        <div class="font-bold"> {{ VapprovalState.fVialsBurned }} of 6 </div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Chads Owned</div>
        <div class="font-bold"> {{ VapprovalState.Cbalances }} </div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Vials Owned</div>
        <div class="font-bold"> {{ VapprovalState.Vbalances }} </div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Supers Owned</div>
        <div class="font-bold"> {{ VapprovalState.Sbalances }} </div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">SELECT YOUR DOGE : </div>
      <div class="flex items-center justify-between gap-1">
          <div class="self-end">
            <div class="text-xs">
              CHAD DOGE ID  
            </div>
            <div class="text-gold-500 max-w-[100px]">
              <input type="number" min="0" class="input input--default text-center" v-model="chadID" />
            </div>
        </div>        </div>
      </div>

      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">SELECT YOUR VIAL :</div>

      <div class="flex items-center justify-between gap-1">
          <div class="self-end">
            <div class="text-xs">
              VIAL ID
            </div>
            <div class="text-gold-500 max-w-[100px]">
              <input type="number" min="0" class="input input--default text-center" v-model="vialID" />
            </div>
          </div>
          
              </div>
      </div>

      <div class="text-right self-end">
            <Button
              :disabled="!VapprovalState.Vapproval || !VapprovalState.Cbalances > 0 || !VapprovalState.Vbalances > 0 || !VapprovalState.fVialsSet"
              :loading="upgradePending"
              @click="upgradeChad(vialID, chadID)"
            >
            ENTER WITH CAUTION
            </Button>
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

    <!---was going to try to get api working to get images of chads into square boxes-->


    
    <!---<div class="relative p-4 bg-gradient-to-tr from-red-200/10 rounded-3xl leading-none min-h-[200px] grid items-center">
    <LoadingOverlay v-if="isLoading" />

    <div v-else class="flex items-center gap-2">
      <a :href="state.metadata.image" target="_blank" class="sm:min-w-[200px] flex-1">
        <Transition name="fade">
          <img
            :src="state.metadata.image"
            class="rounded-2xl sm:max-w-[200px] mx-auto"
            @load="onImageLoad"
            v-show="isImageLoaded"
          />
        </Transition>
      </a>

    <div class="flex-1 grid gap-2 w-full">
        <div>
          <span class="text-gold-500 font-celaraz font-light">{{ state.backend.name }}</span>
          <div class="mt-1 text-xs">
            Total votes: <span class="text-gold-500">{{ state.votes }}</span>
          </div>
          <div v-if="isAuthenticated" class="text-xs">
            My votes: <span class="text-gold-500">{{ state.userState }}</span>
          </div>
          <div class="text-xs mt-2">
            Candidate ID: <span class="text-gold-500">{{ candidate.id }}</span>
          </div>
          <div class="text-xs">
            Token ID: <span class="text-gold-500">{{ candidate.token }}</span>
          </div>
        </div>
        <div class="text-xs text-justify text-red-100/80 min-h-[30px] italic">
          {{ state.backend.lore ?? 'No bio present' }}
        </div>

        <div class="flex items-center justify-between gap-1">
          <div class="self-end">
            <div class="text-xs">
              ${{ allowance.symbol }} amount
            </div>
            <div class="text-gold-500 max-w-[100px]">
              <input type="number" min="0" class="input input--default text-center" v-model="eggCount" />
            </div>
          </div>
          <div class="text-right self-end">
            <Button
              :disabled="!eggCount || !allowance.allowance || votePending"
              :loading="votePending"
              @click="vote(candidate.id, eggCount)"
            >
              Vote
            </Button>
          </div>
        </div>
      </div>  
    </div>  -->




    <!---<div class="relative p-4 bg-gradient-to-tr from-red-200/10 rounded-3xl leading-none min-h-[200px] grid items-center">
    <LoadingOverlay v-if="isLoading" />

    <div v-else class="flex items-center gap-2">
      <a :href="state.metadata.image" target="_blank" class="sm:min-w-[200px] flex-1">
        <Transition name="fade">
          <img
            :src="state.metadata.image"
            class="rounded-2xl sm:max-w-[200px] mx-auto"
            @load="onImageLoad"
            v-show="isImageLoaded"
          />
        </Transition>
      </a>

    <div class="flex-1 grid gap-2 w-full">
        <div>
          <span class="text-gold-500 font-celaraz font-light">{{ state.backend.name }}</span>
          <div class="mt-1 text-xs">
            Total votes: <span class="text-gold-500">{{ state.votes }}</span>
          </div>
          <div v-if="isAuthenticated" class="text-xs">
            My votes: <span class="text-gold-500">{{ state.userState }}</span>
          </div>
          <div class="text-xs mt-2">
            Candidate ID: <span class="text-gold-500">{{ candidate.id }}</span>
          </div>
          <div class="text-xs">
            Token ID: <span class="text-gold-500">{{ candidate.token }}</span>
          </div>
        </div>
        <div class="text-xs text-justify text-red-100/80 min-h-[30px] italic">
          {{ state.backend.lore ?? 'No bio present' }}
        </div>

        <div class="flex items-center justify-between gap-1">
          <div class="self-end">
            <div class="text-xs">
              ${{ allowance.symbol }} amount
            </div>
            <div class="text-gold-500 max-w-[100px]">
              <input type="number" min="0" class="input input--default text-center" v-model="eggCount" />
            </div>
          </div>
          <div class="text-right self-end">
            <Button
              :disabled="!eggCount || !allowance.allowance || votePending"
              :loading="votePending"
              @click="vote(candidate.id, eggCount)"
            >
              Vote
            </Button>
          </div>
        </div>
      </div>  
    </div>  -->





<!---
    <div class="relative p-4 bg-gradient-to-tr from-red-200/10 rounded-3xl leading-none min-h-[200px] grid items-center">
    <LoadingOverlay v-if="isLoading" />

    <div v-else class="flex items-center gap-2">
      <a :href="state.metadata.image" target="_blank" class="sm:min-w-[200px] flex-1">
        <Transition name="fade">
          <img
            :src="state.metadata.image"
            class="rounded-2xl sm:max-w-[200px] mx-auto"
            @load="onImageLoad"
            v-show="isImageLoaded"
          />
        </Transition>
      </a>

    <div class="flex-1 grid gap-2 w-full">
        <div>
          <span class="text-gold-500 font-celaraz font-light">{{ state.backend.name }}</span>
          <div class="mt-1 text-xs">
            Total votes: <span class="text-gold-500">{{ state.votes }}</span>
          </div>
          <div v-if="isAuthenticated" class="text-xs">
            My votes: <span class="text-gold-500">{{ state.userState }}</span>
          </div>
          <div class="text-xs mt-2">
            Candidate ID: <span class="text-gold-500">{{ candidate.id }}</span>
          </div>
          <div class="text-xs">
            Token ID: <span class="text-gold-500">{{ candidate.token }}</span>
          </div>
        </div>
        <div class="text-xs text-justify text-red-100/80 min-h-[30px] italic">
          {{ state.backend.lore ?? 'No bio present' }}
        </div>

        <div class="flex items-center justify-between gap-1">
          <div class="self-end">
            <div class="text-xs">
              ${{ allowance.symbol }} amount
            </div>
            <div class="text-gold-500 max-w-[100px]">
              <input type="number" min="0" class="input input--default text-center" v-model="eggCount" />
            </div>
          </div>
          <div class="text-right self-end">
            <Button
              :disabled="!eggCount || !allowance.allowance || votePending"
              :loading="votePending"
              @click="vote(candidate.id, eggCount)"
            >
              Vote
            </Button>
          </div>
        </div>
      </div>  
    </div>  -->






    <div class="mt-2 grid md:grid-cols-2 xl:grid-cols-3 gap-2">
      <Candidate 
        v-for="candidate in candidateIds"
        :key="candidate.id"
        :candidate="candidate"
        :allowance="allowanceState"
        @load="onCandidateLoad"
      />
    </div> 
    <Transition name="fade">
      <ChadChecker v-if="chadChecker" :scores="candidatesSorted" @close="toggleChadChecker()" />
    </Transition>
  </div>
</template>
