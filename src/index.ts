// import { execSync } from 'child_process';
// import readline from 'readline';
// import chalk from 'chalk';
// import inquirer from 'inquirer';
// import ora, { Ora } from 'ora';
// import figlet from 'figlet';

// type UserPlan = 'free' | 'paid';

// interface ContainerStats {
// 	id: string;
// 	name: string;
// 	cpu: string;
// 	mem: string;
// 	netIO: string;
// 	blockIO: string;
// 	pids: string;
// }

// // Global state for container management
// const globalStore = {
// 	containerName: '',
// 	userPlan: 'free' as UserPlan,
// 	resourceLimits: '',
// };

// let loading = true;

// function createContainer(userPlan: UserPlan, resourceLimits: string): void {
// 	const containerName = `resource-managed-container-${userPlan}`;
// 	const imageName = 'alpine';

// 	// Update global store
// 	globalStore.containerName = containerName;
// 	globalStore.userPlan = userPlan;
// 	globalStore.resourceLimits = resourceLimits;

// 	try {
// 		try {
// 			execSync(`docker inspect ${containerName}`);
// 			console.log(
// 				chalk.yellow(
// 					`Container ${containerName} already exists. Removing it...`
// 				)
// 			);
// 			execSync(`docker rm -f ${containerName}`);
// 		} catch (inspectError) {
// 			console.log(
// 				chalk.red(`Container ${containerName} does not exist.`)
// 			);
// 		}

// 		const command = `docker run -d ${resourceLimits} --name ${containerName} ${imageName} /bin/sh -c "apk add --no-cache stress-ng && stress-ng --cpu 1 --timeout 0"`;
// 		execSync(command);
// 		console.log(chalk.green(`Container created with plan: ${userPlan}`));
// 		console.log(chalk.green(`Container Name: ${containerName}`));
// 		console.log(chalk.green(`Resource Limits: ${resourceLimits}`));
// 	} catch (error) {
// 		console.error(chalk.red('Error creating container:'), error);
// 	}
// }

// function stopAndRemoveContainer(): void {
// 	const containerName = globalStore.containerName;
// 	try {
// 		execSync(`docker stop ${containerName}`);
// 		execSync(`docker rm ${containerName}`);
// 		console.log(
// 			chalk.blue(`Stopped and removed container: ${containerName}`)
// 		);
// 	} catch (error) {
// 		console.error(chalk.red('Error stopping/removing container:'), error);
// 	}
// }

// function getContainerStats(containerName: string): ContainerStats | null {
// 	try {
// 		const stats = execSync(
// 			`docker stats ${containerName} --no-stream --format "{{.Container}},{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.NetIO}},{{.BlockIO}},{{.PIDs}}"`
// 		)
// 			.toString()
// 			.trim();
// 		const [id, name, cpu, mem, netIO, blockIO, pids] = stats.split(',');
// 		return { id, name, cpu, mem, netIO, blockIO, pids };
// 	} catch (error) {
// 		console.error(chalk.red('Error fetching container stats:'), error);
// 		return null;
// 	}
// }

// async function displayStats(spinner: Ora): Promise<void> {
// 	if (loading) {
// 		spinner.start();
// 	}

// 	const stats = getContainerStats(globalStore.containerName);
// 	if (stats) {
// 		loading = false;
// 		spinner.stop();
// 		console.clear();

// 		const globalData = [
// 			{
// 				name: 'User Plan',
// 				value: globalStore.userPlan,
// 			},
// 			{
// 				name: 'Resource Limits',
// 				value: globalStore.resourceLimits,
// 			},
// 			{
// 				name: 'Container Name',
// 				value: globalStore.containerName,
// 			},
// 		];

// 		const tableData = [
// 			{ Metric: 'Container ID', Value: stats.id },
// 			{ Metric: 'Name', Value: stats.name },
// 			{ Metric: 'CPU %', Value: stats.cpu },
// 			{ Metric: 'Memory Usage', Value: stats.mem },
// 			{ Metric: 'Network I/O', Value: stats.netIO },
// 			{ Metric: 'Block I/O', Value: stats.blockIO },
// 			{ Metric: 'PIDs', Value: stats.pids },
// 			{ Metric: 'User Plan', Value: globalStore.userPlan },
// 			{ Metric: 'Resource Limits', Value: globalStore.resourceLimits },
// 		];

// 		console.log(chalk.cyan('Container Stats:'));
// 		console.table(globalData);
// 		console.table(tableData);
// 		console.log(
// 			chalk.green('Type "stop" to stop and remove the container.')
// 		);
// 	}
// }

