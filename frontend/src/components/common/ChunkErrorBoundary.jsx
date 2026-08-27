import { Component } from "react";

const RELOAD_FLAG = "sk-chunk-reload";

/**
 * Recovers the app when a lazily-imported page fails to download.
 *
 * Every route below the homepage is a separate chunk whose filename carries a
 * content hash, and each deploy produces new hashes. A phone that still has the
 * previous index.html — from its cache, or a tab left open — asks for the
 * filenames that HTML knows about, and after a deploy those return 404. The
 * dynamic import rejects, React unwinds, and with nothing catching it the
 * router renders blank: the tap appears to do nothing, and a manual refresh
 * "fixes" it because it fetches current HTML with current hashes.
 *
 * The remedy is the reload the visitor would have performed anyway, done for
 * them, once. Once matters: if the chunk is missing for any reason other than
 * staleness, reloading again would loop forever, so the attempt is recorded in
 * sessionStorage and the second failure shows a message instead.
 */
class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidMount() {
    /*
     * Reaching here means the app mounted, so whatever went wrong before is
     * over. Clearing the flag lets a genuinely new failure later in the session
     * get its own recovery rather than being treated as a repeat.
     */
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // Private browsing can refuse storage; the boundary still works, it just
      // cannot remember across a reload.
    }
  }

  componentDidCatch(error) {
    if (!ChunkErrorBoundary.isChunkLoadError(error)) throw error;

    let alreadyTried = false;
    try {
      alreadyTried = sessionStorage.getItem(RELOAD_FLAG) === "1";
      if (!alreadyTried) sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {
      // No storage: attempt the reload anyway. A loop is still better than a
      // permanently blank page, and browsers without storage are rare.
    }

    if (!alreadyTried) window.location.reload();
  }

  /**
   * Browsers word this differently — Chrome and Safari disagree, and Vite's
   * wording differs again from webpack's — so match on the shapes they share
   * rather than one exact string.
   */
  static isChunkLoadError(error) {
    const message = String(error?.message || error || "");
    return (
      /Loading chunk|Loading CSS chunk/i.test(message) ||
      /dynamically imported module/i.test(message) ||
      /Importing a module script failed/i.test(message) ||
      error?.name === "ChunkLoadError"
    );
  }

  render() {
    if (!this.state.failed) return this.props.children;

    // Only reached when a reload has already been tried, so the problem is not
    // a stale hash. Say something true and give them the action.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-navy dark:text-white font-display font-semibold text-lg">
          This page didn&apos;t finish loading.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-300 max-w-sm">
          It&apos;s usually a brief connection problem. Please check your network and try again.
        </p>
        <button onClick={() => window.location.reload()} className="btn-primary !py-2.5 !px-6 text-sm">
          Reload page
        </button>
      </div>
    );
  }
}

export default ChunkErrorBoundary;
