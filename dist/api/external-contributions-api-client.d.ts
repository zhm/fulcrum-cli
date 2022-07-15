export default class ExternalContributionsApiClient {
    baseUrl: string;
    token: string;
    constructor(baseUrl: string, token: string);
    getLinks(formId?: any): Promise<any>;
    createLink(requestBody: any): Promise<any>;
    deleteLink(id: any, formId?: any): Promise<any>;
    regenerateLink(id: any, formId?: any): Promise<any>;
}
