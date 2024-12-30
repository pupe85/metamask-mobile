'use strict';
import { SmokeCore } from '../../../tags';
import TestHelpers from '../../../helpers';
import {
  loginToApp,
  mockAccountsApi,
  RESPONSE_STANDARD_MOCK,
} from '../../../viewHelper';
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

  it('displays nothing if incoming transaction is a duplicate', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder()
          .withTransactions([
            {
              hash: RESPONSE_STANDARD_MOCK.hash,
              txParams: {
                from: RESPONSE_STANDARD_MOCK.from,
              },
            },
          ])
          .build(),
        restartDevice: true,
        testSpecificMock: { GET: [mockAccountsApi([RESPONSE_STANDARD_MOCK])] },
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
