import { ref } from 'vue'
import { useSpeechRecognition } from './useSpeechRecognition'
import { BacklogItemType, Priority, BacklogItemStatus } from '../types'
import type { CreateBacklogItem } from '../types'

type ConversationState =
  | 'IDLE'
  | 'LISTENING_COMMAND'
  | 'ASKING_DESCRIPTION'
  | 'LISTENING_DESCRIPTION'
  | 'ASKING_PRIORITY'
  | 'LISTENING_PRIORITY'
  | 'CREATING'
  | 'DONE'
  | 'CANCELLED'

export function useVoiceConversation() {
  const state = ref<ConversationState>('IDLE')
  const parsedType = ref<BacklogItemType>(BacklogItemType.Bug)
  const parsedTitle = ref('')
  const parsedDescription = ref<string | undefined>()
  const parsedPriority = ref<Priority>(Priority.None)
  const statusMessage = ref('')
  const isActive = ref(false)
  const liveTranscript = ref('')

  const { transcript, isListening, isSupported, start: startSTT, stop: stopSTT } = useSpeechRecognition()

  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve()
        return
      }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
      statusMessage.value = text
    })
  }

  function listenForResponse(timeoutMs: number = 5000): Promise<string> {
    return new Promise((resolve) => {
      startSTT()
      let resolved = false

      const checkInterval = setInterval(() => {
        liveTranscript.value = transcript.value
        if (!isListening.value && transcript.value) {
          clearInterval(checkInterval)
          if (!resolved) {
            resolved = true
            resolve(transcript.value)
          }
        }
      }, 200)

      setTimeout(() => {
        clearInterval(checkInterval)
        stopSTT()
        if (!resolved) {
          resolved = true
          resolve(transcript.value || '')
        }
      }, timeoutMs)
    })
  }

  function parseCommand(text: string): { type: BacklogItemType; title: string } {
    const lower = text.toLowerCase().trim()
    if (lower.startsWith('add bug ')) return { type: BacklogItemType.Bug, title: text.substring(8).trim() }
    if (lower.startsWith('add feature ')) return { type: BacklogItemType.Feature, title: text.substring(12).trim() }
    if (lower.startsWith('add task ')) return { type: BacklogItemType.Task, title: text.substring(9).trim() }
    return { type: BacklogItemType.Bug, title: text.trim() }
  }

  function parsePriorityResponse(text: string): Priority {
    const lower = text.toLowerCase()
    if (lower.includes('critical')) return Priority.Critical
    if (lower.includes('high')) return Priority.High
    if (lower.includes('medium')) return Priority.Medium
    if (lower.includes('low')) return Priority.Low
    return Priority.None
  }

  function isSkipOrNo(text: string): boolean {
    const lower = text.toLowerCase().trim()
    return ['skip', 'no', 'nope', 'next', 'none'].includes(lower)
  }

  function isCancel(text: string): boolean {
    return text.toLowerCase().trim() === 'cancel'
  }

  async function startConversation(): Promise<CreateBacklogItem | null> {
    isActive.value = true
    liveTranscript.value = ''

    // Step 1: Listen for command
    state.value = 'LISTENING_COMMAND'
    statusMessage.value = 'Listening... Say "add bug", "add feature", or "add task" followed by the title'
    const commandText = await listenForResponse(10000)

    if (!commandText || isCancel(commandText)) {
      cancel()
      return null
    }

    const { type, title } = parseCommand(commandText)
    parsedType.value = type
    parsedTitle.value = title

    // Step 2: Ask for description
    state.value = 'ASKING_DESCRIPTION'
    await speak(`${type}: ${title}. Want to add a description?`)

    state.value = 'LISTENING_DESCRIPTION'
    liveTranscript.value = ''
    const descResponse = await listenForResponse(8000)

    if (isCancel(descResponse)) { cancel(); return null }
    if (descResponse && !isSkipOrNo(descResponse)) {
      let descText = descResponse
      if (descText.toLowerCase().startsWith('yes')) {
        descText = descText.substring(3).trim()
        if (descText.startsWith(',') || descText.startsWith('.')) {
          descText = descText.substring(1).trim()
        }
      }
      if (descText && !isSkipOrNo(descText)) {
        parsedDescription.value = descText
      }
    }

    // Step 3: Ask for priority
    state.value = 'ASKING_PRIORITY'
    await speak('Priority?')

    state.value = 'LISTENING_PRIORITY'
    liveTranscript.value = ''
    const priorityResponse = await listenForResponse(5000)

    if (isCancel(priorityResponse)) { cancel(); return null }
    if (priorityResponse && !isSkipOrNo(priorityResponse)) {
      parsedPriority.value = parsePriorityResponse(priorityResponse)
    }

    // Step 4: Create
    state.value = 'CREATING'
    const result: CreateBacklogItem = {
      type: parsedType.value,
      title: parsedTitle.value,
      description: parsedDescription.value,
      priority: parsedPriority.value,
      status: BacklogItemStatus.Backlog
    }

    state.value = 'DONE'
    await speak(`Created ${type}: ${title}, priority ${parsedPriority.value}.`)

    // Reset
    isActive.value = false
    state.value = 'IDLE'
    parsedDescription.value = undefined
    parsedPriority.value = Priority.None

    return result
  }

  function cancel() {
    stopSTT()
    window.speechSynthesis?.cancel()
    state.value = 'CANCELLED'
    isActive.value = false
    statusMessage.value = 'Cancelled'
    setTimeout(() => { state.value = 'IDLE' }, 1000)
  }

  return {
    state, statusMessage, isActive, isSupported, liveTranscript,
    parsedType, parsedTitle, parsedDescription, parsedPriority,
    isListening,
    startConversation, cancel
  }
}
