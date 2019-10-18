import * as core from "@actions/core";

async function run() {
  try {
    const varsString = core.getInput("variables");
    const vars = varsString.split(",");
    vars.forEach(envVar => {
      const value = process.env[envVar] || "";
      core.exportVariable(envVar, value);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
