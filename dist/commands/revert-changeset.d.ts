export declare const command = "revert-changeset";
export declare const description = "Revert a changeset";
export declare const builder: (yargs: any) => void;
export declare const handler: ({ endpoint, token, changesetId, }: {
    endpoint: any;
    token: any;
    changesetId: any;
}) => Promise<void>;
