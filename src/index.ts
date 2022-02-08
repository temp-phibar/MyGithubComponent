import { run } from "@oclif/core";

/**
 * Invokes the `once.cli` CLI with args programmatically.
 *
 * @param {...string} args - args to pass to CLI.
 *
 * @returns {Promise<void>}
 */
export default async function oncecli(...args: any) {
  return run(args, import.meta.url);
}
