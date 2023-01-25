import { join } from 'path';
import { Server } from '../src';
import { MainModule } from './main.module';

class CustomServer extends Server {
    constructor() {
        super(true, {
            renderer: 'ejs',
            viewsDirectory: join(__dirname, 'views'),
        });

        this.addModule(MainModule);
    }
}

new CustomServer().start();
