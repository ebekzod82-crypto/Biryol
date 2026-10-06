const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000, ROOT=__dirname, DB=path.join(ROOT,'data.json');
if(!fs.existsSync(DB)) fs.writeFileSync(DB,JSON.stringify({users:[],businesses:[],items:[]},null,2));
const read=()=>JSON.parse(fs.readFileSync(DB,'utf8')), write=d=>fs.writeFileSync(DB,JSON.stringify(d,null,2));
const id=()=>crypto.randomUUID();
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data));};
const body=req=>new Promise((resolve,reject)=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})});
const sendFile=(res,file)=>{const ext=path.extname(file);const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript; charset=utf-8','.json':'application/json'};res.writeHead(200,{'Content-Type':types[ext]||'text/plain'});res.end(fs.readFileSync(file));};
const seed=()=>{let d=read();if(!d.businesses.length){d.businesses=[{id:id(),name:'Siyob Market',category:'Oziq-ovqat',city:'Toshkent',rating:4.9,description:'Mahsulotlar va kundalik xaridlar',phone:'+998 90 000 00 01',mapVisible:true,plan:'standard'},{id:id(),name:'Pro Service',category:'Avtoservis',city:'Toshkent',rating:4.8,description:'Avto ta’mirlash va servis',phone:'+998 90 000 00 02',mapVisible:true,plan:'premium'}];d.items=[{id:id(),businessId:d.businesses[0].id,type:'product',name:'Organik asal',price:65000,unit:'dona'},{id:id(),businessId:d.businesses[1].id,type:'service',name:'Kompyuter diagnostikasi',price:100000,unit:'xizmat'}];write(d)}};seed();
async function route(req,res){const u=new URL(req.url,'http://localhost');let d=read();
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
 if(u.pathname.startsWith('/api/')){
  try{
   if(req.method==='GET'&&u.pathname==='/api/businesses'){let q=(u.searchParams.get('q')||'').toLowerCase(),cat=u.searchParams.get('category')||'';let list=d.businesses.filter(b=>(!q||(b.name+' '+b.category+' '+b.city).toLowerCase().includes(q))&&(!cat||b.category===cat));return json(res,200,list)}
   if(req.method==='GET'&&u.pathname==='/api/items'){let q=(u.searchParams.get('q')||'').toLowerCase();return json(res,200,d.items.filter(x=>!q||x.name.toLowerCase().includes(q)))}
   if(req.method==='POST'&&u.pathname==='/api/register'){let b=await body(req);if(!b.phone||!b.password)return json(res,400,{error:'Telefon va parol kerak'});if(d.users.some(x=>x.phone===b.phone))return json(res,409,{error:'Bu telefon allaqachon ro‘yxatdan o‘tgan'});let user={id:id(),phone:b.phone,password:b.password,role:'customer'};d.users.push(user);write(d);return json(res,201,{id:user.id,phone:user.phone,role:user.role})}
   if(req.method==='POST'&&u.pathname==='/api/login'){let b=await body(req),user=d.users.find(x=>x.phone===b.phone&&x.password===b.password);if(!user)return json(res,401,{error:'Telefon yoki parol noto‘g‘ri'});return json(res,200,{id:user.id,phone:user.phone,role:user.role})}
   if(req.method==='POST'&&u.pathname==='/api/businesses'){let b=await body(req);if(!b.name||!b.category)return json(res,400,{error:'Biznes nomi va kategoriya kerak'});let x={id:id(),name:b.name,category:b.category,city:b.city||'Toshkent',rating:0,description:b.description||'',phone:b.phone||'',mapVisible:false,plan:'free'};d.businesses.push(x);write(d);return json(res,201,x)}
   if(req.method==='POST'&&u.pathname==='/api/items'){let b=await body(req);if(!b.businessId||!b.name)return json(res,400,{error:'Biznes va nom kerak'});let x={id:id(),businessId:b.businessId,type:b.type||'product',name:b.name,price:Number(b.price||0),unit:b.unit||'dona'};d.items.push(x);write(d);return json(res,201,x)}
   if(req.method==='GET'&&u.pathname==='/api/health')return json(res,200,{ok:true,service:'Biryol API'});
   return json(res,404,{error:'API topilmadi'});
  }catch(e){return json(res,500,{error:'Server xatosi'})}
 }
 let file=u.pathname==='/'?'/index.html':u.pathname;file=path.join(ROOT,file);if(file.startsWith(ROOT)&&fs.existsSync(file)&&fs.statSync(file).isFile())return sendFile(res,file);res.writeHead(404);res.end('404');
}
http.createServer(route).listen(PORT,()=>console.log(`Biryol V3: http://localhost:${PORT}`));
