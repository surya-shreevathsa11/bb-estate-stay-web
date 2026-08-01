function unwrapPayload(data) {
  if (data == null || typeof data !== 'object') return data
  if (data.data && typeof data.data === 'object') return data.data
  return data
}

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve()
      return
    }
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Payment script failed to load')))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.dataset.razorpayCheckout = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Razorpay checkout'))
    document.body.appendChild(s)
  })
}

/**
 * Open Razorpay from a payments/order response.
 * @returns {Promise<{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }>}
 */
export async function openRazorpayCheckout(orderRaw, prefill = {}) {
  const data = unwrapPayload(orderRaw)

  const redirectUrl = data?.redirectUrl || data?.checkoutUrl || data?.url
  if (typeof redirectUrl === 'string' && redirectUrl.startsWith('http')) {
    window.location.href = redirectUrl
    return new Promise(() => {})
  }

  const orderId =
    data?.orderId ??
    data?.order_id ??
    data?.razorpayOrderId ??
    data?.razorpay_order_id
  const key =
    data?.key ??
    data?.razorpayKeyId ??
    data?.razorpay_key_id ??
    import.meta.env.VITE_RAZORPAY_KEY_ID

  if (!orderId || !key) {
    throw new Error('Payment session could not be started. Please try again later.')
  }

  await loadRazorpayScript()

  const amount =
    data?.amount ??
    data?.amountInPaise ??
    (typeof data?.amountInRupees === 'number' ? Math.round(data.amountInRupees * 100) : undefined) ??
    (typeof data?.expectedPrepaidAmount === 'number'
      ? Math.round(data.expectedPrepaidAmount * 100)
      : undefined)

  return new Promise((resolve, reject) => {
    const options = {
      key: String(key),
      order_id: String(orderId),
      currency: data?.currency || 'INR',
      name: 'BB Estate Stay',
      description: 'Homestay booking',
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: String(prefill.phone || '').replace(/\D/g, ''),
      },
      handler(response) {
        resolve({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment cancelled.'))
        },
      },
    }
    if (amount != null && !Number.isNaN(Number(amount))) {
      options.amount = String(amount)
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  })
}
