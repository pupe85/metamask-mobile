'use strict';
import { SmokeCore } from '../../../tags';
import TestHelpers from '../../../helpers';
import {
  loginToApp,
  RESPONSE_STANDARD_MOCK,
  mockAccountsApi,
} from '../../../viewHelper';
import Assertions from '../../../utils/Assertions';
import {
  startMockServer,
  stopMockServer,
} from '../../../api-mocking/mock-server';
import { withFixtures } from '../../../fixtures/fixture-helper';
import FixtureBuilder, {
  DEFAULT_FIXTURE_ACCOUNT,
} from '../../../fixtures/fixture-builder';
import ActivitiesView from '../../../pages/Transactions/ActivitiesView';
import TabBarComponent from '../../../pages/wallet/TabBarComponent';
import ToastModal from '../../../pages/wallet/ToastModal';

const TOKEN_SYMBOL_MOCK = 'ABC';
const TOKEN_ADDRESS_MOCK = '0x123';

const RESPONSE_OUTGOING_TRANSACTION_MOCK = {
  ...RESPONSE_STANDARD_MOCK,
  to: '0x2',
  from: DEFAULT_FIXTURE_ACCOUNT.toLowerCase(),
};

describe('Outgoing Transactions', () => {
  beforeAll(async () => {
    jest.setTimeout(2500000);
    await TestHelpers.reverseServerPort();
  });

  it('displays outgoing transactions', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder().build(),
        restartDevice: true,
        testSpecificMock: {
          GET: [mockAccountsApi([RESPONSE_OUTGOING_TRANSACTION_MOCK])],
        },
      },
      async () => {
        await loginToApp();
        await TabBarComponent.tapActivity();
        await ActivitiesView.swipeDown();
        await Assertions.checkIfTextIsDisplayed('Sent ETH');
        await Assertions.checkIfTextIsDisplayed(/.*1\.23 ETH.*/);
      },
    );
  });
});
