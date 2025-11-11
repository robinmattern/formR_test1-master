 import   express  from 'express';
 import   cors     from 'cors';
 import { router } from './routes.mjs';

  const APP_VERSION    = process.env.APP_VERSION || process.FVARS.APP_VERSION 
  const SOURCES_DIR    = process.FVARS.SOURCES_DIR
  const SERVER_API_URL = process.FVARS.SERVER_API_URL
  const PORT           = SERVER_API_URL.match( /:(\d+)/ )[1] * 1;
  
  const app = express();
  
     // Middleware
        app.use( cors() );
        app.use( express.json() );

     // Static file serving
        app.use('/sources', express.static( SOURCES_DIR ));

     // Routes
        app.use('/api/docs', router);
        app.get('/',   (req, res) => {
            res.send( `<h4 style="margin:-10px 0 0 20px;">** This is an API Server at: ${SERVER_API_URL}</h4>` );
            })

     // Start server
        app.listen(PORT, () => {
            console.log( `  Server is running at ${SERVER_API_URL} (v${APP_VERSION})` );
            });