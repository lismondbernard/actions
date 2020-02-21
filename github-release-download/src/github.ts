import * as core from "@actions/core";
import * as github from "@actions/github";
import * as httpm from "typed-rest-client/HttpClient";

const githubToken = core.getInput("github_token");

class AcstGitHub {
  private token: string;
  rest: github.GitHub;
  constructor(token: string) {
    this.token = token;
    this.rest = new github.GitHub(token);
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

export let GitHub: AcstGitHub = new AcstGitHub(githubToken);