// async function getResourceLimits(): Promise<string> {
// 	const { resourceChoice } = await inquirer.prompt([
// 		{
// 			type: 'list',
// 			name: 'resourceChoice',
// 			message: 'Select resource limits:',
// 			choices: [
// 				{
// 					name: '1. Default (1 CPU, 512 MB)',
// 					value: '--cpus="1" --memory="512m"',
// 				},
// 				{ name: '2. Custom Input', value: 'custom' },
// 			],
// 		},
// 	]);

// 	if (resourceChoice === 'custom') {
// 		const { cpu, memory } = await inquirer.prompt([
// 			{
// 				type: 'input',
// 				name: 'cpu',
// 				message: 'Enter CPU limit (e.g., 1.5):',
// 			},
// 			{
// 				type: 'input',
// 				name: 'memory',
// 				message: 'Enter Memory limit (e.g., 512m):',
// 			},
// 		]);
// 		return `--cpus="${cpu}" --memory="${memory}"`;
// 	}

// 	return resourceChoice;
// }

// async function main(): Promise<void> {
// 	console.log(
// 		chalk.blue(
// 			figlet.textSync('Docker Manager', {
// 				horizontalLayout: 'universal smushing',
// 			})
// 		)
// 	);

// 	const { userPlan }: { userPlan: UserPlan } = await inquirer.prompt([
// 		{
// 			type: 'list',
// 			name: 'userPlan',
// 			message: 'Select a plan:',
// 			choices: [
// 				{ name: '1. Free', value: 'free' },
// 				{ name: '2. Paid', value: 'paid' },
// 			],
// 		},
// 	]);

// 	console.log(chalk.yellow(`\nYou have selected the ${userPlan} plan.\n`));
// 	console.log(
// 		chalk.cyan('Creating container with appropriate resource limits...\n')
// 	);

// 	const resourceLimits =
// 		userPlan === 'free'
// 			? '--cpus="0.5" --memory="256m"'
// 			: await getResourceLimits();

// 	createContainer(userPlan, resourceLimits);

// 	const rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout,
// 	});

// 	console.log(
// 		chalk.green(
// 			`Container named "${globalStore.containerName}" is being created.\n`
// 		)
// 	);
// 	console.log(
// 		chalk.green(
// 			`You can monitor the stats of your container once it is up.\n`
// 		)
// 	);
// 	console.log(
// 		chalk.magenta(
// 			'Type "stop" at any time to stop and remove the container.\n'
// 		)
// 	);

// 	const spinner = ora('Loading container stats...').start();

// 	const statsInterval = setInterval(() => displayStats(spinner), 1000);

// 	rl.on('line', (input) => {
// 		if (input.trim().toLowerCase() === 'stop') {
// 			clearInterval(statsInterval);
// 			stopAndRemoveContainer();
// 			rl.close();
// 		}
// 	});

// 	rl.on('close', () => {
// 		clearInterval(statsInterval);
// 		console.log(chalk.green('Exiting program.\n'));
// 		stopAndRemoveContainer();
// 		process.exit(0);
// 	});
// }

// main();

import { execSync } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora, { Ora } from 'ora';
import figlet from 'figlet';
import scuid from 'scuid';

type UserPlan = 'free' | 'paid';

interface ContainerStats {
	id: string;
	name: string;
	cpu: string;
	mem: string;
	netIO: string;
	blockIO: string;
	pids: string;
}

// Global state for container management
const globalStore = {
	containerName: '',

	userPlan: 'free' as UserPlan,
	resourceLimits: '',
};

let loading = true;

function createContainer(userPlan: UserPlan, resourceLimits: string): void {
	const uniqueId = scuid();

	const containerName = `resource-managed-container-${userPlan}-${uniqueId}`;
	const imageName = 'alpine';

	globalStore.containerName = containerName;
	globalStore.userPlan = userPlan;
	globalStore.resourceLimits = resourceLimits;

	try {
		const command = `docker run -d ${resourceLimits} --name ${containerName} ${imageName} /bin/sh -c "apk add --no-cache stress-ng && stress-ng --cpu 1 --timeout 0"`;
		execSync(command);
		console.log(chalk.green(`Container created with plan: ${userPlan}`));
		console.log(chalk.green(`Container Name: ${containerName}`));
		console.log(chalk.green(`Resource Limits: ${resourceLimits}`));
	} catch (error) {
		console.error(chalk.red('Error creating container:'), error);
	}
}

function stopAndRemoveContainer(): void {
	const containerName = globalStore.containerName;
	if (containerName) {
		try {
			execSync(`docker stop ${containerName}`);
			execSync(`docker rm ${containerName}`);
			console.log(
				chalk.blue(`Stopped and removed container: ${containerName}`)
			);
		} catch (error) {
			console.error(
				chalk.red('Error stopping/removing container:'),
				error
			);
		}
	}
}

