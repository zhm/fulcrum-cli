"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
class ExternalContributionsApiClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }
    async getLinks(formId = null) {
        const url = new URL(`${this.baseUrl}/api/v1/links`);
        const params = {};
        if (formId) {
            params.form_id = formId;
        }
        url.search = new URLSearchParams(params).toString();
        try {
            const res = await fetch(url, {
                headers: {
                    'X-ApiToken': this.token,
                },
            });
            handleErrors(res);
            return await res.json();
        }
        catch (err) {
            console.error(err);
            return { links: [] };
        }
    }
    async createLink(requestBody) {
        const url = new URL(`${this.baseUrl}/api/v1/links`);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-ApiToken': this.token,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            handleErrors(res);
            return await res.json();
        }
        catch (err) {
            console.error(err);
            return {};
        }
    }
    async deleteLink(id, formId = null) {
        const url = new URL(`${this.baseUrl}/api/v1/links/${id}`);
        const params = {};
        if (formId) {
            params.form_id = formId;
        }
        url.search = new URLSearchParams(params).toString();
        try {
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-ApiToken': this.token,
                },
            });
            handleErrors(res);
            return await res.json();
        }
        catch (err) {
            console.error(err);
            return {};
        }
    }
    async regenerateLink(id, formId = null) {
        const url = new URL(`${this.baseUrl}/api/v1/links/${id}/regenerate`);
        const params = {};
        if (formId) {
            params.form_id = formId;
        }
        url.search = new URLSearchParams(params).toString();
        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'X-ApiToken': this.token,
                },
            });
            handleErrors(res);
            return await res.json();
        }
        catch (err) {
            console.error(err);
            return {};
        }
    }
}
exports.default = ExternalContributionsApiClient;
const handleErrors = (res) => {
    if (!res.ok) {
        throw Error(res.statusText);
    }
    return res;
};
//# sourceMappingURL=external-contributions-api-client.js.map