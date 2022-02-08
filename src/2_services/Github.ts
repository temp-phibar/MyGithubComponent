import { Octokit } from "@octokit/rest";
import inquirer from "inquirer";

export default class Github {

  public static async promptComponentOwner(octokit: Octokit): Promise<string> {
    return (
      await inquirer.prompt([
        {
          type: "list",
          name: "owner",
          message: "Wo möchtest du die Componente erstellen",
          choices: await Github.getGithubOwners(octokit),
        },
      ])
    ).owner;
  }
  public static async enterTokenPrompt() {
    await this.openGitHubTokenPage();
    await this.enterGithubToken();
  }

  static async enterGithubToken() {
    Github.githubToken = (
      await inquirer.prompt([
        {
          type: "input",
          name: "token",
          message: "bitte token einfügen",
        },
      ])
    ).token;
  }

  private static async openGitHubTokenPage() {
    (
      await inquirer.prompt([
        {
          type: "list",
          name: "tokenExist",
          message: "Hast du bereits ein Github Token",
          choices: ["ja", "nein"],
        },
      ])
    ).tokenExist == "nein" && open("https://github.com/settings/tokens/new");
  }

  public static get githubToken(): string | undefined {
    return process.env.Github_Token;
  }

  public static set githubToken(value: string | undefined) {
    process.env.Github_Token = value;
  }

  public static loginToGithub(): Octokit {
    try {
      const octokit = new Octokit({
        auth: this.githubToken,
      });
      return octokit;
    } catch {
      console.log("Token is not valid");
      this.enterGithubToken();
      return this.loginToGithub();
    }
  }
  static async getGithubOwners(octokit: Octokit): Promise<string[]> {
    const retVal = [];
    const user = (await octokit.rest.users.getAuthenticated()).data.name;
    user && retVal.push(user);
    retVal.push(...(await this.getUserOrganisations(octokit)));
    return retVal;
  }
  private static async getUserOrganisations(
    octokit: Octokit
  ): Promise<string[]> {
    return (
      await octokit.rest.orgs.listMembershipsForAuthenticatedUser()
    ).data.map((x) => x.organization.login);
  }

  public static async createComponentRepository(
    octokit: Octokit,
    componentName: string,
    owner: string
  ): Promise<string> {
    return (
      await octokit.rest.repos.createUsingTemplate({
        template_owner: "ONCE-DAO",
        template_repo: "ComponentTemplate",
        name: componentName,
        owner: owner,
      })
    ).data.ssh_url;
  }
}
