export declare const command = "delete-records";
export declare const description = "Delete records";
export declare const builder: (yargs: any) => void;
export declare const handler: ({ endpoint, token, sql, form: formID, comment, where, }: {
    endpoint: any;
    token: any;
    sql: any;
    form: any;
    comment: any;
    where: any;
}) => Promise<void>;
