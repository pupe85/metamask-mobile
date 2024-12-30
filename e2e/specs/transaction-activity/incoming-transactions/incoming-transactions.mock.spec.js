'use strict';
import { SmokeCore } from '../../../tags';
import TestHelpers from '../../../helpers';
import { loginToApp, mockAccountsApi } from '../../../viewHelper';
import Assertions from '../../../utils/Assertions';

import { withFixtures } from '../../../fixtures/fixture-helper';
import FixtureBuilder from '../../../fixtures/fixture-builder';
import ActivitiesView from '../../../pages/Transactions/ActivitiesView';
import TabBarComponent from '../../../pages/wallet/TabBarComponent';
import ToastModal from '../../../pages/wallet/ToastModal';

describe(SmokeCore('Incoming Transactions'), () => {
  beforeAll(async () => {
    jest.setTimeout(2500000);
    await TestHelpers.reverseServerPort();
  });

  it('displays standard incoming transaction', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder().build(),
        restartDevice: true,
        testSpecificMock: {
          GET: [mockAccountsApi()],
        },
      },
      async () => {
        await loginToApp();
        await TabBarComponent.tapActivity();
        await ActivitiesView.swipeDown();
        await Assertions.checkIfElementToHaveText(
          await ToastModal.notificationTitle,
          'You received 1.23 ETH',
        );
        // await Assertions.checkIfTextIsDisplayed('Received ETH');
        await Assertions.checkIfTextIsDisplayed(/.*1\.23 ETH.*/);
        await Assertions.checkIfTextIsDisplayed(/.*2\.34 ETH.*/);
      },
    );
  });
});
