# RPUB-CLI

A standalone command line tool for doing simple transfers and checking wallet balance.

Usage: rpub-cli [--transfer|--balance] [--privKey|--revAddress] [--amount] [--revAddressTo] [--validatorHost] [--readOnlyHost] [--decimals] [--ticker]

To transfer:
```
     ./rpub-cli --transfer --privKey <string> --amount <number> --revAddressTo <string> --validatorHost <url> --readOnlyHost <url>
```
To check balance:
```
     ./rpub-cli --balance --privKey <string> --revAddress <string> --validatorHost <url> --readOnlyHost <url> --decimals <number> --ticker <string>
```