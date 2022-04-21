import fs from "fs";
import process from "process";
import * as rchainToolkit from 'rchain-toolkit';
import commandLineArgs from "command-line-args";
 

const optionDefinitions = [
  { name: 'transfer', alias: 's', type: Boolean },
  { name: 'balance', alias: 'c', type: Boolean },
  { name: 'decimals', alias: 'd', type: Number, multiple: false},
  { name: 'ticker', alias: 't', type: String, multiple: false},
  { name: 'revAddressTo', alias: 'r', type: String, multiple: false},
  { name: 'revAddress', alias: 'w', type: String, multiple: false},
  { name: 'amount', alias: 'a', type: Number, multiple: false},
  { name: 'readOnlyHost', alias: 'o', type: String, multiple: false},
  { name: 'validatorHost', alias: 'v', type: String, multiple: false},
  { name: 'command', type: String, multiple: false, defaultOption: true },
  { name: 'privKey', alias: 'p', type: String, multiple: false }
]


const options = commandLineArgs(optionDefinitions)

const privateKey = options.privKey;
const revAddressTo = options.revAddressTo;
const revAddress = options.revAddress;
const revAmount = options.amount;


var logStream = fs.createWriteStream(process.argv[0] + ".log");

const LOCAL_VALIDATOR_HOST = "http://127.0.0.1:40403";
const LOCAL_READ_ONLY_HOST = "http://127.0.0.1:40403";
const DEFAULT_DECIMALS = 6;
const DEFAULT_TICKER = "RPCREV";

const VALIDATOR_HOST = options.validatorHost || LOCAL_VALIDATOR_HOST;
const READ_ONLY_HOST = options.readOnlyHost || LOCAL_READ_ONLY_HOST;
const DECIMALS = options.decimals || DEFAULT_DECIMALS;
const TICKER = options.ticker || DEFAULT_TICKER;


//https://github.com/tgrospic/rnode-client-js/blob/051cfa26356332d99500eb5a565ca824ad8d257f/src/web/controls/common.js#L13
export const showTokenDecimal = (amount, digits)=> {
  const d = digits // decimal places
  const amountNr   = parseInt(amount)
  const amountStr  = isNaN(amountNr) ? '' : `${amountNr}`
  const length     = amountStr.length
  const trimZeroes = s => s.replace(/[\.]?[0]*$/ig, '')
  if (length === 0) return ''
  if (length <= d) {
    const padded = amountStr.padStart(d, '0')
    return trimZeroes(`0.${padded}`)
  } else if (length > d) {
    const prefix = amountStr.slice(0, -d)
    const suffix = amountStr.slice(-d)
    return trimZeroes(`${prefix}.${suffix}`)
  }
}

const runFunction = async function () {
  process.on('SIGINT', () => {
      process.exit(0);
  });

  if (options.transfer && revAmount && revAddressTo) {
    const pubKeyFromPrivKey = rchainToolkit.utils.publicKeyFromPrivateKey(privateKey);
    const revAddressFrom = rchainToolkit.utils.revAddressFromPublicKey(pubKeyFromPrivKey);
  
    const transferFundsTerm = rchainToolkit.utils.transferRevTerm({
      from: revAddressFrom,
      to: revAddressTo,
      amount: revAmount,
    });

    const timestamp = new Date().toUTCString();

    try {
      await rchainToolkit.http.easyDeploy(
        VALIDATOR_HOST,
        transferFundsTerm,
        privateKey,
        'auto',
        100000000,
        240000
      );
      
    } catch (err) {
      const errMsg = timestamp + " - " + "[OK] "  + err;
      logStream.write(errMsg + "\n");
      console.log(errMsg);
    }

    const message = timestamp + " - " + "[OK] "  + `Transferred ${revAmount} from ${revAddressFrom} to ${revAddressTo}`;
    logStream.write(message + "\n");
    console.log(message);
  }
  else if (options.balance) {
    let revAddressOf;
    if( privateKey) {
      const pubKeyFromPrivKey = rchainToolkit.utils.publicKeyFromPrivateKey(privateKey);
      revAddressOf = rchainToolkit.utils.revAddressFromPublicKey(pubKeyFromPrivKey);
    } else {
      revAddressOf = revAddress
    }

    const term = `new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh, balanceCh in {
      rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
      for (@(_, RevVault) <- RevVaultCh) {
        @RevVault!("findOrCreate", "${revAddressOf}", *vaultCh) |
        for (@(true, vault) <- vaultCh) {
          @vault!("balance", *balanceCh) |
          for (@balance <- balanceCh) { return!(balance) }
        }
      }
    }`;
  
    try {
      const result = await rchainToolkit.http.exploreDeploy(READ_ONLY_HOST, {
        term: term,
      });
  
      const parsedResult = JSON.parse(result);
      if (parsedResult.expr && parsedResult.expr.length) {
        const balance = rchainToolkit.utils.rhoValToJs(JSON.parse(result).expr[0]);

        const revBalance = showTokenDecimal(balance, DECIMALS);

        const message = revBalance + " " + TICKER;
        console.log(message);
      }
    } catch (err) {
      console.log(err);
    }
  }
  else {
    console.log("Usage: rev-cli [--transfer|--balance] [--privKey|--revAddress] [--amount] [--revAddressTo] [--validatorHost] [--readOnlyHost] [--decimals] [--ticker]");
    console.log("");
    console.log("To transfer: ./rev-cli --transfer --privKey <string> --amount <number> --revAddressTo <string> --validatorHost <url> --readOnlyHost <url>");
    console.log("To check balance: ./rev-cli --balance --revAddress <string> --validatorHost <url> --readOnlyHost <url> --decimals <number> --ticker <string>");
  }
}

runFunction();