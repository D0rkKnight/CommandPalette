# Makefile from https://github.com/iancleary/pyinstaller-fastapi/blob/main/Makefile

.PHONY: help

HELP_PADDING=12

help:
# http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
# adds anything that has a double # comment to the phony help list
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ".:*?## "}; {printf "\033[36m%-$(HELP_PADDING)s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

#---------------------------------------------------------------
# Application Filename for EXE
name=backend
version=0p1
FILENAME=$(name)_$(version)

# Pyinstaller options
PYINSTALLER=pyinstaller -y
CLEAN=--clean
MAIN_FILE=entry.py
OUTPUT_NAME=--name $(FILENAME)
EXTRA_HOOKS=--additional-hooks-dir extra-hooks
ICON=--icon public/icons/ucsd.png
ONEFILE=--onefile

venv:
venv:  ## make virtual environment (activate with  `source venv/Scripts/activate` on Windows, deactivate with `deactivate`)
	python3 -m venv venv

onefolder:
onefolder:  ## make pyinstaller exe within folder of dependencies
	rm -rf dist/*
	$(PYINSTALLER) $(CLEAN) $(OUTPUT_NAME) $(ICON) $(EXTRA_HOOKS) $(MAIN_FILE)
	cp -r public ./dist/$(FILENAME)/public

# onefile:
# onefile:  ## make pyinstaller exe bundling dependencies into one file
# 	$(PYINSTALLER) $(CLEAN) $(OUTPUT_NAME) $(ICON) $(EXTRA_HOOKS) $(MAIN_FILE) $(ONEFILE) 
# 	cp -r public ./dist/$(FILENAME)/publics
