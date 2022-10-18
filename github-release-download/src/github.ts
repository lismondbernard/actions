import * as core from "@actions/core";
import { getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import * as httpm from "typed-rest-client/HttpClient";

const githubToken = core.getInput("github_token");

class AcstGitHub {
  private token: string;
  client: InstanceType<typeof GitHub>;
  constructor(token: string) {
    this.token = token;
    this.client = getOctokit(token);
  }

  async downloadFromUrl(url: string): Promise<httpm.HttpClientResponse> {
    const http = new httpm.HttpClient("acst/github-release-download", [], {
      allowRedirects: false,
      allowRetries: true,
      maxRetries: 3
    });
    var resp = await http.get(url, {
      Accept: "application/octet-stream",
      Authorization: `token ${this.token}`
    });
    if (resp.message.statusCode == 302 && resp.message.headers.location) {
      resp = await http.get(resp.message.headers.location);
    }
    return resp;
  }
}

export let githubWrapper: AcstGitHub = new AcstGitHub(githubToken);
