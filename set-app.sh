#!/bin/bash 

   echo ""  
   mFVARS=$(cat _config.yaml)
   
function setAppName() {
    local aApp="${1}"; aApp=$( echo "${aApp}" | tr '[:lower:]' '[:upper:]') 
    local aType="${2}"
    local aName="${aApp}_sample-{TYPE}-{TYP}"
  while IFS= read -r aLine; do 
    aVal="${aLine:15}";  aVal="${aVal// /}"; aVal="${aVal//\"/}" 
    aVar="${aLine// /}"; aVar="${aVar:0:12}"
    echo "Looking for:   'A${aApp:1:2}_APP_NAME' in '${aVar}'"
    if [  "${aApp}_APP_NAME"     == "${aVar}" ]; then  aName="${aVal}"; fi 
    if [ "A${aApp:1:2}_APP_NAME" == "${aVar}" ]; then  aName="${aVal}"; fi 
    done <<< "${mFVARS}" 

    echo "Found aName:   '${aName}'"
    aTyp="app"; if [ "${aType}" == "server" ]; then aTyp="api"; fi
    aName="${aName/\{TYP\}/${aTyp}}"
    aName="${aName/\{TYPE\}/${aType}}"
    if [ "${aName:3:1}" != "_" ]; then aName="${aApp}_${aName}"; fi
    aAppName="$( echo "${aName}" | tr '[:upper:]' '[:lower:]' )"
    }


# setAppName "c01" "client"
# setAppName "c02" "client"
# setAppName "s00" "server"
  setAppName "s##" "server"

  echo "  Set aAppName: ${aAppName}"
  echo "  done"

# A00_APP_NAME:        "sample-{TYPE}-{TYP}"
# A##_APP_NAME:        "sample-{TYPE}-{TYP}"
# C00_APP_NAME:        "sample-client-app"
# S00_APP_NAME:        "sample-server-api"
# A01_APP_NAME:        "docs-loader-{TYP}"
# A02_APP_NAME:        "docs-viewer-{TYP}"
  