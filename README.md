# RPUB-CLI v1.0

A standalone command line tool for doing simple transfers and checking wallet balance.

Usage: rpub-cli [--transfer|--balance] [--privateKey|--revAddress] [--amount] [--revAddressTo] [--validatorHost] [--readOnlyHost] [--decimals] [--ticker]

To transfer:
```
     ./rpub-cli --transfer --privateKey <string> --amount <number> --revAddressTo <string> --validatorHost <url>
```
To check balance:
```
     ./rpub-cli --balance --revAddress <string> --readOnlyHost <url> --decimals <number> --ticker <string>
```

To deploy:
```
     ./rpub-cli --deploy --privateKey <string> --files <string> --validatorHost <url>
```
To deploy:
```
     ./rpub-cli --exploreDeploy --privateKey <string> --files <string> --readOnlyHost <url>
```