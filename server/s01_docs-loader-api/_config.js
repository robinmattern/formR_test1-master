var _FVARS =
{ "APP_VERSION":    "2.03"
, "APP_FOLDER":     "server/s01_docs-loader-api"   
, "CLIENT_PATH":    "http://localhost:51201/"
, "SERVER_API_URL": "http://localhost:51251/api"
, "DATA_FOLDER":    "{ProjectDir}/data"   
   }
//-------------------------------------------------------------------------------------------
// End of _FVARS
                                                                    
   if (typeof(window)  != 'undefined') {  window.FVARS  = _FVARS; var aGlobal = "window"  }
   if (typeof(process) != 'undefined') {  process.FVARS = _FVARS; var aGlobal = "process" }

  console.log( `${aGlobal}.FVARS:`, fmtFVARS( JSON.stringify( _FVARS, "", 2 ).split("\n") ).join("\n") )
  function fmtFVARS( mFVars ) { return mFVars.map( a => a.replace( /: "/g, `:${''.padEnd(20-(a.indexOf(":")))} "` ) ) }
