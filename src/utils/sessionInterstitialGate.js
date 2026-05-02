/** Max interstitials per app session (resets when the app process restarts). */
export const MAX_INTERSTITIALS_PER_SESSION = 3;

let shownThisSession = 0;
/** After ad cap is reached, share fallback is offered at most once per session. */
let shareFallbackConsumed = false;

export const getInterstitialsShownThisSession = () => shownThisSession;

export const getInterstitialsRemainingThisSession = () =>
  Math.max(0, MAX_INTERSTITIALS_PER_SESSION - shownThisSession);

/**
 * @typedef {'ad_shown' | 'ad_failed' | 'share_modal' | 'silent'} AdTriggerOutcome
 */

/**
 * Resolves what should happen at an ad trigger point (interstitial, share, or silent).
 * Store rate modal: disabled until app listing — restore in a later release (see AdTriggerFallbackContext).
 * Counts toward the cap only when an interstitial actually shows.
 *
 * @param {(opts: { timeoutMs?: number }) => Promise<boolean>} showAdAndWaitForClose
 * @param {{ timeoutMs?: number }} [opts]
 * @returns {Promise<AdTriggerOutcome>}
 */
export const resolveAdTriggerOutcome = async (showAdAndWaitForClose, opts = {}) => {
  if (shownThisSession < MAX_INTERSTITIALS_PER_SESSION) {
    let shown = false;
    try {
      shown = await showAdAndWaitForClose(opts);
    } catch {
      shown = false;
    }
    if (shown) {
      shownThisSession += 1;
    }
    return shown ? 'ad_shown' : 'ad_failed';
  }

  if (!shareFallbackConsumed) {
    shareFallbackConsumed = true;
    return 'share_modal';
  }

  return 'silent';
};

/**
 * @deprecated Use {@link resolveAdTriggerOutcome} with {@link useAdTriggerFallback} instead.
 */
export const tryShowInterstitialWithinSessionCap = async (showAdAndWaitForClose, opts = {}) => {
  const outcome = await resolveAdTriggerOutcome(showAdAndWaitForClose, opts);
  return outcome === 'ad_shown';
};
