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
  fulcrum records show                  Show record
  fulcrum records delete                Delete records
  fulcrum records update                Update records
  fulcrum records duplicate             Duplicate records into new app
  fulcrum records restore               Restore deleted records
  fulcrum forms delete                  Delete form
  fulcrum forms duplicate               Duplicate form and records
  fulcrum forms restore                 Restore form and records
  fulcrum forms upload-reference-file   Upload a Reference File
  fulcrum query run                     Run query
  fulcrum changesets show               Show a changeset
  fulcrum changesets revert             Revert a changeset
  fulcrum reports run                   Run reports

Options:
  --version   Show version number                                      [boolean]
  --endpoint  API endpoint               [default: "https://api.fulcrumapp.com"]
  --token     API token                                               [required]
  --logDir    Log directory                       [required] [default: "./logs"]
  --help      Show help                                                [boolean]
```