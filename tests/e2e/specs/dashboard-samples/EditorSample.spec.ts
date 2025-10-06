/** *******************************************************************
 * copyright (c) 2023 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { KubernetesCommandLineToolsExecutor } from '../../utils/KubernetesCommandLineToolsExecutor';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { expect } from 'chai';
import { e2eContainer } from '../../configs/inversify.config';
import { CLASSES } from '../../configs/inversify.types';
import { LoginTests } from '../../tests-library/LoginTests';
import { Dashboard } from '../../pageobjects/dashboard/Dashboard';
import { BrowserTabsUtil } from '../../utils/BrowserTabsUtil';
import { Workspaces } from '../../pageobjects/dashboard/Workspaces';
import { WorkspaceHandlingTests } from '../../tests-library/WorkspaceHandlingTests';
import { ShellExecutor } from '../../utils/ShellExecutor';
import { WorkspaceDetails } from '../../pageobjects/dashboard/workspace-details/WorkspaceDetails';
import axios from 'axios';
import { BASE_TEST_CONSTANTS } from '../../constants/BASE_TEST_CONSTANTS';
import { OAUTH_CONSTANTS } from '../../constants/OAUTH_CONSTANTS';
import { Logger } from '../../utils/Logger';
import { By } from 'selenium-webdriver';

// suit works for DevSpaces
suite(`Check all versions of Intellij Idea`, function (): void {
	this.timeout(180000);
	const workspaceHandlingTests: WorkspaceHandlingTests = e2eContainer.get(CLASSES.WorkspaceHandlingTests);
	const pathToSampleFile: string = path.resolve('resources/default-devfile.yaml');
	const workspaceName: string = YAML.parse(fs.readFileSync(pathToSampleFile, 'utf8')).metadata.name;
	const kubernetesCommandLineToolsExecutor: KubernetesCommandLineToolsExecutor = e2eContainer.get(
		CLASSES.KubernetesCommandLineToolsExecutor
	);
	kubernetesCommandLineToolsExecutor.workspaceName = workspaceName;
	const loginTests: LoginTests = e2eContainer.get(CLASSES.LoginTests);
	const dashboard: Dashboard = e2eContainer.get(CLASSES.Dashboard);
	const workspaces: Workspaces = e2eContainer.get(CLASSES.Workspaces);
	const workspaceDetails: WorkspaceDetails = e2eContainer.get(CLASSES.WorkspaceDetails);
	const shellExecutor: ShellExecutor = e2eContainer.get(CLASSES.ShellExecutor);
	const browserTabsUtil: BrowserTabsUtil = e2eContainer.get(CLASSES.BrowserTabsUtil);
	const majorMinorVersion: string = BASE_TEST_CONSTANTS.TESTING_APPLICATION_VERSION.split('.').slice(0, 2).join('.'); // extract major.minor version from full version

	const emptyWorkspace: string = 'Empty Workspace';
	const IntellijEditorUltimate: string = '//*[@id="editor-selector-card-che-incubator/che-idea-server/latest"]';
	const IntellijEditorPyCharm: string = '//*[@id="editor-selector-card-che-incubator/che-pycharm-server/latest"]'

	suiteSetup('Login into OC', function (): void {
		kubernetesCommandLineToolsExecutor.loginToOcp();
	});

	suiteSetup('Login into Che', async function (): Promise<void> {
		await loginTests.loginIntoChe();
	});

	test('Test Intellij Idea Ultimate Editor', async function (): Promise<void> {
		await workspaceHandlingTests.createAndOpenWorkspaceWithSpecificEditorAndSample(IntellijEditorUltimate, emptyWorkspace);

		By.xpath(`/html/body/h1`).toString();
		Logger.debug(By.xpath(`/html/body/h1`).toString());
		Logger.debug(By.xpath(`/html/body/h1`).value);

		await workspaceHandlingTests.obtainWorkspaceNameFromStartingPage();
		await workspaceHandlingTests.stopAndRemoveWorkspace(WorkspaceHandlingTests.getWorkspaceName());
	});

	suiteTeardown('Open dashboard and close all other tabs', async function (): Promise<void> {
		await dashboard.openDashboard();
		await browserTabsUtil.closeAllTabsExceptCurrent();
	});

	suiteTeardown('Delete default DevWorkspace', function (): void {
		kubernetesCommandLineToolsExecutor.deleteDevWorkspace();
	});
});