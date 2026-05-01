const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({select:{id:true,email:true}}).then(u=>console.log(JSON.stringify(u,null,2))).then(()=>p.$disconnect());