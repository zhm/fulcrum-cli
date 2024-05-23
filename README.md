# Fulcrum CLI

# Installation

```sh
git clone https://github.com/zhm/fulcrum-cli.git

cd fulcrum-cli

yarn install

./run
```

```sh
fulcrum <command>

Commands:
  fulcrum delete-records       Delete records
  fulcrum query                Run query
  fulcrum revert-changeset     Revert a changeset
  fulcrum update-calculations  Update calculation fields
  fulcrum update-records       Update records
  fulcrum restore-form         Restore form and records
  fulcrum duplicate-form       Duplicate form and records

Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  --endpoint  API endpoint               [default: "https://api.fulcrumapp.com"]
  --token     API token                                               [required]
```