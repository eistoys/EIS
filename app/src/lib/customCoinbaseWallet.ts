import { Wallet } from '@rainbow-me/rainbowkit';
import { coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { CoinbaseWalletParameters } from 'wagmi/connectors';
import { Connector } from 'wagmi';

interface CoinbaseWalletOptions {
  appName: string;
  appIcon?: string;
}

interface WalletConnectWalletOptions {
  projectId: string;
}

type CreateWalletFn = (createWalletParams: CoinbaseWalletOptions & WalletConnectWalletOptions) => Wallet;

interface CustomCoinbaseWalletOptions extends CoinbaseWalletOptions {
  preference?: CoinbaseWalletParameters<'4'>['preference'];
}

export const customCoinbaseWallet = (options: CustomCoinbaseWalletOptions): CreateWalletFn => {
  coinbaseWallet.preference = options.preference || 'smartWalletOnly';

  return (createWalletParams) => {
    const originalWallet = coinbaseWallet(options);
    return {
      ...originalWallet,
      name: 'Coinbase Smart Wallet',
      createConnector: (details) => {
        return (config) => {
          const connector = originalWallet.createConnector(details)(config) as Connector;
          return connector;
        };
      },
    };
  };
};