import * as core from "@actions/core";
import * as github from "@actions/github";
import * as httpm from "typed-rest-client/HttpClient";
import * as util from 'util';

const githubToken = core.getInput("github_token");

class AcstGitHub {
  private token: string;
  rest: github.GitHub;
  constructor(token: string) {
    this.token = token;
    this.rest = new github.GitHub(token)
  }

  async downloadFromUrl(url: string): Promise<httpm.HttpClientResponse> {
    const http = new httpm.HttpClient("acst/github-release-download", [], {
      allowRedirects: false,
      allowRetries: true,
      maxRetries: 3
    });
    const response = await http.get(url, {
      // Accept: "application/octet-stream",
      Authorization: `token ${this.token}`
    });
    core.debug(`response: ${util.inspect(response)}`)
    return response
  }

  // async getReleaseAsset(owner: string, repo: string, asset_id: number): Promise<any> {
  //   return await this.asset_rest.repos.getReleaseAsset({owner, repo, asset_id})
  // }

  async getReleaseAsset(owner: string, repo: string, asset_id: number): Promise<httpm.HttpClientResponse> {
    const response = await this.rest.request({
      method: "GET",
      url: "/repos/:owner/:repo/releases/assets/:asset_id",
      owner: owner,
      repo: repo,
      asset_id: asset_id
    })

    const browserUrl = response.data.browser_download_url
    core.debug(`response.data: ${util.inspect(response.data)}`)

    const http = new httpm.HttpClient("acst/github-release-download", [], {
      allowRedirects: false,
      allowRetries: true,
      maxRetries: 3,
      headers: {
        'Authorization': `token ${this.token}`
      }
    });
    return http.get(browserUrl, {});
  }
}

export let GitHub: AcstGitHub = new AcstGitHub(githubToken);
