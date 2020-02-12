import * as core from "@actions/core";
import * as github from "@actions/github";
import * as httpm from "typed-rest-client/HttpClient";

const githubToken = core.getInput("github_token");

class AcstGitHub {
  private token: string;
  rest: github.GitHub;
  asset_rest: github.GitHub;
  constructor(token: string) {
    this.token = token;
    this.rest = new github.GitHub(token)
    this.asset_rest = new github.GitHub(token, {headers: {Accept: 'application/octet-stream'}});
  }

  async downloadFromUrl(url: string): Promise<httpm.HttpClientResponse> {
    const http = new httpm.HttpClient("acst/github-release-download", [], {
      allowRedirects: true,
      allowRetries: true,
      maxRetries: 3
    });
    return http.get(url, {
      Accept: "application/octet-stream",
    });
  }

  async getReleaseAsset(owner: string, repo: string, asset_id: number): Promise<any> {
    return await this.asset_rest.repos.getReleaseAsset({owner, repo, asset_id})
  }
}

export let GitHub: AcstGitHub = new AcstGitHub(githubToken);
