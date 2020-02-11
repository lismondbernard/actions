import * as core from "@actions/core";
import * as github from "@actions/github";
import * as httpm from "typed-rest-client/HttpClient";
import * as hm from 'typed-rest-client/Handlers';

const githubToken = core.getInput("github_token");

class AcstGitHub {
  private token: string;
  rest: github.GitHub;
  constructor(token: string) {
    this.token = token;
    this.rest = new github.GitHub(token);
  }

  async downloadFromUrl(url: string): Promise<httpm.HttpClientResponse> {
    const bh = new hm.PersonalAccessTokenCredentialHandler(this.token);
    const http = new httpm.HttpClient("acst/github-release-download", [bh], {
      allowRedirects: true,
      allowRetries: true,
      maxRetries: 3
    });
    return http.get(url, {
      Accept: "application/octet-stream"
    });
  }
}

export let GitHub: AcstGitHub = new AcstGitHub(githubToken);
