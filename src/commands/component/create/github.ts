import { Command, Flags } from "@oclif/core";
import { Octokit } from "@octokit/rest";
import inquirer from "inquirer";
export default class ComponentCreateGithub extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    token: Flags.string({ char: "t", description: "set the github token" }),
    createOnly: Flags.boolean({
      char: "c",
      description: "doesn't install the component to eamd repo",
    }),
  };

  static args = [
    {
      name: "name",
      description: "the name of the component with namespace",
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ComponentCreateGithub);
    const { componentName, packageName } = this.getComponentNames(args.name);
    !ComponentCreateGithub.githubToken && (await ComponentCreateGithub.enterTokenPrompt());
    const octokit: Octokit = ComponentCreateGithub.loginTothis();
    let owner = await ComponentCreateGithub.promptComponentOwner(octokit);

    const gitRepoUrl: string = await ComponentCreateGithub.createComponentRepository(
      octokit,
      componentName,
      owner
    );

    !flags.createOnly &&
      (await this.addSubmodule(gitRepoUrl, componentName, packageName));
  }

  async addSubmodule(
    gitRepoUrl: string,
    componentName: string,
    packageName: string
  ) {
    const Submodule = await (
      await import(
        "../../../../../../../once.ts/dist/current/src/2_systems/Git/Submodule.class.js"
      )
    ).default;
    const Once = await (
      await import(
        "../../../../../../../once.ts/dist/current/src/2_systems/Once/OnceNodeServer.class.js"
      )
    ).default;

    const once = global.ONCE ? global.ONCE : await Once.start();

    const module = await Submodule.addFromRemoteUrl({
      once,
      url: gitRepoUrl,
      overwrite: { name: componentName, namespace: packageName },
    });
    module.build(once.eamd?.eamdDirectory || "");
  }

  private getComponentNames(packageName: string) {
    const split: string[] = packageName.split(".");
    const componentName = split.pop() || "";
    return { componentName, packageName: split.join(".") };
  }




  public static async promptComponentOwner(octokit: Octokit): Promise<string> {
    return (
      await inquirer.prompt([
        {
          type: "list",
          name: "owner",
          message: "Wo möchtest du die Componente erstellen",
          choices: await this.getthisOwners(octokit),
        },
      ])
    ).owner;
  }
  public static async enterTokenPrompt() {
    await this.openGitHubTokenPage();
    await this.enterthisToken();
  }

  static async enterthisToken() {
    this.githubToken = (
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
          message: "Hast du bereits ein this Token",
          choices: ["ja", "nein"],
        },
      ])
    ).tokenExist == "nein" && open("https://github.com/settings/tokens/new");
  }

  public static get githubToken(): string | undefined {
    return process.env.this_Token;
  }

  public static set githubToken(value: string | undefined) {
    process.env.this_Token = value;
  }

  public static loginTothis(): Octokit {
    try {
      const octokit = new Octokit({
        auth: this.githubToken,
      });
      return octokit;
    } catch {
      console.log("Token is not valid");
      this.enterthisToken();
      return this.loginTothis();
    }
  }
  static async getthisOwners(octokit: Octokit): Promise<string[]> {
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
