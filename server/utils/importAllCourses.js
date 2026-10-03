require('dotenv').config();

const { spawn } = require('child_process');
const path = require('path');

const IMPORTERS = [
  {
    name: 'YouTube',
    file: 'autoCourseImporter.js'
  },
  {
    name: 'SWAYAM',
    file: 'swayamCourseImporter.js'
  },
  {
    name: 'freeCodeCamp',
    file: 'freeCodeCampCourseImporter.js'
  },
  {
    name: 'Microsoft Learn',
    file: 'microsoftLearnCourseImporter.js'
  }
];

function runImporter(importer) {
  return new Promise((resolve, reject) => {
    console.log('\n======================================');
    console.log(`Starting ${importer.name} importer`);
    console.log('======================================\n');

    const filePath = path.join(
      __dirname,
      importer.file
    );

    const child = spawn(
      process.execPath,
      [filePath],
      {
        stdio: 'inherit',
        env: process.env
      }
    );

    child.on('close', code => {
      if (code === 0) {
        console.log(
          `\n${importer.name} importer completed successfully.`
        );
        resolve();
      } else {
        console.error(
          `\n${importer.name} importer failed with code ${code}.`
        );

        // Do not stop other platform importers.
        resolve();
      }
    });

    child.on('error', error => {
      console.error(
        `\n${importer.name} importer error:`,
        error.message
      );

      resolve();
    });
  });
}

async function importAllCourses() {
  console.log('\n======================================');
  console.log('SKILLHUB AUTOMATIC COURSE IMPORT');
  console.log('======================================');

  for (const importer of IMPORTERS) {
    await runImporter(importer);
  }

  console.log('\n======================================');
  console.log('ALL COURSE IMPORTERS FINISHED');
  console.log('======================================');
}

importAllCourses().catch(error => {
  console.error('\nMaster importer failed:');
  console.error(error.message);
  process.exit(1);
});
