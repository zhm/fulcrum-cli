export declare const command = "update-calculations";
export declare const description = "Update calculation fields";
export declare const builder: (yargs: any) => void;
export declare const handler: ({ endpoint, token, sql, form: formID, comment, }: {
    endpoint: any;
    token: any;
    sql: any;
    form: any;
    comment: any;
}) => Promise<void>;
