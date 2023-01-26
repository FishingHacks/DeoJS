import { Module } from '../../src';
import { TestController } from './test.controller';

@Module({ controllers: [TestController] })
export class TestModule {}