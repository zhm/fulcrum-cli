export declare const command = "query";
export declare const description = "Run query";
export declare const builder: (yargs: any) => void;
export declare const handler: ({ endpoint, token, sql }: {
    endpoint: any;
    token: any;
    sql: any;
}) => Promise<void>;
