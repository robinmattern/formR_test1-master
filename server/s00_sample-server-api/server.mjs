 import   express  from 'express';
 import   cors     from 'cors';
 import  './_config.js'

  const APP_FOLDER     = process.FVARS.APP_FOLDER 
  const APP_VERSION    = process.FVARS.APP_VERSION 
  const SERVER_API_URL = process.FVARS.SERVER_API_URL
  const PORT = SERVER_API_URL.match( /:(\d+)/ )[1] * 1;

  const app = express();
        app.use( cors() );

        app.get('/api', (req, res) => {
            res.send( `<h4 style="margin:-10px 0 0 20px;">.. from the formR ${APP_FOLDER} at: ${SERVER_API_URL}</h4>` );
            });
        app.get('/',   (req, res) => {
            res.send( `<h4 style="margin:-10px 0 0 20px;">** This is an API Server at: ${SERVER_API_URL}</h4>` );
            })
        app.listen( PORT, () => {
            console.log(`  Server is running at ${SERVER_API_URL} (${APP_VERSION})`);
            });