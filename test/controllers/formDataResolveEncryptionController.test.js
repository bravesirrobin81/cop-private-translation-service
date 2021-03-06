import nock from "nock";
import * as forms from "../forms";
import * as tasks from "../task";
import JSONPath from "jsonpath";
import httpMocks from "node-mocks-http";
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Controller', () => {
    beforeEach(() => {
        nock('http://localhost:8000')
            .get('/form?name=encryptedImgForm')
            .reply(200, forms.encryptedImgForm);
        nock('http://localhost:8000')
            .get('/form?name=encryptedImgFormWithoutVector')
            .reply(200, forms.encryptedImgFormWithoutVector);
        nock('http://localhost:8000')
            .get('/form?name=encryptedImgFormWithMissingEncryptionTag')
            .reply(200, forms.encryptedImgFormWithMissingEncryptionTag);

        nock('http://localhost:8000')
            .get('/form?name=encryptedImgFormWithoutSessionKey')
            .reply(200, forms.encryptedImgFormWithoutSessionKey);

        nock('http://localhost:9000')
            .get('/api/workflow/tasks/taskId')
            .reply(200, tasks.taskData);
        nock('http://localhost:9000')
            .get('/api/workflow/tasks/taskId/variables')
            .reply(200, tasks.taskVariables);
        nock('http://localhost:9000')
            .get('/api/workflow/process-instances/processInstanceId/variables')
            .reply(200, tasks.processVariablesWithEncryptedFields);

        nock('http://localhost:9001')
            .post('/rpc/staffdetails', {
                "argstaffemail": "email"
            })
            .reply(200, []);
        nock('http://localhost:9001')
            .get('/shift?email=eq.email')
            .reply(200, []);


    });

    it('can decrypt value before serving', async() => {

        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/translation/form/encryptedImgForm',
            params: {
                formName: "encryptedImgForm"
            },
            query: {
                taskId: "taskId",
                processInstanceId : 'processInstanceId'
            },
            kauth: {
                grant: {
                    access_token: {
                        token: "test-token",
                        content: {
                            session_state: "session_id",
                            email: "email",
                            preferred_username: "test",
                            given_name: "testgivenname",
                            family_name: "testfamilyname"
                        }
                    }

                }
            }
        });

        const response = await formTranslateController.getForm(request);
        const img = JSONPath.value(response, "$..components[?(@.key=='content')].html");
        const initialisationVector = JSONPath.value(response, "$..components..properties.initialisationVector");
        expect(initialisationVector).to.equal('W25/yzadEQNeV7jnZ3dnbA==');
        expect(img).to.equal(
            "<p>Image</p>\n\n<p><img src=\"data:image/png;base64,REFU\" style=\"height: 125px; width: 100px;\" /></p>\n");

    });
    it('returns encrypted value if sessionKey is missing', async() => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/translation/form/encryptedImgFormWithoutSessionKey',
            params: {
                formName: "encryptedImgFormWithoutSessionKey"
            },
            query: {
                taskId: "taskId",
                processInstanceId : 'processInstanceId'
            },
            kauth: {
                grant: {
                    access_token: {
                        token: "test-token",
                        content: {
                            session_state: "session_id",
                            email: "email",
                            preferred_username: "test",
                            given_name: "testgivenname",
                            family_name: "testfamilyname"
                        }
                    }

                }
            }
        });

        const response = await formTranslateController.getForm(request);
        const img = JSONPath.value(response, "$..components[?(@.key=='content')].html");
        expect(img).to.equal(
            "<p>Image</p>\n\n<p><img src=\"data:image/png;base64,zp+whBVVWiNmNVlLtw2qUTCqDQ==\" style=\"height: 125px; width: 100px;\" /></p>\n");
    });
    it('returns encrypted value if initialisationVector is missing', async() => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/translation/form/encryptedImgFormWithoutVector',
            params: {
                formName: "encryptedImgFormWithoutVector"
            },
            query: {
                taskId: "taskId",
                processInstanceId : 'processInstanceId'
            },
            kauth: {
                grant: {
                    access_token: {
                        token: "test-token",
                        content: {
                            session_state: "session_id",
                            email: "email",
                            preferred_username: "test",
                            given_name: "testgivenname",
                            family_name: "testfamilyname"
                        }
                    }

                }
            }
        });

        const response = await formTranslateController.getForm(request);
        const img = JSONPath.value(response, "$..components[?(@.key=='content')].html");
        expect(img).to.equal(
            "<p>Image</p>\n\n<p><img src=\"data:image/png;base64,zp+whBVVWiNmNVlLtw2qUTCqDQ==\" style=\"height: 125px; width: 100px;\" /></p>\n");
    });
    it('returns encrypted value if encrypted tag missing', async() => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/translation/form/encryptedImgFormWithMissingEncryptionTag',
            params: {
                formName: "encryptedImgFormWithMissingEncryptionTag"
            },
            query: {
                taskId: "taskId",
                processInstanceId : 'processInstanceId'
            },
            kauth: {
                grant: {
                    access_token: {
                        token: "test-token",
                        content: {
                            session_state: "session_id",
                            email: "email",
                            preferred_username: "test",
                            given_name: "testgivenname",
                            family_name: "testfamilyname"
                        }
                    }

                }
            }
        });

        const response = await formTranslateController.getForm(request);
        const img = JSONPath.value(response, "$..components[?(@.key=='content')].html");
        expect(img).to.equal(
            "<p>Image</p>\n\n<p><img src=\"data:image/png;base64,zp+whBVVWiNmNVlLtw2qUTCqDQ==\" style=\"height: 125px; width: 100px;\" /></p>\n");
    });
});
