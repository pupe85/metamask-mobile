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
import FixtureBuilder, {
  DEFAULT_FIXTURE_ACCOUNT,
} from '../../../fixtures/fixture-builder';
import ActivitiesView from '../../../pages/Transactions/ActivitiesView';
import TabBarComponent from '../../../pages/wallet/TabBarComponent';

const TOKEN_SYMBOL_MOCK = 'ABC';
const TOKEN_ADDRESS_MOCK = '0x123';

const RESPONSE_TOKEN_TRANSFER_MOCK = {
  ...RESPONSE_STANDARD_MOCK,
  to: '0x2',
  valueTransfers: [
    {
      contractAddress: TOKEN_ADDRESS_MOCK,
      decimal: 18,
      symbol: TOKEN_SYMBOL_MOCK,
      from: '0x2',
      to: DEFAULT_FIXTURE_ACCOUNT.toLowerCase(),
      amount: '4560000000000000000',
    },
  ],
};

describe(SmokeCore('Incoming Transactions'), () => {
  beforeAll(async () => {
    jest.setTimeout(2500000);
    await TestHelpers.reverseServerPort();
  });

  it('displays incoming token transfers', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder()
          .withTokens([
            {
              address: TOKEN_ADDRESS_MOCK,
              decimals: 18,
              symbol: TOKEN_SYMBOL_MOCK,
            },
          ])
          .build(),
        restartDevice: true,
        testSpecificMock: {
          GET: [mockAccountsApi([RESPONSE_TOKEN_TRANSFER_MOCK])],
        },
      },
      async () => {
        await loginToApp();
        await TabBarComponent.tapActivity();
        await ActivitiesView.swipeDown();
        await Assertions.checkIfTextIsDisplayed('Received ABC');
        await Assertions.checkIfTextIsDisplayed(/.*4\.56 ABC.*/);
      },
    );
  });
});
