<script setup>
import { toRefs, computed, ref } from 'vue'//reactive object to plain object,
import { useAsyncState, useEventBus, useFetch } from '@vueuse/core'//wait for reply, events, ask for reply
import { useThirdContract, useUser } from '@/composables'//use our contract, use user
import { notify } from 'notiwind'//notifications

const { address, isAuthenticated } = useUser()//check if user is signed in to wallet
const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')//emit events
const { chadToMinted } = useThirdContract(address)//functions within our contract from a particular contract address

const props = defineProps(['candidate', 'Vapproval'])//key -> value pairs https://vuejs.org/guide/components/props.html for keys candidate and allowance to their values
const { candidate, Vapproval } = toRefs(props)//turn variables from reactive to normal




const isImageLoaded = ref(false)//we prepare to fetch data w async so we start with false state defined for isExampleLoaded
const emit = defineEmits(['load'])//emit the message that we are loading the page


const loadUserState = async () => {//make a variable loadUserState which will store the info returned below
  if (!isAuthenticated.value) return Promise.resolve(0)//if user is not signed in then resolve promise by returning a 0 as value, otherwise continue. This fixes errors.

  const data = await addressTotalVotesForIDNumber(candidate.value.id)//make a variable data that stores results fetch to our on chain function; we defined which functon above
  //this particular function requires two inputs, user address and candidate id, we have defined this function elsewhere and told it to also add in the user address whichis not shown here above
  return Promise.resolve(data)//return data from our on chain function
}




const loadState = async () => {//make a variable loadState which will store the info returned below
  try {//try
    const [userState, votes, backend, metadata] = await Promise.all([//make four new variables at once
      loadUserState(),//call this variable above
      returnTotalVotesForCandidateIDNumber(candidate.value.id),//read this from on chain from our function we chose above, only needs to input that one variable to call function
      useFetch(`https://api.chikn.farm/api/chikn/details/${candidate.value.token}`).get().json(),//call api via web link with variable, get image link and traits etc
      useFetch(`https://api.chikn.farm/api/chikn/metadata/${candidate.value.token}`).get().json()//call api via web link with variable, get all kinds of chikn data
    ])

    return Promise.resolve({ //return the four variables data we just got
      votes,//loadUserState returns the addressTotalVotesForID value uint of votes
      backend: backend.data.value,//total votes for id number returns uint of votes
      metadata: metadata.data.value,//metadata of chikn including image link
      userState//data like if user owns chikn maybe
    })
  } catch (error) {//catch error
    console.log(error)//log error
  }
}



//this seems like the body of the code, above functions and variables are defined are defined



const { state, isLoading, execute } = useAsyncState(() => loadState(), 0, { immediate: false })  //set some state info for async to set up for the next thing

execute().then(() => {//call execute() promise and then() https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
  emit('load', { token: candidate.value.token, votes: state.value.votes, chiknName: state.value.backend.name }) //emit loading data token, votes, chiknName data get
})

const onImageLoad = () => isImageLoaded.value = true//load chikn image

const eggCount = ref(0)//set egg count stored in ref slot 0

const votePending = ref(false)//get ready for next thing



const vote = async (_id, _eggs) => {//write to the votewitheggsbycandidate function with variables as inputs
  votePending.value = true//pending
  try {//try
    const tx = await voteWithEggByCandidateNumber(Number(_id), Number(_eggs))//write transaction to function on chain, specify type and var
    const receipt = await tx.wait()//save receipt of transaction status after write
    notify({//notifications
      type: 'success',//type
      title: 'Voting',//title
      text: `Voted ${_eggs} $${allowance.value.symbol} for #${_id}`//text with 
    })
    emitAppEvent({ type: 'tokensChanged' })
    return Promise.resolve(receipt)
  } catch (error) {//catch errors
    notify({//error notify
      type: 'error',//type
      title: 'Voting',//title
      text: error.reason ?? error.message//text
    })
  } finally {//after that
    votePending.value = false//change status
  }
}


onAppEvent(({ type, payload }) => {//event logging?
  const events = {//declare events
    'tokensChanged': () => execute(),//tokenchanged execute
    'accountsChanged': () => {//accountschange
      if (isAuthenticated.value) execute()//if execute
    }
  }
  
  events[type]?.() ?? null//null
})

//end of script
</script>


<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">All Vials Burned</div>
        <div class="font-bold"> {{state.allVialsBurned}}  / 2185 Burned</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">N Vials Burned</div>
        <div class="font-bold"> {{state.nVialsBurned}}/ 2179 Type-N</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">F Vials Burned</div>
        <div class="font-bold"> {{state.fVialsBurned}}/ 6 Type-F</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Chads Owned</div>
        <div class="font-bold"> {{state.Cbalance}} CHADS</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Vials Owned</div>
        <div class="font-bold"> {{state.Vbalance}} VIALS</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs font-celaraz">Supers Owned</div>
        <div class="font-bold"> {{state.Sbalance}} SUPERS</div>
      </div>
  </div>  
  <!-- 0k -->
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