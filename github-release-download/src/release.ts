import * as core from "@actions/core";
import { githubWrapper } from "./github";
import * as os from "os";
import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";
import * as fs from "fs";
import uuidV4 from "uuid/v4";
import * as path from "path";

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

export async function getTool(
  owner: string,
  repo: string,
  tag: string,
  tool: string,
  bin: string
) {
  let toolPath: string;
  let release: Release;
  try {
    let r = new Repository(owner, repo);
    release = await r.getReleaseFromTag(tag);
    toolPath = await release.getTool(tool);
  } catch (err) {
    core.debug(err);

    throw `Failed to download ${tool}@${tag}: ${err}`;
  }
  if (bin === "") {
    addToPath(toolPath);
  } else {
    let possiblePath = path.join(toolPath, bin);
    if (fs.existsSync(possiblePath)) {
      addToPath(possiblePath);
    }
  }

  core.setOutput("download_path", toolPath);
}

function addToPath(path: string) {
  core.debug(`Adding ${path} to the path`);
  core.addPath(path);
}

class Repository {
  owner: string;
  repo: string;

  constructor(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }

  async getReleaseFromTag(tag: string): Promise<Release> {
    let release: Release;
    core.debug(`Getting release for ${tag}`);
    if (tag === "latest") {
      let ghRelease = await githubWrapper.client.rest.repos.getLatestRelease({
        owner: this.owner,
        repo: this.repo
      });
      release = new Release(ghRelease.data.tag_name, this);
      release.assets = ghRelease.data.assets.reduce(
        (obj, asset) => (
          (obj[asset.name] = new ReleaseAsset(
            asset.name,
            asset.id,
            asset.url,
            release
          )),
          obj
        ),
        {}
      );
    } else {
      let ghRelease = await githubWrapper.client.rest.repos.getReleaseByTag({
        owner: this.owner,
        repo: this.repo,
        tag: tag
      });
      release = new Release(ghRelease.data.tag_name, this);
      release.assets = ghRelease.data.assets.reduce(
        (obj, asset) => (
          (obj[asset.name] = new ReleaseAsset(
            asset.name,
            asset.id,
            asset.url,
            release
          )),
          obj
        ),
        {}
      );
    }
    return release;
  }
}

class Release {
  repo: Repository;
  tag: string;
  assets!: {
    [name: string]: ReleaseAsset;
  };

  constructor(tag: string, repo: Repository) {
    this.tag = tag;
    this.repo = repo;
  }

  async getTool(tool: string): Promise<string> {
    let toolPath: string;
    toolPath = tc.find(tool, this.tag);
    if (!toolPath) {
      let downloadPath = await this.findTool(tool).download();

      let extPath: string;
      if (osPlat == "win32") {
        extPath = await tc.extractZip(downloadPath);
      } else {
        extPath = await tc.extractTar(downloadPath);
      }
      if (core.getInput("has_root_folder") === "true") {
        extPath = path.join(
          extPath,
          getFileNameWithoutExtension(tool, this.tag)
        );
      }
      toolPath = await tc.cacheDir(extPath, tool, this.tag);
      core.debug(`${tool} was cached under ${toolPath}`);
    }
    return toolPath;
  }

  private findTool(tool: string): ReleaseAsset {
    let filename = getFileName(tool, this.tag);
    if (!(filename in this.assets)) {
      throw `Unable to find ${filename} in listed assets`;
    }
    return this.assets[filename];
  }
}

class ReleaseAsset {
  name: string;
  id: number;
  url: string;
  release: Release;

  constructor(name: string, id: number, url: string, release: Release) {
    this.name = name;
    this.id = id;
    this.url = url;
    this.release = release;
  }

  // mimics https://github.com/actions/toolkit/blob/master/packages/tool-cache/src/tool-cache.ts#L53
  // needed to set custom headers though so I could not use that function...
  async download(): Promise<string> {
    // Wrap in a promise so that we can resolve from within stream callbacks
    return new Promise<string>(async (resolve, reject) => {
      try {
        const destPath = path.join(tempDirectory, uuidV4());
        await io.mkdirP(tempDirectory);
        core.debug(`Downloading ${this.name} for ${this.release.tag}`);
        core.debug(`Downloading ${this.url}`);
        core.debug(`Downloading ${destPath}`);

        if (fs.existsSync(destPath)) {
          throw new Error(`Destination file path ${destPath} already exists`);
        }

        let response = await githubWrapper.downloadFromUrl(this.url);

        if (response.message.statusCode !== 200) {
          const err = new tc.HTTPError(response.message.statusCode);
          core.debug(
            `Failed to download from "${this.url}". Code(${response.message.statusCode}) Message(${response.message.statusMessage})`
          );
          throw err;
        }

        const file: NodeJS.WritableStream = fs.createWriteStream(destPath);
        file.on("open", async () => {
          try {
            const stream = response.message.pipe(file);
            stream.on("close", () => {
              core.debug("download complete");
              resolve(destPath);
            });
          } catch (err) {
            core.debug(
              `Failed to download from "${this.url}". Code(${response.message.statusCode}) Message(${response.message.statusMessage})`
            );
            reject(err);
          }
        });
        file.on("error", err => {
          file.end();
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

function getFileName(tool: string, version: string): string {
  const ext: string = osPlat == "win32" ? "zip" : "tar.gz";
  return getFileNameWithoutExtension(tool, version) + `.${ext}`;
}

function getFileNameWithoutExtension(tool: string, version: string): string {
  const fmt = core.getInput("release_format");
  const stripped_version =
    version[0] === "v" ? version.slice(1, version.length) : version;
  const os: string = osPlat == "win32" ? "windows" : osPlat;
  const arch: string = getArchitectureFileName(osArch);
  return fmt
    .replace("$OS", os)
    .replace("$ARCH", arch)
    .replace("$TOOL", tool)
    .replace("$VERSION", version)
    .replace("$SVERSION", stripped_version);
}

function getArchitectureFileName(arch: string): string {
  if (arch == "x64") {
    return "amd64"
  }

  if (arch == "x32") {
    return "386"
  }

  return arch
}
