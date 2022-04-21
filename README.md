# RPUB-CLI v0.0.1

A standalone command line tool for doing simple transfers and checking wallet balance.

Usage: rpub-cli [--transfer|--balance] [--privKey|--revAddress] [--amount] [--revAddressTo] [--validatorHost] [--readOnlyHost] [--decimals] [--ticker]

To transfer:
```
     ./rpub-cli --transfer --privKey <string> --amount <number> --revAddressTo <string> --validatorHost <url>
```
To check balance:
```
     ./rpub-cli --balance --revAddress <string> --readOnlyHost <url> --decimals <number> --ticker <string>
```