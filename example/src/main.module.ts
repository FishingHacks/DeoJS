import { Module } from '../../src';
import { TestModule } from './test/test.module';

@Module({
    imports: [TestModule]
})
export class MainModule {}
