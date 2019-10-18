import * as core from "@actions/core";
import * as release from "./release";

async function run() {
  try {
    const owner = core.getInput("owner");
    let repo = core.getInput("repo");
    const tag = core.getInput("tag");
    const tool = core.getInput("tool");
    if (!repo) {
      repo = tool;
    }
    const bin = core.getInput("bin");
    await release.getTool(owner, repo, tag, tool, bin);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
