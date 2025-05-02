import { exec } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverRoot = resolve(__dirname, "../../");
const serverCmd = "pnpm --filter vspo-portal-server dev:gateway";
const openApiUrl = "http://localhost:3000/doc";
const outputFile = resolve(serverRoot, "docs/openapi.json");
const maxRetries = 10;
const retryDelayMs = 3000; // 3 seconds

async function checkServerReady(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    // Network errors mean server is likely not ready
    if (error instanceof Error) {
        if (error.name === 'AbortError') {
            // This specifically means the timeout was hit
            console.warn("Server check timed out (will retry).");
            return false;
        }
        if ('code' in error && (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET')) {
          return false;
        }
    }

    // Other fetch errors might indicate a problem, but let's treat server as not ready
    console.warn(`Server check failed (will retry): ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function fetchOpenApiSpec(url: string): Promise<string> {
  console.log(`Fetching OpenAPI spec from ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`,
    );
  }
  const spec = await response.json(); // Assuming it returns JSON
  console.log("Successfully fetched OpenAPI spec.");
  return JSON.stringify(spec, null, 2); // Pretty print JSON
}

async function saveSpecToFile(filePath: string, content: string): Promise<void> {
  try {
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true }); // Ensure directory exists
    await writeFile(filePath, content, "utf-8");
    console.log(`OpenAPI spec saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving spec to file: ${error instanceof Error ? error.message : String(error)}`);
    throw error; // Re-throw to indicate failure
  }
}

async function main() {
  let serverProcess: ReturnType<typeof exec> | null = null;
  let success = false;

  try {
    console.log(`Starting development server: ${serverCmd}`);
    serverProcess = exec(serverCmd, { cwd: serverRoot });

    serverProcess.stdout?.on("data", (data) => {
      // console.log(`[Server STDOUT]: ${data.toString().trim()}`); // Optional: log server output
    });
    serverProcess.stderr?.on("data", (data) => {
      // console.error(`[Server STDERR]: ${data.toString().trim()}`); // Optional: log server error output
    });

    console.log("Waiting for server to become ready...");
    let retries = 0;
    let isReady = false;
    while (retries < maxRetries) {
      isReady = await checkServerReady(openApiUrl);
      if (isReady) {
        console.log("Server is ready.");
        break;
      }
      retries++;
      console.log(`Server not ready, retrying (${retries}/${maxRetries})...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }

    if (!isReady) {
      throw new Error(
        `Server did not become ready at ${openApiUrl} after ${maxRetries} retries.`,
      );
    }

    // Short extra delay just in case routes need a moment more after port is open
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const specContent = await fetchOpenApiSpec(openApiUrl);
    await saveSpecToFile(outputFile, specContent);
    success = true;

  } catch (error) {
    console.error("An error occurred:", error);
    // Optional: Dump server logs if available and error occurred
  } finally {
    if (serverProcess) {
      console.log("Stopping development server...");
      // Use tree-kill logic if simple kill doesn't work for wrangler
      const killed = serverProcess.kill("SIGTERM"); // Try graceful termination first
      if (!killed) {
         console.warn("Failed to kill server process with SIGTERM, trying SIGKILL...");
         serverProcess.kill("SIGKILL");
      }
      console.log("Server process termination signal sent.");
    }
     process.exit(success ? 0 : 1); // Exit with appropriate code
  }
}

main(); 