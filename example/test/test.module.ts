import { Module } from 'overnight';
import { TestController } from './test.controller';

@Module({ controllers: [TestController] })
export class TestModule {}