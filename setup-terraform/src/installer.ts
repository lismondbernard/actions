import * as os from "os";
import * as path from "path";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

let osPlat: string = os.platform();
let osArch: string = os.arch();

let tempDirectory: string = process.env["RUNNER_TEMP"] || "";
// If directories not found, place them in common temp locations
if (!tempDirectory) {
  let baseLocation: string;
  if (osPlat === "win32") {
    // On windows use the USERPROFILE env variable
    baseLocation = process.env["USERPROFILE"] || "C:\\";
  } else {
    if (process.platform === "darwin") {
      baseLocation = "/Users";
    } else {
      baseLocation = "/home";
    }
  }
  tempDirectory = path.join(baseLocation, "actions", "temp");
}

export async function getTerraform(version: string) {
  let toolPath: string;
  toolPath = tc.find("terraform", version);

  if (!toolPath) {
    toolPath = await acquireTerraform(version);
    core.debug(`Terraform tool is cached under ${toolPath}`);
  }

  core.addPath(toolPath);
}

async function acquireTerraform(version: string): Promise<string> {
  let strippedVersion =
    version[0] === "v" ? version.slice(1, version.length) : version;
  let downloadUrl: string = getDownloadUrl(strippedVersion);
  let downloadPath: string | null = null;
  try {
    downloadPath = await tc.downloadTool(downloadUrl);
  } catch (error) {
    core.debug(error);

    throw `Failed to download version ${version}: ${error}`;
  }

  let extPath: string = tempDirectory;
  if (!extPath) {
    throw new Error("Temp directory not set");
  }
  extPath = await tc.extractZip(downloadPath);

  return tc.cacheDir(extPath, "terraform", version);
}

function getFileName(version: string): string {
  const platform: string = osPlat == "win32" ? "windows" : osPlat;
  const arch: string = osArch == "x64" ? "amd64" : "386";
  return `terraform_${version}_${platform}_${arch}.zip`;
}

function getDownloadUrl(version: string): string {
  return `https://releases.hashicorp.com/terraform/${version}/${getFileName(
    version
  )}`;
}
