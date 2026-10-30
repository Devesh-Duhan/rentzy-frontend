export const GOOGLE_SIGNIN_TIMEOUTS = { popup: 120000, token: 20000, exchange: 30000 };

function waitForAuth(operation, timeout, message, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', cancel); };
    const fail = error => { cleanup(); reject(error); };
    const cancel = () => fail(Object.assign(new Error('Sign-in cancelled'), { name: 'AbortError' }));
    if (signal?.aborted) { cancel(); return; }
    signal?.addEventListener('abort', cancel, { once: true });
    timer = setTimeout(() => fail(new Error(message)), timeout);
    // Invoke synchronously so the popup keeps the browser's click/user gesture.
    try { Promise.resolve(operation()).then(value => { cleanup(); resolve(value); }, fail); } catch (error) { fail(error); }
  });
}

export async function runGoogleSignIn({ popup, exchange, onStage = () => {}, signal, timeouts = GOOGLE_SIGNIN_TIMEOUTS }) {
  onStage('Opening Google…');
  const result = await waitForAuth(popup, timeouts.popup, 'Google sign-in did not finish. Close the Google window and try again.', signal);
  signal?.throwIfAborted();
  onStage('Verifying account…');
  const token = await waitForAuth(() => result.user.getIdToken(), timeouts.token, 'Google could not verify your account. Check your connection and try again.', signal);
  signal?.throwIfAborted();
  if (typeof token !== 'string' || !token) throw new Error('Google did not return a valid sign-in token. Please try again.');
  onStage('Signing in…');
  return waitForAuth(() => exchange(token), timeouts.exchange, 'The login server did not respond. Please try again.', signal);
}
