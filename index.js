#!/usr/bin/env node
'use strict';

const os = require('os');
const path = require('path');
const program = require('commander');
const pkg = require('./package.json');
const sqlite3 = require('sqlite3').verbose();

let getDefaultThunderPath = () => {
    if (os.arch() === 'x64') {
        return 'C:\\Program Files (x86)\\Thunder Network\\Thunder\\';
    } else {
        return 'C:\\Program Files\\Thunder Network\\Thunder\\';
    }
}
let crackAccelerate = (options) => {
    let thunder_path = options.path;
    if (!options.path)
        thunder_path = getDefaultThunderPath();
    let dbPath = path.join(thunder_path, "Profiles/TaskDb.dat");
    let db = new sqlite3.Database(dbPath);

    db.serialize(function () {
        db.each("SELECT name FROM sqlite_master WHERE type='table';", function (err, row) {
            let tableName = row.name;

            if (tableName.indexOf('AccelerateTaskMap') !== -1 && tableName.indexOf('superspeed') !== -1) {
                db.each("SELECT COUNT(*) FROM " + tableName + ";", function (err, row) {
                    if (err) {
                        console.log(err);
                    }
                    let count = row['COUNT(*)'];
                    console.log('Row Count: ' + count);

                    let stmt = db.prepare("UPDATE " + tableName + " SET UserData = ? WHERE LocalTaskId = ? AND AccelerateTaskId = ? AND LocalSubFileIndex = ?");
                    let index = 1;
                    db.each("SELECT * FROM " + tableName + ";", function (err, row) {
                        if (err) {
                            console.log(err);
                        }
                        let localTaskId = row.LocalTaskId;
                        let accelerateTaskId = row.AccelerateTaskId;
                        let localSubFileIndex = row.LocalSubFileIndex;
                        let userData = JSON.parse(row.UserData.toString());
                        if (userData.Result != 0) {

                            userData.Result = 0;

                            stmt.bind(JSON.stringify(userData), localTaskId, accelerateTaskId, localSubFileIndex);
                            stmt.run(function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Cracked: ' + index + ' of ' + count);
                                }
                                index++;
                            });
                        } else {
                            console.log('Ignored: ' + index + ' of ' + count);
                            index++;
                        }
                        // stmt.finalize();
                    });
                });

            }
        });
    });
    // db.close();
};


program
    .version(pkg.version)
    .usage('[options]')
    .option('-p, --path [thunder_path]', 'Path of thunder program.')
    //.action(crackAccelerate);

program.parse(process.argv);
crackAccelerate(program);
// if program was called with no arguments, show help.
// if (program.args.length === 0) program.help();