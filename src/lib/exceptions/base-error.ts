export class BaseError extends Error {
    constructor(
        message: string,
        public code: string,
        public origin: string,
        public fileName: string,
        public functionName: string
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

