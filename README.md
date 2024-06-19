this repo includes samples from 

https://www.udemy.com/course/aws-cdk-for-professionals

>> `cdk init` command needs to be called inside an empty directory (e.g. ../cdk_playground/py-starter).
(we run it to create a cdk project)

>> let's generate some codes 
> ../cdk_playground/py-starter
`cdk init app --language python`
> ../cdk_playground/ts-starter
`cdk init app --language typescript`
in the created files, you will see README.md, cdk.json and .gitignore in both py-starter and ts-starter
README.md shows you the needed commands

>> How execatly will CDK know where to look for CDK code?
it checks the "cdk.json" file. here, we need to pay attention to 
"app": "python3 pp.py" line/entry
this command will be run when you call CDK commands other than cdk init

Install AWS CDK Python module
(`aws-cdk-lib` is the new single-package import for AWS CDK version 2, and `constructs` is a dependency.)

`pip install aws-cdk-lib`
`pip install constructs`

# verify installation
`pip list | grep aws-cdk-lib`
`pip list | grep constructs`

**Configure Your IDE/Editor**:

- If you are using an IDE like VSCode, make sure it is using the correct Python interpreter. In VSCode, you can set the interpreter by clicking on the Python version in the bottom-left corner of the window and selecting the appropriate one.
    - Open the command palette (Ctrl+Shift+P) and type `Python: Select Interpreter`.
    - Choose the interpreter where AWS CDK is installed.

`cdk synth` generates a CF template

cdk.out folder will always be overwritten with the newly generated files.
we need to look at "TsStarterStack.template.json" file >> this is simply the CF template. This will be used by CDK in order to provision our resources with CF.

pip install -r requirements.txt 

------------ Section7: CICD and web deployment
(mel_playground) melih@Melihs-MacBook-Pro web % pwd
/Users/melih/Documents/coding_practice/cdk_playground/cdk_playground
> first I need to create a package create-vite
sudo npm init vite@latest
> and give the project a name: web and we will use react with typescript project
cd web
sudo npm install
sudo npm run dev
sudo npm run build  # this will create the "dist" folder 
> then check if you can open the page locally: e.g. http://localhost:5173 on your browser
> now, we will take this to AWS and then integrate it into a CICD pipeline
cd ..
(mel_playground) melih@Melihs-MacBook-Pro web % pwd
/Users/melih/Documents/coding_practice/cdk_playground/cdk_playground
mkdir py-webdepl
cd py-webdepl
cdk init app --language=python
python3 -m venv .venv
pip install -r requirements.txt


