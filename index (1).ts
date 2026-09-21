import {corsHeaders,json} from "../_shared/http.ts";
Deno.serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});return json({ok:true,service:"ev-sales-backend",version:"4.5",at:new Date().toISOString()})});
