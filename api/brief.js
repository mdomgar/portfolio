import { Resend } from 'resend'
import { createBriefHandler } from '../server/briefHandler.js'

let resend
const handleBrief = createBriefHandler({
  // Created on the first request: `new Resend()` throws when RESEND_API_KEY is missing,
  // and the handler turns that into a 500 instead of crashing the function at import time.
  getResend: () => (resend ??= new Resend(process.env.RESEND_API_KEY)),
  env: process.env,
})

export default { fetch: handleBrief }
