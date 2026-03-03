import { ref, onUnmounted } from 'vue'

export function useSpeechRecognition() {
  const transcript = ref('')
  const isListening = ref(false)
  const isSupported = ref(
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
  const error = ref<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recognition: any = null

  if (isSupported.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognition = new SpeechRecognitionClass()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      transcript.value = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => result[0].transcript)
        .join('')
    }

    recognition.onend = () => {
      isListening.value = false
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      error.value = event.error
      isListening.value = false
    }
  }

  function start() {
    if (!recognition) return
    transcript.value = ''
    error.value = null
    try {
      recognition.start()
      isListening.value = true
    } catch (_e) {
      // Already started
    }
  }

  function stop() {
    if (!recognition) return
    try {
      recognition.stop()
    } catch (_e) {
      // Already stopped
    }
    isListening.value = false
  }

  onUnmounted(() => {
    if (recognition && isListening.value) {
      try { recognition.stop() } catch (_e) { /* ignore */ }
    }
  })

  return { transcript, isListening, isSupported, error, start, stop }
}
