#!/bin/bash

  nPrj=50
# nStg=3
  aQuiet=""; if [ "$2" == "-q" ]; then aQuiet="--quiet"; set -- "$1" "${@:3}"; fi
             if [ "$3" == "-q" ]; then aQuiet="--quiet"; fi


  aRootDir="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
  aStage="$(basename "${aRootDir}")"

function checkFW() {
    bOK="$( sudo ufw status | awk '/'$1'/ { print 1 }; END { print 0 }' )"
    if [ "${bOK}" == "0" ]; then sudo ufw allow $1/tcp > /dev/null 2>&1;
#                                sudo ufw delete allow 54332/tcp
    echo "    Opened firewall for port: $1"
    fi
    }
# ---------------------------------------------------

# Function to kill process on a specific port
function chkPort() {
    local port=$1
    echo -e "\n  Checking port $port..."

    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash)
        local pid=$(netstat -ano | findstr ":$port" | awk '{print $5}' | head -1)
        if [ "$pid" != "0" ] && [ ! -z "$pid" ]; then
            echo "  Killing windows process $pid for port $port"
#           taskkill /PID $pid /F > /dev/null 2>&1
            MSYS2_ARG_CONV_EXCL="/PID;/F" /c/Windows/System32/taskkill.exe /PID $pid /F | awk '{ print "  " $0 }'
        fi
    else
        # Linux/macOS
        local pid=$(lsof -ti:$port)
        if [ "$pid" != "0" ] && [ ! -z "$pid" ]; then
            echo "  Killing linux process $pid for port $port"
            kill -9 $pid > /dev/null 2>&1
        fi
#       checkFW $port
    fi
}
# ---------------------------------------------------

function setPort() { # $1 = 3201, 3251 or 64361: Proj#: 3,64; Stage#: 1)Prod, 2)Test, 3)Dev3, 4-9)Dev4-9; Client#/Server#: 0-4/5-9; App#: 1-9
    csn=${1:1:1}     # Client#/Server#
    ano=${1:2:1}     # App#
    pno="${2:0:2}"; if [ "${#2}" == "5" ]; then pno="${2:0:3}"; fi  # Proj#
    nsp=5;       if [ "${1:0:1}" == "c" ]; then nsp=0; fi
    nPort="${pno}$(( nsp + csn ))${ano}";
    aApp="${1:0:1}${csn}${ano}"
    aServer="server${csn}"; if [ "${csn}" == "0" ]; then aServer="server"; fi
    aClient="client${csn}"; if [ "${csn}" == "0" ]; then aClient="client"; fi
#   echo "--nPort: ${nPort}"
    }
# ---------------------------------------------------

function getPrjNo() {
    while IFS= read -r aLine; do 
    aVal="${aLine:15}";  aVal="${aVal// /}"; aVal="${aVal//\"/}" 
    aVar="${aLine// /}"; aVar="${aVar:0:10}"
#   echo "Looking for:   'PROJECT_NO' in '${aVar}' <- '${aVal}'"
    if [ "PROJECT_NO" == "${aVar}" ]; then nPrj="${aVal}"; break; fi 
    done <<< "${mFVARS}" 
#   echo "-- found: nPrj: ${nPrj}"
    }
# ---------------------------------------------------

function getStgNo() {
    aStg="${aStage}"; nStg=4
    while IFS= read -r aLine; do 
    aVal="${aLine:17}";  aVal="${aVal// /}"; aVal="${aVal//\"/}" 
    aVar="${aLine// /}"; aVar="${aVar:0:13}"
#   echo "Looking for:   'PROJECT_STAGE' in '${aVar}' <- '${aVal}'"
    if [ "PROJECT_STAGE" == "${aVar}" ]; then aStg="${aVal}"; break; fi 
    done <<< "${mFVARS}" 
    aStg="$( echo "${aStg}" | tr '[:upper:]' '[:lower:]' )"     
    if [[ "${aStg}" =~ ^prod ]]; then nStg=1; fi
    if [[ "${aStg}" =~ ^test ]]; then nStg=2; fi
    if [[ "${aStg}" =~ ^dev ]];  then nStg=3; fi
#   echo "-- found: nStg: ${nStg}) ${aStg} (${aStage})"; exit 
    }
