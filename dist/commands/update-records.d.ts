export declare const command = "update-records";
export declare const description = "Update records";
export declare const builder: (yargs: any) => void;
export declare const handler: ({ endpoint, token, sql, form: formID, comment, field, value, where, }: {
    endpoint: any;
    token: any;
    sql: any;
    form: any;
    comment: any;
    field: any;
    value: any;
    where: any;
}) => Promise<void>;
