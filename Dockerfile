FROM node:20
CMD ["node", "-e", "setInterval(()=>{},1000);console.log('alive')"]
