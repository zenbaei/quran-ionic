ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew install node@6
echo 'export PATH="/usr/local/opt/node@6/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
npm i -g ionic cordova