function getContainerStats(containerName: string): ContainerStats | null {
	try {
		const stats = execSync(
			`docker stats ${containerName} --no-stream --format "{{.Container}},{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.NetIO}},{{.BlockIO}},{{.PIDs}}"`
		)
			.toString()
			.trim();
		const [id, name, cpu, mem, netIO, blockIO, pids] = stats.split(',');
		return { id, name, cpu, mem, netIO, blockIO, pids };
	} catch (error) {
		console.error(chalk.red('Error fetching container stats:'), error);
		return null;
	}
}

async function displayStats(spinner: Ora): Promise<void> {
	if (loading) {
		spinner.start();
	}

	const stats = getContainerStats(globalStore.containerName);
	if (stats) {
		loading = false;
		spinner.stop();
		console.clear();

		const globalData = [
			{
				name: 'User Plan',
				value: globalStore.userPlan,
			},
			{
				name: 'Resource Limits',
				value: globalStore.resourceLimits,
			},
			{
				name: 'Container Name',
				value: globalStore.containerName,
			},
		];

		const tableData = [
			{ Metric: 'Container ID', Value: stats.id },
			{ Metric: 'Name', Value: stats.name },
			{ Metric: 'CPU %', Value: stats.cpu },
			{ Metric: 'Memory Usage', Value: stats.mem },
			{ Metric: 'Network I/O', Value: stats.netIO },
			{ Metric: 'Block I/O', Value: stats.blockIO },
			{ Metric: 'PIDs', Value: stats.pids },
			{ Metric: 'User Plan', Value: globalStore.userPlan },
			{ Metric: 'Resource Limits', Value: globalStore.resourceLimits },
		];

		console.log(chalk.cyan('Container Stats:'));
		console.table(globalData);
		console.table(tableData);
		console.log(
			chalk.green('Type "stop" to stop and remove the container.')
		);
	}
}

async function getResourceLimits(): Promise<string> {
	const { resourceChoice } = await inquirer.prompt([
		{
			type: 'list',
			name: 'resourceChoice',
			message: 'Select resource limits:',
			choices: [
				{
					name: '1. Default (1 CPU, 512 MB)',
					value: '--cpus="1" --memory="512m"',
				},
				{ name: '2. Custom Input', value: 'custom' },
			],
		},
	]);

	if (resourceChoice === 'custom') {
		const { cpu, memory } = await inquirer.prompt([
			{
				type: 'input',
				name: 'cpu',
				message: 'Enter CPU limit (e.g., 1.5):',
			},
			{
				type: 'input',
				name: 'memory',
				message: 'Enter Memory limit (e.g., 512m):',
			},
		]);
		return `--cpus="${cpu}" --memory="${memory}"`;
	}

	return resourceChoice;
}

async function main(): Promise<void> {
	console.log(
		chalk.blue(
			figlet.textSync('Docker Manager', {
				horizontalLayout: 'universal smushing',
			})
		)
	);

	const { userPlan }: { userPlan: UserPlan } = await inquirer.prompt([
		{
			type: 'list',
			name: 'userPlan',
			message: 'Select a plan:',
			choices: [
				{ name: '1. Free', value: 'free' },
				{ name: '2. Paid', value: 'paid' },
			],
		},
	]);

	console.log(chalk.yellow(`\nYou have selected the ${userPlan} plan.\n`));
	console.log(
		chalk.cyan('Creating container with appropriate resource limits...\n')
	);

	const resourceLimits =
		userPlan === 'free'
			? '--cpus="0.5" --memory="256m"'
			: await getResourceLimits();

	createContainer(userPlan, resourceLimits);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	console.log(
		chalk.green(
			`Container named "${globalStore.containerName}" is being created.\n`
		)
	);
	console.log(
		chalk.green(
			`You can monitor the stats of your container once it is up.\n`
		)
	);
	console.log(
		chalk.magenta(
			'Type "stop" at any time to stop and remove the container.\n'
		)
	);

	const spinner = ora('Loading container stats...').start();

	const statsInterval = setInterval(() => displayStats(spinner), 10000);

	rl.on('line', (input) => {
		if (input.trim().toLowerCase() === 'stop') {
			clearInterval(statsInterval);
			stopAndRemoveContainer();
			rl.close();
		}
	});

	rl.on('close', () => {
		clearInterval(statsInterval);
		console.log(chalk.green('Exiting program.\n'));
		stopAndRemoveContainer();
		process.exit(0);
	});
}

main();
