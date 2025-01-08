'use strict';
import TestHelpers from '../../../../helpers';
import { SmokeMultiChainPermissions } from '../../../../tags';
import Browser from '../../../../pages/Browser/BrowserView';
import TabBarComponent from '../../../../pages/wallet/TabBarComponent';
import ConnectedAccountsModal from '../../../../pages/Browser/ConnectedAccountsModal';
import FixtureBuilder from '../../../../fixtures/fixture-builder';
import { withFixtures } from '../../../../fixtures/fixture-helper';
import { loginToApp } from '../../../../viewHelper';
import Assertions from '../../../../utils/Assertions';
import NetworkConnectMultiSelector from '../../../../pages/Browser/NetworkConnectMultiSelector';
import NetworkNonPemittedBottomSheet from '../../../../pages/Network/NetworkNonPemittedBottomSheet';
import { CustomNetworks } from '../../../../resources/networks.e2e';
import WalletView from '../../../../pages/wallet/WalletView';
import NetworkEducationModal from '../../../../pages/Network/NetworkEducationModal';
import PermissionSummaryBottomSheet from '../../../../pages/Browser/PermissionSummaryBottomSheet';
import { NetworkNonPemittedBottomSheetSelectorsText } from '../../../../selectors/Network/NetworkNonPemittedBottomSheet.selectors';
import ToastModal from '../../../../pages/wallet/ToastModal';

describe(SmokeMultiChainPermissions('Chain Permission Management'), () => {
  beforeAll(async () => {
    jest.setTimeout(150000);
    await TestHelpers.reverseServerPort();
  });
  it('allows simultaneous granting and revoking of multiple chain permissions', async () => {
    await withFixtures(
      {
        dapp: true,
        fixture: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .withChainPermission([
            '0x1',
            CustomNetworks.Sepolia.providerConfig.chainId,
          ]) // Initialize with Ethereum mainnet and Sepolia
          .build(),
        restartDevice: true,
      },
      async () => {
        await loginToApp();
        await TabBarComponent.tapBrowser();
        await Assertions.checkIfVisible(Browser.browserScreenID);

        await Browser.navigateToTestDApp();
        await Assertions.checkIfNotVisible(ToastModal.container);

        await Browser.tapNetworkAvatarButtonOnBrowser();

        // Navigate to chain permissions
        await ConnectedAccountsModal.tapManagePermissionsButton();
        await ConnectedAccountsModal.tapNavigateToEditNetworksPermissionsButton();

        // Uncheck Sepolia and check Linea Sepolia
        await NetworkNonPemittedBottomSheet.tapSepoliaNetworkName();
        await NetworkNonPemittedBottomSheet.tapLineaSepoliaNetworkName();

        // Update permissions
        await NetworkConnectMultiSelector.tapUpdateButton();
        await Assertions.checkIfNotVisible(ToastModal.container);

        // Verify changes were saved by checking chain permissions again
        await ConnectedAccountsModal.tapNavigateToEditNetworksPermissionsButton();
        await NetworkConnectMultiSelector.isNetworkChainPermissionSelected(
          NetworkNonPemittedBottomSheetSelectorsText.ETHEREUM_MAIN_NET_NETWORK_NAME,
        );
        await NetworkConnectMultiSelector.isNetworkChainPermissionSelected(
          NetworkNonPemittedBottomSheetSelectorsText.LINEA_SEPOLIA_NETWORK_NAME,
        );
      },
    );
  });

  it('follows fallback priority when revoking permission for currently active chain', async () => {
    await withFixtures(
      {
        dapp: true,
        fixture: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .withChainPermission([
            '0x1', // Ethereum mainnet
            CustomNetworks.Sepolia.providerConfig.chainId, // Sepolia
            '0xe705', // Linea Sepolia
          ])
          .build(),
        restartDevice: true,
      },
      async () => {
        await loginToApp();
        await TabBarComponent.tapBrowser();
        await TestHelpers.delay(3000);
        await Browser.navigateToTestDApp();

        await Assertions.checkIfNotVisible(ToastModal.container);
        // Open network permissions menu
        await Browser.tapNetworkAvatarButtonOnBrowser();
        await ConnectedAccountsModal.tapManagePermissionsButton();
        await ConnectedAccountsModal.tapNavigateToEditNetworksPermissionsButton();

        // Remove Ethereum Mainnet permission
        await NetworkNonPemittedBottomSheet.tapEthereumMainNetNetworkName();
        await NetworkConnectMultiSelector.tapUpdateButton();

        // Handle network education modal and close bottom sheet
        await NetworkEducationModal.tapGotItButton();
        await TestHelpers.delay(3000);
        await PermissionSummaryBottomSheet.swipeToDismissModal();
        await TestHelpers.delay(3000);

        // Verify network switched to Sepolia in wallet view
        await TabBarComponent.tapWallet();
        await Assertions.checkIfVisible(WalletView.container);
        const networkPicker = await WalletView.getNavbarNetworkPicker();
        await Assertions.checkIfElementHasLabel(networkPicker, 'Sepolia');
      },
    );
  });
});
