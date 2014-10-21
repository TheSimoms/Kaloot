## Kaloot

### Installation

First, install the following:
  * Python 2.7
  * Virtualenv for Python 2.7
  * Pip for python 2.7
  * PhantomJS

For Ubuntu:
```bash
$ sudo apt-get install python-dev python-virtualenv phantomjs
```

After installing the requirements, cd into the root project folder and run the following commands:
```bash
$ virtualenv --distribute KALOOT
$ . KALOOT/bin/activate
$ pip install -r requirements.txt
$ cd src
```
