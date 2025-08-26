import { ref, onMounted, onUnmounted } from 'vue'


const isBrowserTranslateActive = ref(false);
const isOnline = ref(navigator.onLine)

export function useOnlineStatus() {

  const updateStatus = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateStatus)
    window.removeEventListener('offline', updateStatus)
  })


  const refreshBrowserTranslateActive = () => {
    const isActivated = document.documentElement.classList.contains('translated-ltr')
      || document.documentElement.classList.contains('translated-rtl')
      || document.querySelector('iframe.goog-te-banner-frame') !== null

    isBrowserTranslateActive.value = isActivated && isOnline.value;
  }

  refreshBrowserTranslateActive();
  const window_ = window as unknown as { isUseTimer: boolean };

  if (!window_.isUseTimer) {
    window_.isUseTimer = true;
    setInterval(refreshBrowserTranslateActive, 1000);
  }

  return { isOnline, isBrowserTranslateActive }
}


