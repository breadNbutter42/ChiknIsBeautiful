<script setup>
import { toRefs, computed, ref } from 'vue'
import { useAsyncState, useEventBus, useFetch } from '@vueuse/core'
import { useFlatpegContract, useUser } from '@/composables'
import { notify } from 'notiwind'

const { address, isAuthenticated } = useUser()
const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')
//const { getOwnershipData } = useChadContract(address)
//add const to detect ownership to give error messages
//const { addressTotalVotesForIDNumber, returnTotalVotesForCandidateIDNumber, voteWithEggByCandidateNumber } = useVotingContract(address)
//old one

//const { getOwnershipData, isApprovedForAll, totalSupply, balanceOf } = useFlatpegContract(address)

//*** getOwnershipData returns tuple, grab just the first item in array the address and compare to wallet trying to send doge and show error
//isApprovedForAll check if can transfer vials to burn address
//totalSupply is also how many vials total initially, totalSupply-6 is amount of N vials initially, and 6 is amount of F vials initially unless some don't get minted
//balanceOf we can say how many tokens held by user at least, if not a whole list. Maybe we link to joepegs website,
//like https://joepegs.com/profile/0xE395C115657b636760AbDe037185C6C8E6948A72 but swap address for user address,
//can even do https://joepegs.com/profile/0xE395C115657b636760AbDe037185C6C8E6948A72?collections=%5B%220xe8e08c895a0da91b9fbab7da2d260cc17753b1ac%22%5D ,
//where the second address is the address fo the collection, and now we see all the nfts owned by a user from one collection

//const { chadToMinted, fVialsBurned, nVialsBurned, vialsBurned } = useThirdContract
//chadToMinted see if chad ID is already minted else throw error
//fVialsBurned, nVialsBurned, vialsBurned

///////////////////////////////////////////////////////////////////////////////////
//const props = defineProps(['candidate', 'allowance'])
//const { candidate, allowance } = toRefs(props)



/*
const isImageLoaded = ref(false)
const emit = defineEmits(['load'])

const loadUserState = async () => {
  if (!isAuthenticated.value) return Promise.resolve(0)

  const data = await getOwnershipData(candidate.value.id)
  return Promise.resolve(data)
}

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

const { state, isLoading, execute } = useAsyncState(() => loadState(), 0, { immediate: false })

execute().then(() => {
  emit('load', { token: candidate.value.token, votes: state.value.votes, chiknName: state.value.backend.name })
})

const onImageLoad = () => isImageLoaded.value = true

const eggCount = ref(0)
*/


const chadUpgradePending = ref(false)
const upgradeChad = async (_vialID, _chadID) => {
  chadUpgradePending.value = true
  try {
    const tx = await upgradeChad(Number(_vialID), Number(_chadID))
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'Upgrading',
      text: `Chad Upgraded: Super Created`
    })
    emitAppEvent({ type: 'ChadUpgraded' })

    return Promise.resolve(receipt)
  } catch (error) {
    notify({
      type: 'error',
      title: 'upgrading',
      text: error.reason ?? error.message
    })
  } finally {
    chadUpgradePending.value = false
  }
}

onAppEvent(({ type, payload }) => {
  const events = {
    'tokensChanged': () => execute(),
    'accountsChanged': () => {
      if (isAuthenticated.value) execute()
    }
  }
  
  events[type]?.() ?? null
})
</script>

<template>
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
    </div>

  </div>
</template>