# ---------------------------------------------------
function getAppName() {
   aAppName="Unknown"; setPort "$1" "$2"; aFldr="docs"
if [ "${1:0:1}" == "c" ]; then aFldr="${aClient}"; fi
if [ "${1:0:1}" == "s" ]; then aFldr="${aServer}"; fi

# Handle specific app names for docs-viewer apps
#if [ "${aApp}" == "s01" ]; then aAppName="s01_docs-viewer-api"; fi
#if [ "${aApp}" == "s02" ]; then aAppName="s02_docs-viewer-api"; fi
#if [ "${aApp}" == "c01" ]; then aAppName="c01_docs-viewer-app"; fi
#if [ "${aApp}" == "c02" ]; then aAppName="c02_docs-viewer-app"; fi

if [ -d "${aFldr}" ] && [ "${aAppName}" == "Unknown" ]; then
   aAppName=$(  find "./${aFldr}" -maxdepth 1 -type d -name "${aApp}_*" | awk '{ sub( /.+\//, ""   ); print; exit }' )
   fi
   }
# ---------------------------------------------------

function runServer() {
    setPort "$1" "$2"  # Sets aServer, aApp and nPort
    chkPort ${nPort}   # Kill any existing processes on our ports
    getAppName $1 $2;  # echo "-- Server Port: ${nPort} for ${aAppName}"; return 

#   Install dependencies if needed
    bDoit="0"; if [ "${3:0:2}" == "-d" ]; then bDoit="1"; fi
 if [ ! -d "${aServer}/node_modules"    ]; then bDoit="1"; fi
 if [ "${bDoit}" == "1" ] && [ -f "${aServer}/package.json" ]; then

    echo -e "\n  Installing ${aServer} dependencies..."
    cd ${aServer}
    npm install
    cd ..
    fi
 if [ "$(command -v nodemon)" == "" ]; then npm install -g nodemon >/dev/null 2>&1; fi

    echo -e "\n  Starting server, ${aAppName}, on port ${nPort} ..."
#   cd ${aServer}/${aApp}_*
    cd ${aServer}/${aAppName}
#   node server.mjs &

    node --trace-deprecation ${aQuiet} server.mjs &

    SERVER_PID=$!
    echo "  Server is running at: http://localhost:${nPort}/api"
    if [ "${aQuiet}" == "" ]; then echo ""; fi
    cd ../..
    }
# ---------------------------------------------------

function runClient() {
    setPort "$1" "$2"  # Sets aClient, aApp and nPort
    chkPort ${nPort}   # Kill any existing processes on our ports
    getAppName $1 $2;  # echo "-- Client Port: ${nPort} for ${aAppName}"; return 

#   Install dependencies if needed
    bDoit="0"; if [ "${3:0:2}" == "-d" ]; then bDoit="1"; fi
 if [ ! -d "${aClient}/node_modules"    ]; then bDoit="1"; fi
 if [ "${bDoit}" == "1" ] && [ -f "${aClient}/package.json" ]; then

    echo -e "\n  Installing ${aClient} dependencies..."
    cd ${aClient}
    npm install
    cd ..
    fi

 if [ "$(command -v live-server)" == "" ]; then npm install -g live-server >/dev/null 2>&1; fi

    echo -e "\n  Starting client, ${aAppName}, on port ${nPort} ..."
#   cd ${aClient}/${aApp}_*
    cd ${aClient}/${aAppName}
#   npx http-server@latest -p ${nPort} -s &
#   python -m SimpleHTTPServer
#   npx -q serve -p ${nPort} -s &

    live-server ${aQuiet} --port=${nPort} --watch=.,../../${aServer}/${aServerName} &

    CLIENT_PID=$!
    echo "  Client is running at: http://localhost:${nPort}"
    cd ../..
    }
# -------------------------------------------------

    mFVARS=$(cat _config.yaml); getPrjNo; getStgNo
    nPort="${nPrj}${nStg}##"
    getAppName "s${1:1:2}" ${nPort}; aServerName=${aAppName}
#   echo "  Starting ${aAppName}"; # exit

 if [ "${1:0:1}" == "s" ] || [ "${1:0:1}" == "a" ]; then
    runServer "s${1:1:2}" ${nPort} $2
    sleep 6  # Wait for server to start
    fi
 if [ "${1:0:1}" == "c" ] || [ "${1:0:1}" == "a" ]; then
    runClient "c${1:1:2}" ${nPort} $2
    fi
# ---------------------------------------------------

    echo -e "\n  Press Ctrl+C to stop one or both services\n"

#   Wait for user interrupt
    trap "kill $SERVER_PID $CLIENT_PID; exit" INT
    wait