const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;
const HEADERS = {"Content-Type":"application/json","apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY};

exports.handler = async (event) => {
    const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS"};
    if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:cors,body:""};

    // GET - fetch all events
    if (event.httpMethod === "GET") {
          try {
                  const r = await fetch(SUPA_URL+"/rest/v1/events?select=*&order=date.asc",{headers:HEADERS});
                  const data = await r.json();
                  return {statusCode:200,headers:cors,body:JSON.stringify({events:data})};
          } catch(e) {return {statusCode:500,headers:cors,body:JSON.stringify({error:e.message})};}
    }

    // POST - sync events (full replace or append)
    if (event.httpMethod === "POST") {
          try {
                  const body = JSON.parse(event.body);
                  if (!body.events) return {statusCode:400,headers:cors,body:JSON.stringify({error:"events required"})};

            // If sync:true, delete ALL existing events first, then insert fresh list
            if (body.sync) {
                      await fetch(SUPA_URL+"/rest/v1/events?id=not.is.null",{method:"DELETE",headers:{...HEADERS,"Prefer":"return=minimal"}});
                      if (body.events.length > 0) {
                                  const r = await fetch(SUPA_URL+"/rest/v1/events",{method:"POST",headers:{...HEADERS,"Prefer":"return=minimal"},body:JSON.stringify(body.events)});
                                  if (!r.ok) {const t=await r.text();return {statusCode:r.status,headers:cors,body:t};}
                      }
                      return {statusCode:200,headers:cors,body:JSON.stringify({synced:body.events.length})};
            }

            // Default: upsert events (add new, update existing by id)
            const r = await fetch(SUPA_URL+"/rest/v1/events",{method:"POST",headers:{...HEADERS,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body.events)});
                  if (!r.ok) {const t=await r.text();return {statusCode:r.status,headers:cors,body:t};}
                  return {statusCode:200,headers:cors,body:JSON.stringify({saved:body.events.length})};
          } catch(e) {return {statusCode:500,headers:cors,body:JSON.stringify({error:e.message})};}
    }

    // DELETE - remove specific events by id
    if (event.httpMethod === "DELETE") {
          try {
                  const body = JSON.parse(event.body);
                  if (!body.ids || !body.ids.length) return {statusCode:400,headers:cors,body:JSON.stringify({error:"ids required"})};
                  const idList = body.ids.map(id=>"\""+id+"\"").join(",");
                  const r = await fetch(SUPA_URL+"/rest/v1/events?id=in.("+idList+")",{method:"DELETE",headers:{...HEADERS,"Prefer":"return=minimal"}});
                  return {statusCode:200,headers:cors,body:JSON.stringify({deleted:body.ids.length})};
          } catch(e) {return {statusCode:500,headers:cors,body:JSON.stringify({error:e.message})};}
    }

    return {statusCode:405,headers:cors,body:"Method not allowed"};
};
