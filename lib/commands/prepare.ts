import { ValidatePlatformCommandBase } from "./command-base";

export class PrepareCommand extends ValidatePlatformCommandBase implements ICommand {
	public allowedParameters = [this.$platformCommandParameter];

	constructor($options: IOptions,
		$platformService: IPlatformService,
		$projectData: IProjectData,
		private $platformCommandParameter: ICommandParameter,
		$platformsData: IPlatformsData,
		private $workflowService: IWorkflowService) {
		super($options, $platformsData, $platformService, $projectData);
		this.$projectData.initializeProjectData();
	}

	public async execute(args: string[]): Promise<void> {
		await this.$workflowService.handleLegacyWorkflow({ projectDir: this.$projectData.projectDir, settings: this.$options, skipWarnings: true });
		const appFilesUpdaterOptions: IAppFilesUpdaterOptions = {
			bundle: !!this.$options.bundle,
			release: this.$options.release,
			useHotModuleReload: this.$options.hmr
		};
		const platformInfo: IPreparePlatformInfo = {
			platform: args[0],
			appFilesUpdaterOptions,
			platformTemplate: this.$options.platformTemplate,
			projectData: this.$projectData,
			config: this.$options,
			env: this.$options.env
		};

		await this.$platformService.preparePlatform(platformInfo);
	}

	public async canExecute(args: string[]): Promise<boolean | ICanExecuteCommandOutput> {
		const platform = args[0];
		const result = await this.$platformCommandParameter.validate(platform) && await this.$platformService.validateOptions(this.$options.provision, this.$options.teamId, this.$projectData, platform);
		if (!result) {
			return false;
		}

		const canExecuteOutput = await super.canExecuteCommandBase(platform);
		return canExecuteOutput;
	}
}

$injector.registerCommand("prepare", PrepareCommand);
