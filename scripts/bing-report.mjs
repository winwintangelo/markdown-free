#!/usr/bin/env node

/**
 * Bing Webmaster Tools Report Generator — thin shim.
 *
 * The implementation moved to scripts/growth/bing.mjs (a side-effect-free module
 * so the growth-loop snapshot can import collect()). This shim preserves the
 * existing entrypoint so `npm run report:bing` keeps working unchanged.
 */
import { runCli } from './growth/bing.mjs';

runCli();
