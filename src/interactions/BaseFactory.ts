import { BaseHandler } from '../..';

export class BaseFactory<H extends BaseHandler> {

    public readonly handler: H;

    constructor(handler: H) {
        this.handler = handler;
    }
}
