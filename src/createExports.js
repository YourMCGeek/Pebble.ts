const { readdirSync, writeFileSync } = require('fs-extra');

const classFolders = ['clients'];
const additionalExports = [
  'export * from "./functions/util";',
  'export * from "./functions/ApiRequestHandler";',
  'export { Wrapper } from "./Wrapper";',
];

const res = ['/* Auto generated */'];

for (const folder of classFolders) {
  res.push(`\n/* ${folder} */`);
  const files = readdirSync(`./src/${folder}`).filter((file) => file.endsWith('.ts'));
  for (const file of files) {
    res.push(`export { ${file.split('.')[0]} } from "./${folder}/${file.split('.')[0]}";`);
  }
}

res.push(`\n/* types/account */`);
const accountFiles = readdirSync(`./src/types/account`).filter((file) => file.endsWith('.ts'));
for (const file of accountFiles) {
  res.push(`export * from "./types/account/${file.split('.')[0]}";`);
}

res.push(`\n/* types/server */`);
const serverFiles = readdirSync(`./src/types/server`).filter((file) => file.endsWith('.ts'));
for (const file of serverFiles) {
  res.push(`export * from "./types/server/${file.split('.')[0]}";`);
}

res.push(`\n/* types/server/minecraft */`);
const minecraftFiles = readdirSync(`./src/types/server/minecraft`).filter((file) => file.endsWith('.ts'));
for (const file of minecraftFiles) {
  res.push(`export * from "./types/server/minecraft/${file.split('.')[0]}";`);
}

res.push(`\n/* types/misc */`);
const miscFiles = readdirSync(`./src/types/misc`).filter((file) => file.endsWith('.ts'));
for (const file of miscFiles) {
  res.push(`export * from "./types/misc/${file.split('.')[0]}";`);
}

res.push('\n/* Additional */');
res.push(...additionalExports);

writeFileSync('./src/index.ts', res.join('\n'));
console.log(`Successfully created ${res.length} exports`);
