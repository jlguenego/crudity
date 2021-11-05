#!/usr/bin/env node

import {WebServer} from './../WebServer';
console.log('starting crudity...');
const webServer = new WebServer();
webServer.start();
