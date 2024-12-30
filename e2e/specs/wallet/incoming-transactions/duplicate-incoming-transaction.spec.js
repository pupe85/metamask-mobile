'use strict';
import { SmokeCore } from '../../../tags';
import TestHelpers from '../../../helpers';
import { loginToApp } from '../../../viewHelper';
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

const RESPONSE_STANDARD_MOCK = {
  hash: '0x123456',
  timestamp: new Date().toISOString(),
  chainId: 1,
  blockNumber: 1,
  blockHash: '0x2',
  gas: 1,
  gasUsed: 1,
  gasPrice: '1',
  effectiveGasPrice: '1',
  nonce: 1,
  cumulativeGasUsed: 1,
  methodId: null,
  value: '1230000000000000000',
  to: DEFAULT_FIXTURE_ACCOUNT.toLowerCase(),
  from: '0x2',
  isError: false,
  valueTransfers: [],
};

const RESPONSE_STANDARD_2_MOCK = {
  ...RESPONSE_STANDARD_MOCK,
  timestamp: new Date().toISOString(),
  hash: '0x2',
  value: '2340000000000000000',
};

function mockAccountsApi(transactions) {
  return {
    urlEndpoint: `https://accounts.api.cx.metamask.io/v1/accounts/${DEFAULT_FIXTURE_ACCOUNT}/transactions?networks=0x1&sortDirection=ASC`,
    response: {
      data: transactions ?? [RESPONSE_STANDARD_MOCK, RESPONSE_STANDARD_2_MOCK],
      pageInfo: {
        count: 2,
        hasNextPage: false,
      },
    },
    responseCode: 200,
  };
}

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
