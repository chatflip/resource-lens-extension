import { execFile } from 'child_process';

/**
 * Promise wrapper around child_process.execFile with timeout.
 * Uses execFile (not exec) to prevent shell injection.
 */
export function execFileAsync(
  command: string,
  args: string[],
  timeoutMs: number = 3000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: timeoutMs }, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}
