import { Command } from 'commander';
import { runAllTests, runHealthTest } from './tests';

const program = new Command();

program
    .option('--server <url>', 'Specify the server URL')
    .option('--case <case>', 'Specify the test case to run', 'health')
    .parse(process.argv);

const options = program.opts();

if (options.server) {
    console.log(`Server URL: ${options.server}`);
} else {
    console.log('No server URL provided.');
}

async function main() {
    try {
        if (options.case === 'health') {
            console.log(`Running specified test case ${options.case}...`);
            await runHealthTest(options.server);
        } else {
            console.log('Running all tests...');
            await runAllTests(options.server);
        }
    } catch (error) {
        console.error('An error occurred while running tests:', error);
        process.exit(1);
    }
}

main();
