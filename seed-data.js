const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const os = require('os');
const startDirectory = process.argv[2];

const packages = []
const walk = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.resolve(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isFile()) {
        if(file === 'package.json') {
           packages.push(dir);
        } 
      } else if (stat && stat.isDirectory()) {
        walk(filePath);
      }
    });
  };

const seed = () => {
    walk(startDirectory);

    packages.forEach(package=>{
        const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
        console.log(`installing package from ${package}`)
        cp.spawnSync(npmCmd, ['i'], { env: process.env, cwd: package, stdio: 'inherit' })
    })
}

seed()