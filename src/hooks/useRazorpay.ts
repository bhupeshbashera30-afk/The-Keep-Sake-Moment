/**
 * Lazily loads the Razorpay checkout script only when needed.
 * Call this hook inside your checkout component, not globally.
 *
 * Usage:
 *   const loadRazorpay = useRazorpay()
 *   const handleCheckout = async () => {
 *     const loaded = await loadRazorpay()
 *     if (!loaded) { alert('Failed to load payment gateway'); return }
 *     const rzp = new (window as any).Razorpay({ ... options ... })
 *     rzp.open()
 *   }
 */
export function useRazorpay() {
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // If already loaded, resolve immediately
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }

      // Check if script tag already exists (avoid duplicates)
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      )
      if (existing) {
        existing.addEventListener('load', () => resolve(true))
        existing.addEventListener('error', () => resolve(false))
        return
      }

      // Dynamically inject the script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  return loadRazorpay
}
