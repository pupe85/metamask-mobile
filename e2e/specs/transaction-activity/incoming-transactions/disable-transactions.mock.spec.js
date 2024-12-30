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

  it('displays nothing if incoming transactions disabled', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder()
          .withIncomingTransactionPreferences({
            '0x1': false,
          })
          .build(),
        restartDevice: true,
        testSpecificMock: { GET: [mockAccountsApi()] },
      },
      async () => {
        await loginToApp();
        await TabBarComponent.tapActivity();
        await ActivitiesView.swipeDown();
        await TestHelpers.delay(2000);
        await Assertions.checkIfTextIsNotDisplayed('Received ETH');
      },
    );
  });
});
